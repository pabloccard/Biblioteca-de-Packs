'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdminAuthenticated } from './actions'
import { revalidatePath } from 'next/cache'
import { detectPackNiche } from '@/lib/phone-sanitizer'

/**
 * Estatísticas gerais do CRM WhatsApp
 */
export async function getWhatsAppDashboardStatsAction() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return null

  const supabase = supabaseAdmin

  // Total de membros
  const { count: totalMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  // Membros com telefone
  const { count: membersWithPhone } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .not('phone', 'is', null)
    .neq('phone', '')

  // Total de campanhas
  const { count: totalCampaigns } = await supabase
    .from('whatsapp_campaigns')
    .select('*', { count: 'exact', head: true })

  // Total de mensagens já enviadas
  const { count: totalSentMessages } = await supabase
    .from('whatsapp_campaign_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')

  return {
    totalMembers: totalMembers || 0,
    membersWithPhone: membersWithPhone || 0,
    totalCampaigns: totalCampaigns || 0,
    totalSentMessages: totalSentMessages || 0,
  }
}

/**
 * Listar todas as campanhas de WhatsApp
 */
export async function getWhatsAppCampaignsAction() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return []

  const supabase = supabaseAdmin

  const { data: campaigns, error } = await supabase
    .from('whatsapp_campaigns')
    .select(`
      *,
      packs (
        id,
        name,
        language,
        cover_image_url,
        version
      ),
      whatsapp_campaign_recipients (
        id,
        status
      )
    `)
    .order('created_at', { ascending: false })

  if (error || !campaigns) return []

  return campaigns.map((c: any) => {
    const recipients = c.whatsapp_campaign_recipients || []
    const totalRecipients = recipients.length
    const sentRecipients = recipients.filter((r: any) => r.status === 'sent').length
    const pendingRecipients = totalRecipients - sentRecipients
    const progress = totalRecipients > 0 ? Math.round((sentRecipients / totalRecipients) * 100) : 0

    return {
      id: c.id,
      name: c.name,
      niche: c.niche,
      language: c.language,
      message_template: c.message_template,
      created_at: c.created_at,
      pack: c.packs,
      totalRecipients,
      sentRecipients,
      pendingRecipients,
      progress,
    }
  })
}

/**
 * Buscar detalhes e destinatários de uma campanha
 */
export async function getWhatsAppCampaignDetailAction(campaignId: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return null

  const supabase = supabaseAdmin

  const { data: campaign, error } = await supabase
    .from('whatsapp_campaigns')
    .select(`
      *,
      packs (
        id,
        name,
        language,
        cover_image_url,
        buy_link,
        version
      )
    `)
    .eq('id', campaignId)
    .single()

  if (error || !campaign) return null

  // Buscar destinatários com informações do membro
  const { data: recipients, error: recError } = await supabase
    .from('whatsapp_campaign_recipients')
    .select(`
      id,
      campaign_id,
      member_id,
      phone,
      status,
      sent_at,
      notes,
      created_at,
      members (
        id,
        name,
        email,
        language,
        country
      )
    `)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })

  if (recError) return null

  const total = (recipients || []).length
  const sent = (recipients || []).filter((r: any) => r.status === 'sent').length
  const pending = total - sent
  const progress = total > 0 ? Math.round((sent / total) * 100) : 0

  return {
    ...campaign,
    totalRecipients: total,
    sentRecipients: sent,
    pendingRecipients: pending,
    progress,
    recipients: recipients || [],
  }
}

/**
 * Estimar audiência qualificada para um Pack
 */
