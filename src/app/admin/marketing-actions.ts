'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from './actions'
import { redirect } from 'next/navigation'

// ===== FILTROS DE DESTINATÁRIOS =====
interface FilterRules {
  include_packs: string[] // Comprou PELO MENOS UM destes packs (OR)
  exclude_packs: string[] // NÃO comprou estes packs
}

export async function getMarketingRecipients(filterRules: FilterRules) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return []

  const supabase = await createClient()

  // Buscar todos os membros opt-in
  const { data: members } = await supabase
    .from('members')
    .select('id, email, name')
    .eq('marketing_opt_out', false)

  if (!members || members.length === 0) return []

  // Buscar todas as compras
  const { data: allPurchases } = await supabase
    .from('member_purchases')
    .select('member_id, pack_id')

  const purchases = allPurchases || []

  // Criar mapa de compras por membro
  const purchaseMap = new Map<string, Set<string>>()
  purchases.forEach(p => {
    if (!purchaseMap.has(p.member_id)) {
      purchaseMap.set(p.member_id, new Set())
    }
    purchaseMap.get(p.member_id)!.add(p.pack_id)
  })

  // Aplicar filtros
  return members.filter(member => {
    const memberPacks = purchaseMap.get(member.id) || new Set()

    // Filtro de inclusão: membro DEVE ter PELO MENOS UM destes packs (OR)
    if (filterRules.include_packs.length > 0) {
      const hasAny = filterRules.include_packs.some(packId => memberPacks.has(packId))
      if (!hasAny) return false
    }

    // Filtro de exclusão: membro NÃO DEVE ter NENHUM destes packs
    if (filterRules.exclude_packs.length > 0) {
      const hasAny = filterRules.exclude_packs.some(packId => memberPacks.has(packId))
      if (hasAny) return false
    }

    return true
  })
}

// ===== CRIAR CAMPANHA =====
export async function createCampaignAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado' }

  const supabase = await createClient()

  const campaignName = (formData.get('campaign_name') as string) || ''
  const fromName = (formData.get('from_name') as string) || 'Pablo Castilho'
  const fromEmail = (formData.get('from_email') as string) || 'send@pablocastilho.com.br'
  const subject = formData.get('subject') as string
  const previewText = (formData.get('preview_text') as string) || ''
  const htmlContent = formData.get('html_content') as string
  const includePacksRaw = formData.get('include_packs') as string
  const excludePacksRaw = formData.get('exclude_packs') as string
  const selectedIdsRaw = formData.get('selected_member_ids') as string

  if (!subject || !htmlContent) {
    return { error: 'Assunto e conteúdo são obrigatórios' }
  }

  const filterRules: FilterRules = {
    include_packs: includePacksRaw ? JSON.parse(includePacksRaw) : [],
    exclude_packs: excludePacksRaw ? JSON.parse(excludePacksRaw) : [],
  }

  const selectedIds: string[] = selectedIdsRaw ? JSON.parse(selectedIdsRaw) : []
  if (selectedIds.length === 0) {
    return { error: 'Selecione pelo menos 1 destinatário' }
  }

  // Buscar dados dos membros selecionados
  const { data: members } = await supabase
    .from('members')
    .select('id, email, name')
    .in('id', selectedIds)

  if (!members || members.length === 0) {
    return { error: 'Nenhum destinatário válido encontrado' }
  }

  // Criar campanha
  const { data: campaign, error: campaignError } = await supabase
    .from('email_campaigns')
    .insert({
      name: campaignName,
      from_name: fromName,
      from_email: fromEmail,
      subject,
      preview_text: previewText,
      html_content: htmlContent,
      filter_rules: filterRules,
      total_recipients: members.length,
      status: 'draft',
    })
    .select('id')
    .single()

  if (campaignError || !campaign) {
    return { error: 'Erro ao criar campanha: ' + (campaignError?.message || '') }
  }

  // Criar registros de envio para cada destinatário selecionado
  const sends = members.map(member => ({
    campaign_id: campaign.id,
    member_id: member.id,
    email: member.email,
    member_name: member.name || '',
    status: 'pending',
  }))

  const { error: sendsError } = await supabase
    .from('email_sends')
    .insert(sends)

  if (sendsError) {
    return { error: 'Erro ao criar registros de envio: ' + sendsError.message }
  }

  redirect(`/admin/marketing/${campaign.id}`)
}

