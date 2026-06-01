import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// 1x1 transparent GIF pixel
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

export async function GET(request: NextRequest) {
  const sendId = request.nextUrl.searchParams.get('id')

  if (sendId) {
    try {
      // Marcar email como aberto
      const { data: send } = await supabaseAdmin
        .from('email_sends')
        .update({ opened: true, opened_at: new Date().toISOString() })
        .eq('id', sendId)
        .eq('opened', false) // Só atualiza na primeira abertura
        .select('campaign_id')
        .single()

      // Incrementar contador na campanha
      if (send?.campaign_id) {
        await supabaseAdmin.rpc('increment_campaign_opened', { campaign_id_input: send.campaign_id })
      }
    } catch {
      // Silencioso — não bloqueia o pixel
    }
  }

  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
