'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from './actions'
import { listDriveFiles, createCustomizationFolders } from '@/lib/google-drive'
import { getCachedDriveFiles } from '@/lib/pack-arts'

// =====================
// CUSTOMIZATIsON ORDERS
// =====================

export async function createCustomizationOrderAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  const packId = formData.get('pack_id') as string
  const driveFolderId = (formData.get('drive_folder_id') as string)?.trim()
  const isNewFolder = formData.get('is_new_folder') === 'true'
  const artsDataRaw = formData.get('arts_data') as string

  if (!packId || !driveFolderId) {
    return { error: 'Pack e artes são obrigatórios.' }
  }

  // If first time uploading arts for this pack, save folder ID on the pack
  if (isNewFolder) {
    await supabase
      .from('packs')
      .update({ drive_arts_folder_id: driveFolderId })
      .eq('id', packId)
  }

  // Create order
  const { data: order, error } = await supabase
    .from('customization_orders')
    .insert({
      pack_id: packId,
      source_drive_folder_id: driveFolderId,
      status: 'waiting',
    })
    .select('id, access_token')
    .single()

  if (error) return { error: `Erro ao criar pedido: ${error.message}` }

  // Insert arts from Drive
  if (artsDataRaw) {
    const arts = JSON.parse(artsDataRaw) as {
      drive_file_id: string
      file_name: string
      display_order: number
    }[]

    for (const art of arts) {
      await supabase.from('customization_arts').insert({
        order_id: order.id,
        drive_file_id: art.drive_file_id,
        file_name: art.file_name,
        thumbnail_url: null,
        display_order: art.display_order,
      })
    }
  }

  redirect(`/admin/customizations/${order.id}`)
}

