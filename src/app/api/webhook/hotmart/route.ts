import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmailWithFailover } from '@/lib/resend-failover'

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

    // Log detalhado para debug
    console.log(`📥 Webhook recebido: event=${event} | productId=${productId} | email=${email} | status=${status} | buyer=${buyerName}`)

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

    // 4. Mapear hotmart_id → pack no banco
    const { data: pack, error: packError } = await supabaseAdmin
      .from('packs')
      .select('id, name, language, parent_pack_id, hotmart_id')
      .eq('hotmart_id', productId)
      .single()

    if (packError || !pack) {
      console.warn(`⚠️ Webhook: Produto ${productId} não mapeado a nenhum pack (err: ${packError?.message || 'not found'})`)
      return NextResponse.json({ error: `Produto ${productId} não mapeado` }, { status: 400 })
    }

    // Segurança extra: verificar se o hotmart_id do pack retornado realmente bate
    if (pack.hotmart_id !== productId) {
      console.error(`🚨 ALERTA: pack retornado tem hotmart_id="${pack.hotmart_id}" mas productId="${productId}" - BLOQUEANDO`)
      return NextResponse.json({ error: 'Inconsistência de mapeamento detectada' }, { status: 500 })
    }

    console.log(`🔗 Webhook: productId=${productId} → pack_id=${pack.id} (${pack.name})`)

    // 4. Lógica de REMOÇÃO (reembolso, chargeback, etc.)
    const statusParaRemover = ['DISPUTE', 'REFUNDED', 'CHARGEBACK', 'CANCELLED', 'EXPIRED']
    if (statusParaRemover.includes(status)) {
      // Buscar membro pelo email
      const { data: member } = await supabaseAdmin
        .from('members')
        .select('id')
        .eq('email', email)
        .single()

      if (member) {
        await supabaseAdmin
          .from('member_purchases')
          .delete()
          .eq('member_id', member.id)
          .eq('pack_id', pack.id)

        console.log(`🚫 Acesso removido: ${email} → Pack "${pack.name}" (status: ${status})`)
      }

      return NextResponse.json({ success: true, message: `Acesso removido (${status})` })
    }

    // 5. Lógica de LIBERAÇÃO
    const statusParaLiberar = ['APPROVED', 'COMPLETE']
    if (statusParaLiberar.includes(status)) {
      const packLanguage = pack.language || 'pt'
      const isChildPack = !!pack.parent_pack_id

      // Se for pack filho, buscar nome do pack pai
      let parentPackName = ''
      if (isChildPack) {
        const { data: parentPack } = await supabaseAdmin
          .from('packs')
          .select('name')
          .eq('id', pack.parent_pack_id)
          .single()
        parentPackName = parentPack?.name || ''
      }

      // Verificar se membro já existe
      const { data: existingMember } = await supabaseAdmin
        .from('members')
        .select('id')
        .eq('email', email)
        .single()

      let memberId: string

      if (existingMember) {
        memberId = existingMember.id
        // Atualizar nome se estiver vazio
        if (buyerName) {
          await supabaseAdmin
            .from('members')
            .update({ name: buyerName })
            .eq('id', memberId)
            .eq('name', '') // Só atualiza se o nome estava vazio
        }
      } else {
        // Criar novo membro
        const { data: newMember, error: createError } = await supabaseAdmin
          .from('members')
          .insert({
            email,
            name: buyerName,
            language: packLanguage,
            unsubscribe_token: crypto.randomUUID(),
          })
          .select('id')
          .single()

        if (createError || !newMember) {
          console.error('❌ Erro ao criar membro:', createError?.message)
          return NextResponse.json({ error: 'Erro ao criar membro' }, { status: 500 })
        }

        memberId = newMember.id
      }

      // Verificar se já possui o pack (evitar duplicata)
      const { data: existingPurchase } = await supabaseAdmin
        .from('member_purchases')
        .select('id')
        .eq('member_id', memberId)
        .eq('pack_id', pack.id)
        .single()

      if (!existingPurchase) {
        const { error: purchaseError } = await supabaseAdmin
          .from('member_purchases')
          .insert({ member_id: memberId, pack_id: pack.id })

        if (purchaseError) {
          console.error('❌ Erro ao registrar compra:', purchaseError.message)
          return NextResponse.json({ error: 'Erro ao registrar compra' }, { status: 500 })
        }
      }

      console.log(`✅ Acesso liberado: ${email} → Pack "${pack.name}"${isChildPack ? ` (filho de "${parentPackName}")` : ''}`)

      // 6. Enviar e-mail de boas-vindas
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seuprojeto.com'
      const loginUrl = `${baseUrl}/${packLanguage}/login?email=${encodeURIComponent(email)}`

      let emailContent: Record<string, { subject: string; greeting: string; title: string; body: string; btn: string; fallback: string; footer: string }>

      if (isChildPack) {
        // E-mail para pack FILHO (ex: Story desbloqueado)
        emailContent = {
          pt: {
            subject: `Versão para Stories Liberada!`,
            greeting: buyerName ? `Olá, ${buyerName}!` : 'Olá!',
            title: 'Conteúdo extra Liberado!',
            body: `As artes para stories do pack para <strong>${parentPackName}</strong> foram liberadas com sucesso! Acesse sua biblioteca e confira na aba de arquivos.`,
            btn: 'Acessar →',
            fallback: 'Se o botão não funcionar, copie e cole o link no navegador:',
            footer: 'Este é um e-mail automático. Em caso de dúvida, entre em contato com o suporte.',
          },
          es: {
            subject: `🔓 ¡Contenido Extra Liberado en el Pack "${parentPackName}"!`,
            greeting: buyerName ? `¡Hola, ${buyerName}!` : '¡Hola!',
            title: '¡Contenido extra desbloqueado!',
            body: `Los archivos <strong>"${pack.name}"</strong> del pack <strong>"${parentPackName}"</strong> han sido liberados con éxito. Accede a tu biblioteca y revisa el nuevo contenido disponible en la pestaña de archivos.`,
            btn: 'Acceder →',
            fallback: 'Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:',
            footer: 'Este es un correo electrónico automático. En caso de dudas, ponte en contacto con soporte.',
          },
          en: {
            subject: `Extra Content Unlocked!`,
            greeting: buyerName ? `Hello, ${buyerName}!` : 'Hello!',
            title: 'Extra content unlocked!',
            body: `The Story templates for the <strong>"${parentPackName}"</strong> pack are now available. Access your library and find them under the Files tab.`,
            btn: 'Access Your Files →',
            fallback: 'If the button doesn’t work, copy and paste the link below into your browser:',
            footer: 'This is an automated email. If you need help, please contact support.',
          },
        }
      } else {
        // E-mail para pack PRINCIPAL
        emailContent = {
          pt: {
            subject: `Pack para ${pack.name} Liberado!`,
            greeting: buyerName ? `Olá, ${buyerName}!` : 'Olá!',
            title: 'Seu pack foi liberado!',
            body: `O pack de artes para <strong>${pack.name}</strong> já está disponível na sua biblioteca. Para acessar, basta clicar no botão abaixo e inserir o e-mail utilizado no momento da compra.`,
            btn: 'Acessar →',
            fallback: 'Se o botão não funcionar, copie e cole o link no navegador:',
            footer: 'Este é um e-mail automático. Em caso de dúvida, entre em contato com o suporte.',
          },
          es: {
            subject: `🎨 Pack "${pack.name}" Disponible!`,
            greeting: buyerName ? `¡Hola, ${buyerName}!` : '¡Hola!',
            title: '¡Tu pack ha sido liberado!',
            body: `El pack <strong>"${pack.name}"</strong> ya está disponible en tu biblioteca. Para acceder, haz clic en el botón de abajo e ingresa el correo utilizado al momento de la compra.`,
            btn: 'Acceder →',
            fallback: 'Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:',
            footer: 'Este es un correo electrónico automático. En caso de dudas, ponte en contacto con soporte.',
          },
          en: {
            subject: `Your "${pack.name}" Pack is Ready!`,
            greeting: buyerName ? `Hello, ${buyerName}!` : 'Hello!',
            title: 'Your pack has been unlocked!',
            body: `Your <strong>"${pack.name}"</strong> pack is now available in your library. To access it, click the button below and enter the email address you used at checkout.`,
            btn: 'Access Your Pack →',
            fallback: 'If the button doesn’t work, copy and paste the link below into your browser:',
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