export async function getEligibleAudienceForPackAction(packId: string, excludeAlreadyPurchased = true) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { count: 0, sample: [] }

  const supabase = supabaseAdmin

  // 1. Buscar o pack
  const { data: targetPack } = await supabase
    .from('packs')
    .select('id, name, language, category_id, pack_categories(tag, name)')
    .eq('id', packId)
    .single()

  if (!targetPack) return { count: 0, sample: [] }

  const categoryTag = Array.isArray(targetPack.pack_categories)
    ? (targetPack.pack_categories[0] as any)?.tag
    : (targetPack.pack_categories as any)?.tag

  const niche = detectPackNiche(targetPack.name, categoryTag)
  const language = targetPack.language || 'pt'

  // 2. Buscar todos os packs deste mesmo nicho
  const { data: allPacks } = await supabase
    .from('packs')
    .select('id, name, category_id, pack_categories(tag)')

  const nichePackIds = new Set<string>()
  for (const p of allPacks || []) {
    const pTag = Array.isArray((p as any).pack_categories)
      ? (p as any).pack_categories[0]?.tag
      : (p as any).pack_categories?.tag
    const pNiche = detectPackNiche(p.name, pTag)
    if (pNiche === niche) {
      nichePackIds.add(p.id)
    }
  }

  // 3. Buscar membros com telefone e do mesmo idioma (com paginação)
  let members: any[] = []
  let page = 0
  while (true) {
    const { data } = await supabase
      .from('members')
      .select('id, name, email, phone, language, country')
      .not('phone', 'is', null)
      .neq('phone', '')
      .eq('language', language)
      .range(page * 1000, (page + 1) * 1000 - 1)

    if (!data || data.length === 0) break
    members = members.concat(data)
    if (data.length < 1000) break
    page++
  }

  if (members.length === 0) return { count: 0, sample: [], niche, language }

  // 4. Buscar compras de todos os membros (com paginação)
  let purchases: any[] = []
  page = 0
  while (true) {
    const { data } = await supabase
      .from('member_purchases')
      .select('member_id, pack_id')
      .range(page * 1000, (page + 1) * 1000 - 1)

    if (!data || data.length === 0) break
    purchases = purchases.concat(data)
    if (data.length < 1000) break
    page++
  }

  const memberPurchasesMap = new Map<string, Set<string>>()
  for (const p of purchases) {
    if (!memberPurchasesMap.has(p.member_id)) {
      memberPurchasesMap.set(p.member_id, new Set())
    }
    memberPurchasesMap.get(p.member_id)!.add(p.pack_id)
  }

  // 5. Filtrar membros qualificados
  const eligible = members.filter((m) => {
    const userPacks = memberPurchasesMap.get(m.id) || new Set()

    // Pertence a este nicho? (Já comprou pelo menos 1 pack do mesmo nicho)
    let hasNichePurchase = false
    for (const pid of userPacks) {
      if (nichePackIds.has(pid)) {
        hasNichePurchase = true
        break
      }
    }
    if (!hasNichePurchase) return false

    // Se deve excluir quem já comprou o pack alvo
    if (excludeAlreadyPurchased && userPacks.has(packId)) {
      return false
    }

    return true
  })

  return {
    count: eligible.length,
    sample: eligible.slice(0, 5),
    niche,
    language,
  }
}

/**
 * Criar nova campanha de WhatsApp
 */