export async function submitCustomizationAction(formData: FormData) {
  const supabase = await createClient()

  const accessToken = formData.get('access_token') as string
  const clientName = (formData.get('client_name') as string)?.trim()
  const clientEmail = (formData.get('client_email') as string)?.trim().toLowerCase()
  const clientWhatsapp = (formData.get('client_whatsapp') as string)?.trim()
  const generalNotes = (formData.get('general_notes') as string)?.trim()
  const artsInstructionsRaw = formData.get('arts_instructions') as string
  const chosenVersionId = (formData.get('chosen_version_id') as string)?.trim()
  const chosenVersionName = (formData.get('chosen_version_name') as string)?.trim()

  if (!accessToken) {
    return { error: 'Token de acesso inválido.' }
  }

  // Find order by access token
  const { data: order, error: findError } = await supabase
    .from('customization_orders')
    .select('id, status, client_name, client_email, client_whatsapp')
    .eq('access_token', accessToken)
    .single()

  if (findError || !order) return { error: 'Pedido não encontrado.' }
  if (order.status !== 'waiting') return { error: 'Este pedido já foi enviado.' }

  // Update order (preserves existing client data if not re-submitted)
  const updatePayload: Record<string, unknown> = {
    general_notes: generalNotes || null,
    status: 'pending',
    updated_at: new Date().toISOString(),
  }
  if (clientName) updatePayload.client_name = clientName
  if (clientEmail) updatePayload.client_email = clientEmail
  if (clientWhatsapp) updatePayload.client_whatsapp = clientWhatsapp
  if (chosenVersionId) updatePayload.chosen_version_id = chosenVersionId
  if (chosenVersionName) updatePayload.chosen_version_name = chosenVersionName

  const { error: updateError } = await supabase
    .from('customization_orders')
    .update(updatePayload)
    .eq('id', order.id)

  if (updateError) return { error: `Erro ao salvar: ${updateError.message}` }

  // Update arts with client instructions and inputs
  if (artsInstructionsRaw) {
    const instructions = JSON.parse(artsInstructionsRaw) as {
      art_id: string
      instructions: string
      inputs?: Record<string, string>
    }[]
    for (const item of instructions) {
      await supabase
        .from('customization_arts')
        .update({
          client_instructions: item.instructions?.trim() || null,
          client_inputs: item.inputs || {},
        })
        .eq('id', item.art_id)
    }
  }

  return { success: true }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('customization_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function setupDeliveryAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  const orderId = formData.get('order_id') as string
  const deliveryFolderId = (formData.get('delivery_folder_id') as string)?.trim()

  if (!orderId || !deliveryFolderId) {
    return { error: 'Dados incompletos.' }
  }

  try {
    // List files in delivery folder
    const files = await listDriveFiles(deliveryFolderId)

    // Clear old delivery files
    await supabase.from('customization_delivery_files').delete().eq('order_id', orderId)

    // Insert new delivery files in batch
    if (files && files.length > 0) {
      const deliveryRows = files.map((file, i) => ({
        order_id: orderId,
        drive_file_id: file.id,
        file_name: file.name,
        thumbnail_url: file.thumbnailLink || null,
        display_order: i,
      }))
      await supabase.from('customization_delivery_files').insert(deliveryRows)
    }

    // Update order
    const { error } = await supabase
      .from('customization_orders')
      .update({
        delivery_drive_folder_id: deliveryFolderId,
        delivery_token: crypto.randomUUID(),
        status: 'delivered',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) return { error: error.message }
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao configurar entrega.' }
  }
}

export async function saveDeliveryFromUploadAction(orderId: string, deliveryFolderId: string, files: { id: string; name: string; thumbnailLink?: string }[]) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()

  // Clear old delivery files
  await supabase.from('customization_delivery_files').delete().eq('order_id', orderId)

  // Insert uploaded files
  for (let i = 0; i < files.length; i++) {
    await supabase.from('customization_delivery_files').insert({
      order_id: orderId,
      drive_file_id: files[i].id,
      file_name: files[i].name,
      thumbnail_url: files[i].thumbnailLink || null,
      display_order: i,
    })
  }

  // Update order
  const { error } = await supabase
    .from('customization_orders')
    .update({
      delivery_drive_folder_id: deliveryFolderId,
      delivery_token: crypto.randomUUID(),
      status: 'delivered',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteCustomizationOrderAction(orderId: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  await supabase.from('customization_orders').delete().eq('id', orderId)
  redirect('/admin/customizations')
}

export async function saveCustomizationDeliveryLinksAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()

  const orderId = formData.get('order_id') as string
  const status = (formData.get('status') as string) || 'delivered'
  const feedUrl = (formData.get('feed_url') as string)?.trim() || ''
  const storiesUrl = (formData.get('stories_url') as string)?.trim() || ''
  const canvaFeedUrl = (formData.get('canva_feed_url') as string)?.trim() || ''
  const canvaStoriesUrl = (formData.get('canva_stories_url') as string)?.trim() || ''
  const generalNotes = (formData.get('general_notes') as string)?.trim() || null
  const customCoverUrl = formData.has('custom_cover_url')
    ? (formData.get('custom_cover_url') as string)?.trim() || null
    : undefined

  if (!orderId) return { error: 'ID do pedido é obrigatório.' }

  const { data: currentOrder } = await supabase
    .from('customization_orders')
    .select('delivery_links, custom_cover_url')
    .eq('id', orderId)
    .single()

  const currentLinks = currentOrder?.delivery_links || {}

  const deliveryLinks = {
    ...currentLinks,
    feed_url: feedUrl,
    stories_url: storiesUrl,
    canva_feed_url: canvaFeedUrl,
    canva_stories_url: canvaStoriesUrl,
    canva_url: canvaFeedUrl || canvaStoriesUrl || '',
  }

  if (customCoverUrl !== undefined) {
    if (customCoverUrl) {
      deliveryLinks.custom_cover_url = customCoverUrl
    } else {
      delete deliveryLinks.custom_cover_url
    }
  }

  const updatePayload: Record<string, any> = {
    status,
    delivery_links: deliveryLinks,
    general_notes: generalNotes,
    updated_at: new Date().toISOString(),
  }

  if (customCoverUrl !== undefined) {
    updatePayload.custom_cover_url = customCoverUrl
  }

  const { error } = await supabase
    .from('customization_orders')
    .update(updatePayload)
    .eq('id', orderId)

  if (error) return { error: `Erro ao salvar entrega: ${error.message}` }
  return { success: true }
  return { success: true }
}

export async function createSimpleCustomizationOrderAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  const packId = formData.get('pack_id') as string
  const clientName = (formData.get('client_name') as string)?.trim() || ''
  const clientEmail = (formData.get('client_email') as string)?.trim().toLowerCase()
  const clientWhatsapp = (formData.get('client_whatsapp') as string)?.trim() || null
  const status = (formData.get('status') as string) || 'waiting'
  const generalNotes = (formData.get('general_notes') as string)?.trim() || null

  const feedUrl = (formData.get('feed_url') as string)?.trim() || ''
  const storiesUrl = (formData.get('stories_url') as string)?.trim() || ''
  const canvaFeedUrl = (formData.get('canva_feed_url') as string)?.trim() || ''
  const canvaStoriesUrl = (formData.get('canva_stories_url') as string)?.trim() || ''

  if (!packId || !clientEmail) {
    return { error: 'Pack e e-mail do cliente são obrigatórios.' }
  }

  // Buscar complemento customizado para este pack
  const { data: complement } = await supabase
    .from('pack_complements')
    .select('id')
    .eq('pack_id', packId)
    .eq('type', 'custom')
    .single()

  let memberId: string | null = null

  // Verificar se o membro já existe
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('email', clientEmail)
    .single()

  if (member) {
    memberId = member.id
  } else {
    // Criar membro
    const { data: newMember } = await supabase
      .from('members')
      .insert({
        email: clientEmail,
        name: clientName,
        language: 'pt',
        unsubscribe_token: crypto.randomUUID(),
      })
      .select('id')
      .single()

    if (newMember) memberId = newMember.id
  }

  if (memberId && complement) {
    // Garantir compra do complemento
    const { data: hasComp } = await supabase
      .from('complement_purchases')
      .select('id')
      .eq('member_id', memberId)
      .eq('complement_id', complement.id)
      .single()

    if (!hasComp) {
      await supabase
        .from('complement_purchases')
        .insert({ member_id: memberId, complement_id: complement.id })
    }

    // Garantir compra do pack base
    const { data: hasPack } = await supabase
      .from('member_purchases')
      .select('id')
      .eq('member_id', memberId)
      .eq('pack_id', packId)
      .single()

    if (!hasPack) {
      await supabase
        .from('member_purchases')
        .insert({ member_id: memberId, pack_id: packId })
    }
  }

  // Buscar nome do pack para nomear as pastas do Drive
  const { data: pack } = await supabase
    .from('packs')
    .select('name')
    .eq('id', packId)
    .single()

  // Se os links de Feed e Stories não foram preenchidos, cria automaticamente a estrutura no Google Drive
  let finalFeedUrl = feedUrl
  let finalStoriesUrl = storiesUrl
  let driveClientFolderId = ''
  let driveExtraLinks: Record<string, string> = {}

  if (!finalFeedUrl || !finalStoriesUrl) {
    try {
      const folders = await createCustomizationFolders(clientName, pack?.name || 'Pack')
      if (!finalFeedUrl) finalFeedUrl = folders.feedFolderUrl
      if (!finalStoriesUrl) finalStoriesUrl = folders.storiesFolderUrl
      driveClientFolderId = folders.clientFolderId
      driveExtraLinks = {
        client_folder_url: folders.clientFolderUrl,
        feed_folder_id: folders.feedFolderId,
        stories_folder_id: folders.storiesFolderId,
      }
    } catch (driveErr) {
      console.warn('Não foi possível gerar pastas no Google Drive automaticamente:', driveErr)
    }
  }

  const deliveryLinks = {
    feed_url: finalFeedUrl,
    stories_url: finalStoriesUrl,
    canva_feed_url: canvaFeedUrl,
    canva_stories_url: canvaStoriesUrl,
    canva_url: canvaFeedUrl || canvaStoriesUrl || '',
    ...driveExtraLinks,
  }

  const { data: newOrder, error } = await supabase
    .from('customization_orders')
    .insert({
      pack_id: packId,
      member_id: memberId,
      complement_id: complement?.id || null,
      client_name: clientName,
      client_email: clientEmail,
      client_whatsapp: clientWhatsapp,
      status,
      delivery_links: deliveryLinks,
      delivery_drive_folder_id: driveClientFolderId || null,
      general_notes: generalNotes,
      access_token: crypto.randomUUID(),
      source_drive_folder_id: '',
    })
    .select('id')
    .single()

  if (error) return { error: `Erro ao criar pedido: ${error.message}` }

  // Popula automaticamente as artes do pack para o formulário do cliente
  try {
    await populateOrderArtsFromPack(newOrder.id, packId, supabase)
  } catch (artsErr) {
    console.warn('Não foi possível popular artes do pack no pedido manual:', artsErr)
  }

  redirect(`/admin/customizations/${newOrder.id}`)
}

/**
 * Cria ou recria a estrutura de pastas no Google Drive para um pedido existente
 */
export async function generateDriveFoldersForOrderAction(orderId: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado' }

  const supabase = await createClient()

  const { data: order, error: orderErr } = await supabase
    .from('customization_orders')
    .select('*, packs(name)')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    return { error: 'Pedido não encontrado.' }
  }

  const clientName = order.client_name || order.client_email || 'Cliente'
  const packName = order.packs?.name || 'Pack'

  try {
    const folders = await createCustomizationFolders(clientName, packName)

    const existingLinks = order.delivery_links || {}
    const updatedDeliveryLinks = {
      ...existingLinks,
      feed_url: existingLinks.feed_url || folders.feedFolderUrl,
      stories_url: existingLinks.stories_url || folders.storiesFolderUrl,
      client_folder_url: folders.clientFolderUrl,
      feed_folder_id: folders.feedFolderId,
      stories_folder_id: folders.storiesFolderId,
    }

    const { error: updateErr } = await supabase
      .from('customization_orders')
      .update({
        delivery_links: updatedDeliveryLinks,
        delivery_drive_folder_id: folders.clientFolderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateErr) {
      return { error: `Erro ao salvar no banco: ${updateErr.message}` }
    }

    return {
      success: true,
      folders,
      deliveryLinks: updatedDeliveryLinks,
    }
  } catch (driveErr) {
    const msg = driveErr instanceof Error ? driveErr.message : 'Erro ao conectar ao Google Drive'
    return { error: `Erro no Google Drive: ${msg}` }
  }
}

/**
 * Popula a tabela customization_arts com as artes originais do pack a partir da pasta do Google Drive
 */
export async function populateOrderArtsFromPack(orderId: string, packId: string, customClient?: any) {
  const supabase = customClient || (await createClient())

  // 1. Obter informações do pack e do pedido
  const [{ data: pack }, { data: order }] = await Promise.all([
    supabase
      .from('packs')
      .select('id, name, drive_arts_folder_id, arts_folder, art_captions')
      .eq('id', packId)
      .maybeSingle(),
    supabase
      .from('customization_orders')
      .select('id, source_drive_folder_id')
      .eq('id', orderId)
      .maybeSingle(),
  ])

  if (!pack) {
    return { error: 'Pack não encontrado.' }
  }

  const targetFolderId = pack.drive_arts_folder_id || order?.source_drive_folder_id

  let artsToInsert: {
    order_id: string
    drive_file_id: string | null
    file_name: string
    thumbnail_url: string | null
    display_order: number
  }[] = []

  // 2. Tentar buscar artes da pasta do Google Drive (com cache)
  if (targetFolderId) {
    try {
      const imageFiles = await getCachedDriveFiles(targetFolderId)

      if (imageFiles && imageFiles.length > 0) {
        artsToInsert = imageFiles.map((file, index) => ({
          order_id: orderId,
          drive_file_id: file.id,
          file_name: file.name,
          thumbnail_url: `/api/drive/proxy-thumbnail?fileId=${file.id}`,
          display_order: index,
        }))
      }
    } catch (driveErr) {
      console.warn('⚠️ Erro ao listar arquivos do Google Drive em populateOrderArtsFromPack:', driveErr)
    }
  }

  // Fallback: se não veio do Drive, tentar artes locais do pack via getPackArts
  if (artsToInsert.length === 0) {
    try {
      const { getPackArts } = await import('@/lib/pack-arts')
      const localArts = await getPackArts(pack)
      if (localArts.length > 0) {
        artsToInsert = localArts.map((art, index) => ({
          order_id: orderId,
          drive_file_id: null,
          file_name: art.name,
          thumbnail_url: art.imageUrl,
          display_order: index,
        }))
      }
    } catch (localErr) {
      console.warn('⚠️ Erro ao carregar artes locais em populateOrderArtsFromPack:', localErr)
    }
  }

  if (artsToInsert.length === 0) {
    console.warn(`Nem o pack ${packId} nem o pedido ${orderId} possuem artes disponíveis.`)
    return { error: 'O pack não possui artes configuradas no Google Drive nem localmente.' }
  }

  try {
    // 3. Limpar artes antigas caso existam
    await supabase.from('customization_arts').delete().eq('order_id', orderId)

    // 4. Inserir as novas artes
    const { error: insertErr } = await supabase.from('customization_arts').insert(artsToInsert)
    if (insertErr) {
      return { error: `Erro ao salvar artes: ${insertErr.message}` }
    }

    // 5. Atualizar source_drive_folder_id no pedido se tiver drive
    if (pack.drive_arts_folder_id) {
      await supabase
        .from('customization_orders')
        .update({
          source_drive_folder_id: pack.drive_arts_folder_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
    }

    return { success: true, count: artsToInsert.length }
  } catch (err: any) {
    console.error('Erro ao salvar artes do pedido:', err)
    return { error: err.message || 'Falha ao salvar artes no banco de dados' }
  }
}

/**
 * Server Action para o admin sincronizar manualmente as artes do pack com o pedido
 */
export async function syncOrderArtsFromPackAction(orderId: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado' }

  const supabase = await createClient()

  const { data: order, error: orderErr } = await supabase
    .from('customization_orders')
    .select('id, pack_id')
    .eq('id', orderId)
    .single()

  if (orderErr || !order || !order.pack_id) {
    return { error: 'Pedido ou pack não encontrado.' }
  }

  const result = await populateOrderArtsFromPack(order.id, order.pack_id, supabase)
  return result
}

/**
 * Salva a versão de cores escolhida pelo cliente no pedido
 */
export async function saveOrderChosenVersionAction(
  accessToken: string,
  chosenVersionId: string,
  chosenVersionName: string
) {
  if (!accessToken) return { error: 'Token inválido' }
  const supabase = await createClient()

  const { error } = await supabase
    .from('customization_orders')
    .update({
      chosen_version_id: chosenVersionId || null,
      chosen_version_name: chosenVersionName || null,
      updated_at: new Date().toISOString(),
    })
    .eq('access_token', accessToken)

  if (error) {
    console.error('Erro ao salvar versão de cores escolhida:', error)
    return { error: error.message }
  }
  return { success: true }
}

