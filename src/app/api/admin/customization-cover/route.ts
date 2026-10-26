import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/app/admin/actions'
import { uploadFileToDrive, makeDriveItemPublic, createCustomizationFolders } from '@/lib/google-drive'
import { revalidatePath } from 'next/cache'

export const maxDuration = 60

/**
 * POST /api/admin/customization-cover
 * Uploads a client's custom pack cover directly to their Google Drive folder without compression.
 */
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const orderId = formData.get('order_id') as string | null

    if (!file || !orderId) {
      return NextResponse.json({ error: 'Arquivo e ID do pedido são obrigatórios' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Obter informações do pedido e do pack
    const { data: order, error: orderError } = await supabase
      .from('customization_orders')
      .select('id, pack_id, client_name, client_email, delivery_drive_folder_id, delivery_links, packs(name)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // 2. Garantir que a pasta do cliente no Google Drive exista
    let targetFolderId = order.delivery_drive_folder_id
    let updatedLinks = { ...(order.delivery_links || {}) }

    if (!targetFolderId) {
      const clientName = order.client_name || order.client_email || 'Cliente'
      const packName = (order.packs as any)?.name || 'Pack'
      const folders = await createCustomizationFolders(clientName, packName)
      targetFolderId = folders.clientFolderId
      updatedLinks = {
        ...updatedLinks,
        client_folder_url: folders.clientFolderUrl,
        feed_folder_id: folders.feedFolderId,
        stories_folder_id: folders.storiesFolderId,
        feed_url: updatedLinks.feed_url || folders.feedFolderUrl,
        stories_url: updatedLinks.stories_url || folders.storiesFolderUrl,
      }
    }

    // 3. Upload do arquivo bruto (Buffer sem compressão) para o Google Drive
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp'
    const fileName = `Capa - ${order.client_name || 'Personalizado'}.${ext}`

    const uploaded = await uploadFileToDrive(
      targetFolderId,
      fileName,
      buffer,
      file.type || 'image/webp'
    )

    // 4. Tornar o arquivo público para visualização
    try {
      await makeDriveItemPublic(uploaded.id)
    } catch (permErr) {
      console.warn('Erro ao definir permissão pública da capa:', permErr)
    }

    // Usar proxy-thumbnail com tamanho 1600 para exibição com alta fidelidade e cache
    const customCoverUrl = `/api/drive/proxy-thumbnail?fileId=${uploaded.id}&size=1600`

    updatedLinks.custom_cover_url = customCoverUrl
    updatedLinks.custom_cover_file_id = uploaded.id

    // 5. Salvar na tabela customization_orders
    const { error: updateError } = await supabase
      .from('customization_orders')
      .update({
        custom_cover_url: customCoverUrl,
        delivery_drive_folder_id: targetFolderId,
        delivery_links: updatedLinks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      return NextResponse.json({ error: `Erro ao salvar no banco: ${updateError.message}` }, { status: 500 })
    }

    // Revalidar rotas relacionadas
    try {
      revalidatePath(`/admin/customizations/${orderId}`)
      revalidatePath(`/pt/pack/${order.pack_id}`)
      revalidatePath(`/pt/pack/${order.pack_id}/custom`)
    } catch {}

    return NextResponse.json({
      success: true,
      url: customCoverUrl,
      fileId: uploaded.id,
      deliveryFolderId: targetFolderId,
    })
  } catch (err: any) {
    console.error('Erro no upload da capa personalizada:', err)
    return NextResponse.json({ error: err.message || 'Erro inesperado no servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/customization-cover
 * Removes the custom cover from the order, reverting to original pack cover.
 */
export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: order } = await supabase
      .from('customization_orders')
      .select('delivery_links, pack_id')
      .eq('id', orderId)
      .single()

    const updatedLinks = { ...(order?.delivery_links || {}) }
    delete updatedLinks.custom_cover_url
    delete updatedLinks.custom_cover_file_id

    const { error: updateError } = await supabase
      .from('customization_orders')
      .update({
        custom_cover_url: null,
        delivery_links: updatedLinks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    try {
      revalidatePath(`/admin/customizations/${orderId}`)
      if (order?.pack_id) {
        revalidatePath(`/pt/pack/${order.pack_id}`)
        revalidatePath(`/pt/pack/${order.pack_id}/custom`)
      }
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao remover capa' }, { status: 500 })
  }
}