export async function createWhatsAppCampaignAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = supabaseAdmin

  const name = (formData.get('name') as string)?.trim()
  const packId = formData.get('pack_id') as string
  const messageTemplate = (formData.get('message_template') as string)?.trim()
  const excludeAlreadyPurchased = formData.get('exclude_already_purchased') === 'true' || formData.get('exclude_already_purchased') === 'on'

  if (!name || !packId || !messageTemplate) {
    return { error: 'Preencha o nome da campanha, selecione um pack e digite a mensagem.' }
  }

  // 1. Buscar pack
  const { data: targetPack } = await supabase
    .from('packs')
    .select('id, name, language, category_id, pack_categories(tag)')
    .eq('id', packId)
    .single()

  if (!targetPack) return { error: 'Pack não encontrado.' }

  const categoryTag = Array.isArray(targetPack.pack_categories)
    ? (targetPack.pack_categories[0] as any)?.tag
    : (targetPack.pack_categories as any)?.tag

  const niche = detectPackNiche(targetPack.name, categoryTag)
  const language = targetPack.language || 'pt'

  // 2. Criar a campanha no banco
  const { data: campaign, error: createError } = await supabase
    .from('whatsapp_campaigns')
    .insert({
      name,
      pack_id: packId,
      niche,
      language,
      message_template: messageTemplate,
    })
    .select('id')
    .single()

  if (createError || !campaign) {
    return { error: `Erro ao criar campanha: ${createError?.message}` }
  }

  // 3. Buscar membros qualificados
  const { data: allPacks } = await supabase
    .from('packs')
    .select('id, name, category_id, pack_categories(tag)')

  const nichePackIds = new Set<string>()
  for (const p of allPacks || []) {
    const pTag = Array.isArray((p as any).pack_categories)
      ? (p as any).pack_categories[0]?.tag
      : (p as any).pack_categories?.tag
    const pNiche = detectPackNiche(p.name, pTag)
    if (pNiche === niche) {
      nichePackIds.add(p.id)
    }
  }

  // Buscar membros com telefone e do mesmo idioma (com paginação)
  let members: any[] = []
  let page = 0
  while (true) {
    const { data } = await supabase
      .from('members')
      .select('id, name, email, phone, language')
      .not('phone', 'is', null)
      .neq('phone', '')
      .eq('language', language)
      .range(page * 1000, (page + 1) * 1000 - 1)

    if (!data || data.length === 0) break
    members = members.concat(data)
    if (data.length < 1000) break
    page++
  }

  // Buscar compras de todos os membros (com paginação)
  let purchases: any[] = []
  page = 0
  while (true) {
    const { data } = await supabase
      .from('member_purchases')
      .select('member_id, pack_id')
      .range(page * 1000, (page + 1) * 1000 - 1)

    if (!data || data.length === 0) break
    purchases = purchases.concat(data)
    if (data.length < 1000) break
    page++
  }

  const memberPurchasesMap = new Map<string, Set<string>>()
  for (const p of purchases) {
    if (!memberPurchasesMap.has(p.member_id)) {
      memberPurchasesMap.set(p.member_id, new Set())
    }
    memberPurchasesMap.get(p.member_id)!.add(p.pack_id)
  }

  const recipientsToInsert: { campaign_id: string; member_id: string; phone: string; status: string }[] = []

  for (const m of members || []) {
    const userPacks = memberPurchasesMap.get(m.id) || new Set()

    let hasNichePurchase = false
    for (const pid of userPacks) {
      if (nichePackIds.has(pid)) {
        hasNichePurchase = true
        break
      }
    }
    if (!hasNichePurchase) continue

    if (excludeAlreadyPurchased && userPacks.has(packId)) {
      continue
    }

    recipientsToInsert.push({
      campaign_id: campaign.id,
      member_id: m.id,
      phone: m.phone,
      status: 'pending',
    })
  }

  if (recipientsToInsert.length > 0) {
    // Inserir destinatários em lotes de 200
    const BATCH_SIZE = 200
    for (let i = 0; i < recipientsToInsert.length; i += BATCH_SIZE) {
      const batch = recipientsToInsert.slice(i, i + BATCH_SIZE)
      await supabase.from('whatsapp_campaign_recipients').insert(batch)
    }
  }

  revalidatePath('/admin/whatsapp')
  return { success: true, campaignId: campaign.id, totalRecipients: recipientsToInsert.length }
}

/**
 * Marcar destinatário como enviado
 */
export async function markRecipientSentAction(recipientId: string, campaignId: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = supabaseAdmin

  const { error } = await supabase
    .from('whatsapp_campaign_recipients')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', recipientId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/whatsapp/${campaignId}`)
  return { success: true }
}

/**
 * Reverter destinatário para pendente
 */
export async function markRecipientPendingAction(recipientId: string, campaignId: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = supabaseAdmin

  const { error } = await supabase
    .from('whatsapp_campaign_recipients')
    .update({
      status: 'pending',
      sent_at: null,
    })
    .eq('id', recipientId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/whatsapp/${campaignId}`)
  return { success: true }
}

/**
 * Excluir campanha
 */
export async function deleteWhatsAppCampaignAction(campaignId: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = supabaseAdmin

  const { error } = await supabase
    .from('whatsapp_campaigns')
    .delete()
    .eq('id', campaignId)

  if (error) return { error: error.message }

  revalidatePath('/admin/whatsapp')
  return { success: true }
}

/**
 * Atualizar mensagem da campanha
 */
export async function updateWhatsAppCampaignMessageAction(campaignId: string, newMessageTemplate: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  if (!newMessageTemplate?.trim()) {
    return { error: 'A mensagem não pode ser vazia.' }
  }

  const supabase = supabaseAdmin

  const { error } = await supabase
    .from('whatsapp_campaigns')
    .update({
      message_template: newMessageTemplate.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/whatsapp/${campaignId}`)
  return { success: true }
}
