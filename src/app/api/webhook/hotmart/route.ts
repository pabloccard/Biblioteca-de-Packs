import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmailWithFailover } from '@/lib/resend-failover'
import { createCustomizationFolders } from '@/lib/google-drive'
import { sanitizePhoneNumber } from '@/lib/phone-sanitizer'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Validação de Segurança (HOTTOK)
    const hottokEnviado = (body.hottok || request.headers.get('x-hotmart-hottok'))?.trim()
    if (!hottokEnviado || hottokEnviado !== process.env.HOTMART_HOTTOK?.trim()) {
      console.error('❌ Webhook: HOTTOK inválido')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 2. Extrair dados do payload
    const payload = body.data || body
    const email = (payload.buyer?.email || payload.email)?.trim().toLowerCase()
    const productId = payload.product?.id?.toString() || payload.productId?.toString()
    const status = (payload.purchase?.status || payload.status)?.toUpperCase()
    const buyerName = payload.buyer?.name || payload.buyer?.first_name || ''
    const event = body.event || 'UNKNOWN'

    // Extrair país e telefone do comprador (suporta Hotmart 2.0 e variações)
    const buyerCountry =
      payload.buyer?.address?.country ||
      payload.purchase?.checkout_country?.name ||
      payload.buyer?.address?.country_iso ||
      payload.purchase?.checkout_country?.iso ||
      null

    const baseCheckoutPhone = payload.buyer?.checkout_phone || payload.checkout_phone || null
    const checkoutPhoneCode = payload.buyer?.checkout_phone_code || payload.checkout_phone_code || null
    let combinedCheckoutPhone = baseCheckoutPhone
    if (baseCheckoutPhone && checkoutPhoneCode) {
      const phoneDigits = String(baseCheckoutPhone).replace(/\D/g, '')
      const codeDigits = String(checkoutPhoneCode).replace(/\D/g, '')
      if (codeDigits && phoneDigits && phoneDigits.length < 10 && !phoneDigits.startsWith(codeDigits)) {
        combinedCheckoutPhone = `${codeDigits}${phoneDigits}`
      }
    }

    const rawPhone =
      combinedCheckoutPhone ||
      payload.buyer?.phone ||
      payload.buyer?.cellphone ||
      (payload.buyer?.phone_number
        ? `${payload.buyer?.phone_local_code || ''}${payload.buyer?.phone_number}`
        : null) ||
      (payload.phone_checkout_number
        ? `${payload.phone_checkout_local_code || ''}${payload.phone_checkout_number}`
        : null) ||
      payload.phone ||
      null

    const sanitizeResult = rawPhone ? sanitizePhoneNumber(rawPhone, buyerCountry) : null
    const cleanPhone = sanitizeResult?.isValid ? sanitizeResult.cleanPhone : null

    // Log detalhado para debug
    const phoneLog = cleanPhone
      ? cleanPhone
      : rawPhone
        ? `(inválido: "${rawPhone}" - ${sanitizeResult?.reason || 'desconhecido'})`
        : '(sem telefone no payload)'
    console.log(`📥 Webhook recebido: event=${event} | productId=${productId} | email=${email} | status=${status} | buyer=${buyerName} | phone=${phoneLog} | country=${buyerCountry || '(não informado)'}`)

    if (!email) {
      return NextResponse.json({ error: 'Email não encontrado no payload' }, { status: 400 })
    }

    // 3. Validar productId
    if (!productId || productId === '0' || productId === 'undefined' || productId === 'null') {
      console.warn(`⚠️ Webhook: productId inválido "${productId}" para email=${email}`)
      return NextResponse.json({ success: true, message: `productId "${productId}" ignorado` })
    }

    // Rejeitar productId que não é numérico (ex: "--", "-", "test", etc.)
    if (!/^\d+$/.test(productId)) {
      console.warn(`⚠️ Webhook: productId não-numérico "${productId}" para email=${email}`)
      return NextResponse.json({ error: `productId "${productId}" inválido` }, { status: 400 })
    }

    // 4. Mapear hotmart_id → pack ou complemento no banco
    const { data: pack, error: packError } = await supabaseAdmin
      .from('packs')
      .select('id, name, language, parent_pack_id, hotmart_id')
      .eq('hotmart_id', productId)
      .is('parent_pack_id', null)
      .single()

    // Se não encontrou como pack principal, tentar como complemento (verificando ID principal e secundário)
    let complement: { id: string; pack_id: string; type: string; hotmart_id: string | null; hotmart_id_secondary?: string | null } | null = null
    let complementParentPack: { id: string; name: string; language: string } | null = null

    if (!pack) {
      // 1. Match direto por hotmart_id ou hotmart_id_secondary
      const { data: comp } = await supabaseAdmin
        .from('pack_complements')
        .select('id, pack_id, type, hotmart_id, hotmart_id_secondary')
        .or(`hotmart_id.eq.${productId},hotmart_id_secondary.eq.${productId}`)
        .maybeSingle()

      let matchedComp = comp

      // 2. Fallback: caso haja múltiplos IDs separados por vírgula ou espaço
      if (!matchedComp) {
        const { data: potentialComps } = await supabaseAdmin
          .from('pack_complements')
          .select('id, pack_id, type, hotmart_id, hotmart_id_secondary')
          .or(`hotmart_id.ilike.%${productId}%,hotmart_id_secondary.ilike.%${productId}%`)

        if (potentialComps && potentialComps.length > 0) {
          matchedComp = potentialComps.find(c => {
            const ids = [
              ...(c.hotmart_id ? c.hotmart_id.split(/[\s,;/]+/) : []),
              ...(c.hotmart_id_secondary ? c.hotmart_id_secondary.split(/[\s,;/]+/) : []),
            ].map(s => s.trim())
            return ids.includes(productId)
          }) || null
        }
      }

      if (matchedComp) {
        complement = matchedComp
        const { data: parentPack } = await supabaseAdmin
          .from('packs')
          .select('id, name, language')
          .eq('id', matchedComp.pack_id)
          .single()
        complementParentPack = parentPack
      }
    }

    // Se não encontrou nem como pack nem como complemento
    if (!pack && !complement) {
      // Fallback: check child packs (legacy) for backward compatibility
      const { data: legacyPack } = await supabaseAdmin
        .from('packs')
        .select('id, name, language, parent_pack_id, hotmart_id')
        .eq('hotmart_id', productId)
        .single()

      if (!legacyPack) {
        console.warn(`⚠️ Webhook: Produto ${productId} não mapeado a nenhum pack ou complemento`)
        return NextResponse.json({ error: `Produto ${productId} não mapeado` }, { status: 400 })
      }

      // Handle legacy child pack as complement purchase
      if (legacyPack.parent_pack_id) {
        let { data: comp } = await supabaseAdmin
          .from('pack_complements')
          .select('id, pack_id, type, hotmart_id, hotmart_id_secondary')
          .eq('pack_id', legacyPack.parent_pack_id)
          .or(`hotmart_id.eq.${productId},hotmart_id_secondary.eq.${productId}`)
          .maybeSingle()

        if (!comp) {
          const { data: potentialComps } = await supabaseAdmin
            .from('pack_complements')
            .select('id, pack_id, type, hotmart_id, hotmart_id_secondary')
            .eq('pack_id', legacyPack.parent_pack_id)
            .or(`hotmart_id.ilike.%${productId}%,hotmart_id_secondary.ilike.%${productId}%`)

          if (potentialComps && potentialComps.length > 0) {
            comp = potentialComps.find(c => {
              const ids = [
                ...(c.hotmart_id ? c.hotmart_id.split(/[\s,;/]+/) : []),
                ...(c.hotmart_id_secondary ? c.hotmart_id_secondary.split(/[\s,;/]+/) : []),
              ].map(s => s.trim())
              return ids.includes(productId)
            }) || null
          }
        }

        if (comp) {
          complement = comp
          const { data: parentPack } = await supabaseAdmin
            .from('packs')
            .select('id, name, language')
            .eq('id', comp.pack_id)
            .single()
          complementParentPack = parentPack
        }
      }

      if (!complement) {
        console.warn(`⚠️ Webhook: Produto ${productId} é pack filho legado sem complemento correspondente`)
        return NextResponse.json({ error: `Produto ${productId} não mapeado` }, { status: 400 })
      }
    }

    const isComplementPurchase = !!complement
    const effectivePack = pack || complementParentPack
    const effectivePackId = isComplementPurchase ? complement!.pack_id : pack!.id

    const matchedSource = complement
      ? (complement.hotmart_id === productId ? 'ID principal' : 'ID secundário')
      : 'ID principal'

    console.log(isComplementPurchase
      ? `🔗 Webhook: productId=${productId} → complemento ${complement!.type} do pack "${effectivePack?.name}" (${matchedSource})`
      : `🔗 Webhook: productId=${productId} → pack_id=${pack!.id} (${pack!.name})`
    )

    // 4. Lógica de REMOÇÃO (reembolso, chargeback, etc.)
    const statusParaRemover = ['DISPUTE', 'REFUNDED', 'CHARGEBACK', 'CANCELLED', 'EXPIRED']
    if (statusParaRemover.includes(status)) {
      const { data: member } = await supabaseAdmin
        .from('members')
        .select('id')
        .eq('email', email)
        .single()

      if (member) {
        if (isComplementPurchase) {
          await supabaseAdmin
            .from('complement_purchases')
            .delete()
            .eq('member_id', member.id)
            .eq('complement_id', complement!.id)
          console.log(`🚫 Complemento removido: ${email} → Complemento ${complement!.type} (status: ${status})`)
        } else {
          await supabaseAdmin
            .from('member_purchases')
            .delete()
            .eq('member_id', member.id)
            .eq('pack_id', pack!.id)
          console.log(`🚫 Acesso removido: ${email} → Pack "${pack!.name}" (status: ${status})`)
        }
      }

      return NextResponse.json({ success: true, message: `Acesso removido (${status})` })
    }

    // 5. Lógica de LIBERAÇÃO
    const statusParaLiberar = ['APPROVED', 'COMPLETE', 'COMPLETED']
    if (statusParaLiberar.includes(status)) {
      const packLanguage = effectivePack?.language || 'pt'

      // Verificar se membro já existe
      const { data: existingMember } = await supabaseAdmin
        .from('members')
        .select('id, name, phone, country')
        .eq('email', email)
        .maybeSingle()

      let memberId: string

      if (existingMember) {
        memberId = existingMember.id
        
        // Atualizar campos caso ainda estejam vazios ou se houver novo telefone/país
        const updates: Record<string, any> = {}
        if (!existingMember.name && buyerName) {
          updates.name = buyerName
        }
        if (cleanPhone && (!existingMember.phone || existingMember.phone !== cleanPhone)) {
          updates.phone = cleanPhone
        }
        if (buyerCountry && !existingMember.country) {
          updates.country = buyerCountry
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabaseAdmin
            .from('members')
            .update(updates)
            .eq('id', memberId)

          if (updateError) {
            console.error(`❌ Erro ao atualizar membro (${email}):`, updateError.message)
          } else {
            console.log(`👤 Membro atualizado (${email}):`, updates)
          }
        }
      } else {
        // Criar novo membro já com telefone e país
        const { data: newMember, error: createError } = await supabaseAdmin
          .from('members')
          .insert({
            email,
            name: buyerName,
            phone: cleanPhone || null,
            country: buyerCountry || null,
            language: packLanguage,
            unsubscribe_token: crypto.randomUUID(),
          })
          .select('id')
          .single()

        if (createError) {
          // Concorrência / Race Condition:
          // Se duas requisições simultâneas da Hotmart (ex: Produto Principal + Order Bump)
          // tentaram criar o mesmo membro no mesmo milissegundo, recuperar o membro criado pela outra requisição
          const { data: existingAfterRace } = await supabaseAdmin
            .from('members')
            .select('id, name, phone, country')
            .eq('email', email)
            .maybeSingle()

          if (existingAfterRace) {
            memberId = existingAfterRace.id
            console.log(`⚡ Concorrência resolvida: membro já criado simultaneamente por outra requisição (${email}, memberId=${memberId})`)

            // Atualizar campos caso a requisição concorrente ainda não tivesse dados
            const raceUpdates: Record<string, any> = {}
            if (!existingAfterRace.name && buyerName) raceUpdates.name = buyerName
            if (cleanPhone && (!existingAfterRace.phone || existingAfterRace.phone !== cleanPhone)) raceUpdates.phone = cleanPhone
            if (buyerCountry && !existingAfterRace.country) raceUpdates.country = buyerCountry
            if (Object.keys(raceUpdates).length > 0) {
              const { error: raceUpdateErr } = await supabaseAdmin.from('members').update(raceUpdates).eq('id', memberId)
              if (raceUpdateErr) {
                console.error(`❌ Erro ao atualizar membro após concorrência (${email}):`, raceUpdateErr.message)
              }
            }
          } else {
            console.error('❌ Erro real ao criar membro:', createError.message)
            return NextResponse.json({ error: 'Erro ao criar membro' }, { status: 500 })
          }
        } else if (newMember) {
          memberId = newMember.id
          console.log(`✨ Novo membro criado: ${email} | telefone=${cleanPhone || '(sem telefone)'} | país=${buyerCountry || '(não informado)'}`)
        } else {
          return NextResponse.json({ error: 'Erro ao identificar membro' }, { status: 500 })
        }
      }

      if (isComplementPurchase) {
        // Verificar se complemento já foi liberado anteriormente (idempotência contra retries)
        const { data: existingCompPurchase } = await supabaseAdmin
          .from('complement_purchases')
          .select('id')
          .eq('member_id', memberId)
          .eq('complement_id', complement!.id)
          .maybeSingle()

        if (existingCompPurchase) {
          console.log(`ℹ️ Webhook: Complemento "${complement!.type}" já liberado para ${email}. Ignorando reprocessamento duplicado.`)
          return NextResponse.json({ success: true, message: 'Complemento já liberado anteriormente.' })
        }

        // Registrar compra do complemento (idempotente contra duplicidade concorrente)
        const { error: compError } = await supabaseAdmin
          .from('complement_purchases')
          .insert({ member_id: memberId, complement_id: complement!.id })

        if (compError && compError.code !== '23505') {
          console.error('❌ Erro ao registrar complemento:', compError.message)
          return NextResponse.json({ error: 'Erro ao registrar compra' }, { status: 500 })
        }

        // Também garantir acesso ao pack pai (tolerante à concorrência se o pack principal estiver sendo inserido no mesmo instante)
        const { data: existingPackPurchase } = await supabaseAdmin
          .from('member_purchases')
          .select('id')
          .eq('member_id', memberId)
          .eq('pack_id', effectivePackId)
          .maybeSingle()

        if (!existingPackPurchase) {
          const { error: parentPackErr } = await supabaseAdmin
            .from('member_purchases')
            .insert({ member_id: memberId, pack_id: effectivePackId })

          if (parentPackErr && parentPackErr.code !== '23505') {
            console.warn('⚠️ Aviso ao garantir pack pai para complemento:', parentPackErr.message)
          }
        }

        // Se o complemento for do tipo 'custom' (Pacote Premium Completo):
        // Desbloquear também todos os outros complementos ativos do pack (ex: Stories)
        // e quaisquer packs filhos legados
        if (complement!.type === 'custom') {
          // 1. Desbloquear todos os outros complementos do pack pai (em lote único)
          const { data: otherComplements } = await supabaseAdmin
            .from('pack_complements')
            .select('id, type')
            .eq('pack_id', effectivePackId)
            .neq('id', complement!.id)

          if (otherComplements && otherComplements.length > 0) {
            const compIds = otherComplements.map(c => c.id)
            const { data: existingComps } = await supabaseAdmin
              .from('complement_purchases')
              .select('complement_id')
              .eq('member_id', memberId)
              .in('complement_id', compIds)

            const existingCompSet = new Set((existingComps || []).map(r => r.complement_id))
            const toInsertComps = otherComplements
              .filter(c => !existingCompSet.has(c.id))
              .map(c => ({ member_id: memberId, complement_id: c.id }))

            if (toInsertComps.length > 0) {
              await supabaseAdmin.from('complement_purchases').insert(toInsertComps)
              console.log(`🎁 Pacote Premium: liberados ${toInsertComps.length} complementos em lote para ${email}`)
            }
          }

          // 2. Desbloquear packs filhos legados se houver (em lote único)
          const { data: childPacks } = await supabaseAdmin
            .from('packs')
            .select('id')
            .eq('parent_pack_id', effectivePackId)

          if (childPacks && childPacks.length > 0) {
            const childIds = childPacks.map(c => c.id)
            const { data: existingChildren } = await supabaseAdmin
              .from('member_purchases')
              .select('pack_id')
              .eq('member_id', memberId)
              .in('pack_id', childIds)

            const existingChildSet = new Set((existingChildren || []).map(r => r.pack_id))
            const toInsertChildren = childPacks
              .filter(c => !existingChildSet.has(c.id))
              .map(c => ({ member_id: memberId, pack_id: c.id }))

            if (toInsertChildren.length > 0) {
              await supabaseAdmin.from('member_purchases').insert(toInsertChildren)
              console.log(`🎁 Pacote Premium: liberados ${toInsertChildren.length} packs legados em lote para ${email}`)
            }
          }

          // 3. Garantir pedido em customization_orders
          const { data: existingOrder } = await supabaseAdmin
            .from('customization_orders')
            .select('id')
            .eq('member_id', memberId)
            .eq('complement_id', complement!.id)
            .maybeSingle()

          if (!existingOrder) {
            let driveDeliveryLinks: Record<string, string> = {}
            let clientFolderId: string = ''

            try {
              const folders = await createCustomizationFolders(
                buyerName || email,
                effectivePack?.name || 'Pack'
              )
              driveDeliveryLinks = {
                feed_url: folders.feedFolderUrl,
                stories_url: folders.storiesFolderUrl,
                client_folder_url: folders.clientFolderUrl,
                feed_folder_id: folders.feedFolderId,
                stories_folder_id: folders.storiesFolderId,
              }
              clientFolderId = folders.clientFolderId
              console.log(`📁 Pastas no Google Drive criadas para ${buyerName || email}: Feed=${folders.feedFolderId}, Stories=${folders.storiesFolderId}`)
            } catch (driveError) {
              console.warn('⚠️ Não foi possível criar pastas no Google Drive no webhook:', driveError)
            }

            const { data: newOrder, error: orderError } = await supabaseAdmin
              .from('customization_orders')
              .insert({
                member_id: memberId,
                complement_id: complement!.id,
                pack_id: effectivePackId,
                client_name: buyerName || '',
                client_email: email,
                client_whatsapp: cleanPhone || payload.buyer?.checkout_phone || payload.buyer?.phone || null,
                status: 'waiting',
                delivery_links: driveDeliveryLinks,
                delivery_drive_folder_id: clientFolderId || null,
                access_token: crypto.randomUUID(),
                source_drive_folder_id: '',
              })
              .select('id, access_token')
              .maybeSingle()

            if (orderError) {
              console.error('❌ Erro ao criar pedido de personalização no webhook:', orderError.message)
            } else if (newOrder) {
              console.log(`📝 Pedido de personalização criado com sucesso: order_id=${newOrder.id} (status: waiting)`)

              // Paralelizar tarefas assíncronas do pedido (Telegram + Popular Artes)
              await Promise.allSettled([
                (async () => {
                  try {
                    const { populateOrderArtsFromPack } = await import('@/app/admin/customization-actions')
                    await populateOrderArtsFromPack(newOrder.id, effectivePackId, supabaseAdmin)
                    console.log(`🎨 Artes do pack populadas com sucesso para o pedido ${newOrder.id}`)
                  } catch (artsErr) {
                    console.warn('⚠️ Não foi possível popular artes do pack no webhook:', artsErr)
                  }
                })(),
                (async () => {
                  try {
                    const { notifyNewCustomizationOrder } = await import('@/lib/telegram')
                    const { generateCustomizeSlug } = await import('@/lib/customization-slug')
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bibliotecadepacks.com.br'
                    const customizeSlug = generateCustomizeSlug(buyerName, newOrder.access_token)
                    const customizeLink = `${appUrl}/customize/${customizeSlug}`

                    await notifyNewCustomizationOrder({
                      orderId: newOrder.id,
                      clientName: buyerName || '',
                      clientWhatsapp: cleanPhone || payload.buyer?.checkout_phone || payload.buyer?.phone || null,
                      clientEmail: email,
                      packName: effectivePack?.name || 'Pack',
                      customizeLink,
                    })
                    console.log(`📱 Notificação no Telegram enviada para o administrador`)
                  } catch (telegramErr) {
                    console.warn('⚠️ Não foi possível enviar notificação no Telegram:', telegramErr)
                  }
                })(),
              ])
            }
          } else {
            console.log(`ℹ️ Pedido de personalização já existe para este membro: order_id=${existingOrder.id}`)
          }
        }

        console.log(`✅ Complemento liberado: ${email} → ${complement!.type} do pack "${effectivePack?.name}"`)
      } else {
        // Registrar compra do pack principal (com checagem de idempotência contra retries)
        const { data: existingPurchase } = await supabaseAdmin
          .from('member_purchases')
          .select('id')
          .eq('member_id', memberId)
          .eq('pack_id', pack!.id)
          .maybeSingle()

        if (existingPurchase) {
          console.log(`ℹ️ Webhook: Acesso ao pack "${pack!.name}" já liberado para ${email}. Ignorando reprocessamento duplicado.`)
          return NextResponse.json({ success: true, message: 'Pack já liberado anteriormente.' })
        }

        const { error: purchaseError } = await supabaseAdmin
          .from('member_purchases')
          .insert({ member_id: memberId, pack_id: pack!.id })

        if (purchaseError) {
          // Se for erro de duplicidade (código 23505), a requisição concorrente do Order Bump
          // ou um retry já garantiu o acesso ao pack pai — consideramos um sucesso idempotente!
          if (purchaseError.code === '23505' || purchaseError.message?.includes('duplicate key') || purchaseError.message?.includes('unique')) {
            console.log(`ℹ️ Webhook: Acesso ao pack já liberado concorrentemente para ${email}`)
          } else {
            console.error('❌ Erro ao registrar compra:', purchaseError.message)
            return NextResponse.json({ error: 'Erro ao registrar compra' }, { status: 500 })
          }
        }

        console.log(`✅ Acesso liberado: ${email} → Pack "${pack!.name}"`)
      }

      // 6. Enviar e-mail de boas-vindas
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seuprojeto.com'
      const loginUrl = `${baseUrl}/${packLanguage}/login?email=${encodeURIComponent(email)}`
      let emailContent: Record<string, { subject: string; greeting: string; title: string; body: string; btn: string; fallback: string; footer: string }>

      const packName = effectivePack?.name || ''

      if (isComplementPurchase) {
        if (complement!.type === 'custom') {
          // E-mail para personalização de artes
          emailContent = {
            pt: {
              subject: `Personalização do Pack ${packName} Confirmada!`,
              greeting: buyerName ? `Olá, ${buyerName}!` : 'Olá!',
              title: 'Pedido de Personalização Recebido!',
              body: `Seu pedido de personalização para o pack <strong>${packName}</strong> foi recebido com sucesso! Nossa equipe entrará em contato ou iniciará os ajustes. Você poderá acompanhar o status e acessar suas artes personalizadas diretamente na aba "Personalizado" dentro do seu pack na biblioteca.`,
              btn: 'Acessar Biblioteca →',
              fallback: 'Se o botão não funcionar, copie e cole o link no navegador:',
              footer: 'Este é um e-mail automático. Em caso de dúvida, entre em contato com o suporte.',
            },
            es: {
              subject: `¡Personalización del Pack "${packName}" Confirmada!`,
              greeting: buyerName ? `¡Hola, ${buyerName}!` : '¡Hola!',
              title: '¡Pedido de Personalización Recibido!',
              body: `Tu pedido de personalización para el pack <strong>"${packName}"</strong> ha sido recibido con éxito. Podrás seguir el avance y acceder a tus artes personalizadas directamente en la pestaña "Personalizado" dentro de tu pack.`,
              btn: 'Acceder a la Biblioteca →',
              fallback: 'Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:',
              footer: 'Este es un correo electrónico automático. En caso de dudas, ponte en contacto con soporte.',
            },
            en: {
              subject: `Customization for "${packName}" Confirmed!`,
              greeting: buyerName ? `Hello, ${buyerName}!` : 'Hello!',
              title: 'Customization Order Received!',
              body: `Your customization order for the <strong>"${packName}"</strong> pack has been received! You can track status and view your customized files directly in the "Custom" tab of your pack.`,
              btn: 'Access Library →',
              fallback: 'If the button doesn\'t work, copy and paste the link below into your browser:',
              footer: 'This is an automated email. If you need help, please contact support.',
            },
          }
        } else {
          // E-mail para Stories desbloqueado
          emailContent = {
            pt: {
              subject: `Versão para Stories Liberada!`,
              greeting: buyerName ? `Olá, ${buyerName}!` : 'Olá!',
              title: 'Conteúdo extra Liberado!',
              body: `As artes para stories do pack para <strong>${packName}</strong> foram liberadas com sucesso! Acesse sua biblioteca e confira na aba de arquivos.`,
              btn: 'Acessar →',
              fallback: 'Se o botão não funcionar, copie e cole o link no navegador:',
              footer: 'Este é um e-mail automático. Em caso de dúvida, entre em contato com o suporte.',
            },
            es: {
              subject: `🔓 ¡Contenido Extra Liberado en el Pack "${packName}"!`,
              greeting: buyerName ? `¡Hola, ${buyerName}!` : '¡Hola!',
              title: '¡Contenido extra desbloqueado!',
              body: `El contenido extra del pack <strong>"${packName}"</strong> ha sido liberado con éxito. Accede a tu biblioteca y revisa el nuevo contenido disponible.`,
              btn: 'Acceder →',
              fallback: 'Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:',
              footer: 'Este es un correo electrónico automático. En caso de dudas, ponte en contacto con soporte.',
            },
            en: {
              subject: `Extra Content Unlocked!`,
              greeting: buyerName ? `Hello, ${buyerName}!` : 'Hello!',
              title: 'Extra content unlocked!',
              body: `The Story templates for the <strong>"${packName}"</strong> pack are now available. Access your library and find them under the Files tab.`,
              btn: 'Access Your Files →',
              fallback: 'If the button doesn\'t work, copy and paste the link below into your browser:',
              footer: 'This is an automated email. If you need help, please contact support.',
            },
          }
        }
      } else {
        // E-mail para pack PRINCIPAL
        emailContent = {
          pt: {
            subject: `Pack para ${packName} Liberado!`,
            greeting: buyerName ? `Olá, ${buyerName}!` : 'Olá!',
            title: 'Seu pack foi liberado!',
            body: `O pack de artes para <strong>${packName}</strong> já está disponível na sua biblioteca. Para acessar, basta clicar no botão abaixo e inserir o e-mail utilizado no momento da compra.`,
            btn: 'Acessar →',
            fallback: 'Se o botão não funcionar, copie e cole o link no navegador:',
            footer: 'Este é um e-mail automático. Em caso de dúvida, entre em contato com o suporte.',
          },
          es: {
            subject: `🎨 Pack "${packName}" Disponible!`,
            greeting: buyerName ? `¡Hola, ${buyerName}!` : '¡Hola!',
            title: '¡Tu pack ha sido liberado!',
            body: `El pack <strong>"${packName}"</strong> ya está disponible en tu biblioteca. Para acceder, haz clic en el botón de abajo e ingresa el correo utilizado al momento de la compra.`,
            btn: 'Acceder →',
            fallback: 'Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:',
            footer: 'Este es un correo electrónico automático. En caso de dudas, ponte en contacto con soporte.',
          },
          en: {
            subject: `Your "${packName}" Pack is Ready!`,
            greeting: buyerName ? `Hello, ${buyerName}!` : 'Hello!',
            title: 'Your pack has been unlocked!',
            body: `Your <strong>"${packName}"</strong> pack is now available in your library. To access it, click the button below and enter the email address you used at checkout.`,
            btn: 'Access Your Pack →',
            fallback: 'If the button doesn\'t work, copy and paste the link below into your browser:',
            footer: 'This is an automated email. If you need help, please contact support.',
          },
        }
      }

      const t = emailContent[packLanguage as keyof typeof emailContent] || emailContent.pt

      try {
        await sendEmailWithFailover({
          from: 'Acesso Liberado <send@pablocastilho.com>',
          to: email,
          subject: t.subject,
          html: buildEmailHtml(t, loginUrl, packLanguage),
        })
        console.log(`📧 E-mail enviado para: ${email}`)
      } catch (emailError) {
        // Não falha o webhook se o e-mail falhar
        console.error('⚠️ Erro ao enviar e-mail (acesso foi liberado):', emailError)
      }

      return NextResponse.json({ success: true, message: 'Acesso liberado e e-mail enviado.' })
    }

    // Status não mapeado
    console.log(`ℹ️ Webhook: Status "${status}" ignorado para ${email}`)
    return NextResponse.json({ message: `Status "${status}" ignorado.` })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('❌ Erro Webhook:', message)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// ========================
// E-MAIL HTML BUILDER
// ========================

interface EmailTexts {
  greeting: string
  title: string
  body: string
  btn: string
  fallback: string
  footer: string
}

function buildEmailHtml(t: EmailTexts, loginUrl: string, lang: string): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
</head>
<body style="margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none; background-color: #0A0A0A;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0A0A;" role="presentation">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px;" role="presentation">

          <tr>
            <td style="padding: 48px 40px 40px 40px;">

              <!-- Greeting -->
              <p style="color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; margin: 0 0 8px 0; font-weight: 400;">
                ${t.greeting}
              </p>

              <!-- Title -->
              <h1 style="color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; letter-spacing: -0.3px;">
                ${t.title}
              </h1>

              <!-- Body -->
              <p style="color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; margin: 0 0 36px 0; line-height: 1.7;">
                ${t.body}
              </p>

              <!-- CTA BUTTON -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; background: linear-gradient(90deg, #0052FF 0%, #00B2FF 100%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;">
                      ${t.btn}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p style="color: #52525b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; margin: 28px 0 0 0; text-align: center; line-height: 1.6;">
                ${t.fallback}<br/>
                <a href="${loginUrl}" style="color: #71717a; text-decoration: underline; word-break: break-all;">${loginUrl}</a>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <p style="color: #3f3f46; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.6; margin: 0;">
                ${t.footer}<br/>
                © ${new Date().getFullYear()} Pablo Castilho
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
