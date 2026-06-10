import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_MARKETING_API_KEY)
const BATCH_SIZE = 3
const BATCH_DELAY_MS = 1500

export async function POST(request: NextRequest) {
  // Verificar admin
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_session')?.value
  if (adminAuth !== 'authenticated') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { campaign_id } = await request.json()
  if (!campaign_id) {
    return NextResponse.json({ error: 'campaign_id obrigatório' }, { status: 400 })
  }

  // Buscar campanha
  const { data: campaign } = await supabaseAdmin
    .from('email_campaigns')
    .select('*')
    .eq('id', campaign_id)
    .single()

  if (!campaign) {
    return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  }

  if (campaign.status === 'sent') {
    return NextResponse.json({ error: 'Campanha já foi enviada' }, { status: 400 })
  }

  // Marcar como enviando
  await supabaseAdmin
    .from('email_campaigns')
    .update({ status: 'sending' })
    .eq('id', campaign_id)

  // Buscar destinatários pendentes
  const { data: sends } = await supabaseAdmin
    .from('email_sends')
    .select('*')
    .eq('campaign_id', campaign_id)
    .eq('status', 'pending')

  if (!sends || sends.length === 0) {
    await supabaseAdmin
      .from('email_campaigns')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', campaign_id)
    return NextResponse.json({ success: true, message: 'Nenhum destinatário pendente' })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const mktUrl = process.env.NEXT_PUBLIC_MARKETING_URL || appUrl
  let totalSent = campaign.total_sent || 0
  let totalFailed = campaign.total_failed || 0

  // Enviar em batches
  for (let i = 0; i < sends.length; i += BATCH_SIZE) {
    const batch = sends.slice(i, i + BATCH_SIZE)

    await Promise.allSettled(
      batch.map(async (send) => {
        try {
          // Formatar o nome do membro em Title Case
          let formattedName = ''
          if (send.member_name) {
            formattedName = send.member_name
              .trim()
              .toLowerCase()
              .split(' ')
              .map((word: string) => {
                if (!word) return ''
                const prep = ['de', 'da', 'do', 'das', 'dos', 'e']
                if (prep.includes(word)) return word
                return word.charAt(0).toUpperCase() + word.slice(1)
              })
              .join(' ')
          }
          const fallbackName = formattedName || 'Cliente'

          // Construir HTML com tracking pixel
          const trackingPixel = `<img src="${mktUrl}/api/marketing/track/open?id=${send.id}" width="1" height="1" style="display:none;width:1px;height:1px;" alt="" />`

          // Buscar token de unsubscribe
          const { data: member } = await supabaseAdmin
            .from('members')
            .select('unsubscribe_token')
            .eq('id', send.member_id)
            .single()

          const unsubscribeUrl = `${mktUrl}/unsubscribe?token=${member?.unsubscribe_token || ''}`
          const unsubscribeFooter = `<div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #333;"><a href="${unsubscribeUrl}" data-no-track style="color:#888;font-size:12px;text-decoration:underline;">Não deseja mais receber nossos emails? Clique aqui para se desinscrever</a></div>`

          // Substituir variáveis no conteúdo
          let html = campaign.html_content
          html = html.replace(/\{\{nome\}\}/gi, formattedName || '')
          html = html.replace(/\{\{email\}\}/gi, send.email)
          html = html.replace(/\{\{unsubscribe_link\}\}/gi, unsubscribeUrl)

          // Injetar preview text
          if (campaign.preview_text) {
            const previewTextProcessed = campaign.preview_text.replace(/\{\{nome\}\}/gi, formattedName || '')
            const previewHtml = `<div style="display:none;max-height:0px;overflow:hidden;">${previewTextProcessed}</div>`
            if (html.includes('<body')) {
              html = html.replace(/(<body[^>]*>)/i, `$1${previewHtml}`)
            } else {
              html = previewHtml + html
            }
          }

          // Interceptar URLs
          html = html.replace(
            /(<a\s[^>]*?)href="(https?:\/\/[^"]+)"([^>]*?>)/g,
            (match: string, before: string, url: string, after: string) => {
              if (url.includes('/api/marketing/') || url.includes('/unsubscribe')) return match
              
              const isNoTrack = before.includes('data-no-track') || after.includes('data-no-track')
              const trackedUrl = `${mktUrl}/api/marketing/track/click?id=${send.id}&url=${encodeURIComponent(url)}${isNoTrack ? '&ignore=true' : ''}`
              
              return `${before}href="${trackedUrl}"${after}`
            }
          )

          const fullHtml = html + unsubscribeFooter + trackingPixel

          // Processar from_name e subject para aceitarem a variável {{nome}}
          const finalFromName = campaign.from_name.replace(/\{\{nome\}\}/gi, fallbackName)
          const finalSubject = campaign.subject.replace(/\{\{nome\}\}/gi, fallbackName)
          const toAddress = formattedName ? `Para ${formattedName} <${send.email}>` : send.email

          await resend.emails.send({
            from: `${finalFromName} <${campaign.from_email}>`,
            to: toAddress,
            subject: finalSubject,
            html: fullHtml,
          })

          await supabaseAdmin
            .from('email_sends')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', send.id)

          totalSent++
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
          await supabaseAdmin
            .from('email_sends')
            .update({ status: 'failed', error_message: errorMsg })
            .eq('id', send.id)

          totalFailed++
        }
      })
    )

    // Atualizar progresso
    await supabaseAdmin
      .from('email_campaigns')
      .update({ total_sent: totalSent, total_failed: totalFailed })
      .eq('id', campaign_id)

    // Delay entre batches
    if (i + BATCH_SIZE < sends.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  // Marcar como enviada
  await supabaseAdmin
    .from('email_campaigns')
    .update({
      status: totalFailed > 0 && totalSent === 0 ? 'failed' : 'sent',
      sent_at: new Date().toISOString(),
      total_sent: totalSent,
      total_failed: totalFailed,
    })
    .eq('id', campaign_id)

  return NextResponse.json({
    success: true,
    total_sent: totalSent,
    total_failed: totalFailed,
  })
}