// ===== ENVIAR EMAIL DE TESTE =====
export async function sendTestEmailAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado' }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_MARKETING_API_KEY)

  const fromName = (formData.get('from_name') as string) || 'Pablo Castilho'
  const fromEmail = (formData.get('from_email') as string) || 'send@pablocastilho.com.br'
  const subject = formData.get('subject') as string
  const previewText = (formData.get('preview_text') as string) || ''
  const htmlContent = formData.get('html_content') as string
  const testEmail = formData.get('test_email') as string

  if (!subject || !htmlContent || !testEmail) {
    return { error: 'Preencha assunto, conteúdo e email de teste' }
  }

  // Substituir variáveis pendentes no HTML de teste (como unsubscribe)
  const mktUrl = process.env.NEXT_PUBLIC_MARKETING_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  let finalHtml = htmlContent
  finalHtml = finalHtml.replace(/\{\{\s*nome\s*\}\}/gi, 'Usuário Teste')
  finalHtml = finalHtml.replace(/\{\{\s*email\s*\}\}/gi, testEmail)
  finalHtml = finalHtml.replace(/\{\{\s*unsubscribe_link\s*\}\}/gi, `${mktUrl}/unsubscribe?test=true`)

  const finalSubject = subject.replace(/\{\{\s*nome\s*\}\}/gi, 'Usuário Teste')
  const finalFromName = fromName.replace(/\{\{\s*nome\s*\}\}/gi, 'Usuário Teste')
  const finalPreviewText = previewText.replace(/\{\{\s*nome\s*\}\}/gi, 'Usuário Teste')

  // Injetar preview text no HTML (texto invisível que clientes de email mostram na preview)
  if (finalPreviewText) {
    const previewHtml = `<div style="display:none;max-height:0px;overflow:hidden;">${finalPreviewText}</div>`
    // Tentar inserir após <body>
    if (finalHtml.includes('<body')) {
      finalHtml = finalHtml.replace(/(<body[^>]*>)/i, `$1${previewHtml}`)
    } else {
      finalHtml = previewHtml + finalHtml
    }
  }

  // Interceptar TODAS as URLs externas para passarem pelo domínio de marketing.
  finalHtml = finalHtml.replace(
    /(<a\s[^>]*?)href="(https?:\/\/[^"]+)"([^>]*?>)/g,
    (match: string, before: string, url: string, after: string) => {
      if (url.includes('/api/marketing/') || url.includes('/unsubscribe')) return match
      
      const isNoTrack = before.includes('data-no-track') || after.includes('data-no-track')
      const trackedUrl = `${mktUrl}/api/marketing/track/click?url=${encodeURIComponent(url)}${isNoTrack ? '&ignore=true' : ''}&test=true`
      
      return `${before}href="${trackedUrl}"${after}`
    }
  )

  try {
    await resend.emails.send({
      from: `${finalFromName} <${fromEmail}>`,
      to: testEmail,
      subject: `[TESTE] ${finalSubject}`,
      html: finalHtml + '<div style="text-align:center;margin-top:32px;padding:12px;background:rgba(249,115,22,0.1);border-radius:8px;"><p style="color:#f97316;font-size:12px;margin:0;">⚠️ Este é um email de teste. O link de desinscrição e tracking não estão ativos.</p></div>',
    })
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao enviar'
    return { error: msg }
  }
}

// ===== LISTAR CAMPANHAS =====
export async function getCampaigns() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

// ===== DETALHES DE CAMPANHA =====
export async function getCampaignDetails(campaignId: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return null

  const supabase = await createClient()

  const [campaignResult, sendsResult] = await Promise.all([
    supabase.from('email_campaigns').select('*').eq('id', campaignId).single(),
    supabase.from('email_sends').select('*').eq('campaign_id', campaignId).order('created_at'),
  ])

  if (!campaignResult.data) return null

  return {
    campaign: campaignResult.data,
    sends: sendsResult.data || [],
  }
}

// ===== MARKETING STATS =====
export async function getMarketingStats() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return null

  const supabase = await createClient()

  const [membersResult, optOutResult, campaignsResult] = await Promise.all([
    supabase.from('members').select('id', { count: 'exact', head: true }),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('marketing_opt_out', true),
    supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
  ])

  return {
    totalMembers: membersResult.count || 0,
    totalOptOut: optOutResult.count || 0,
    totalCampaigns: campaignsResult.count || 0,
    totalSubscribed: (membersResult.count || 0) - (optOutResult.count || 0),
  }
}
