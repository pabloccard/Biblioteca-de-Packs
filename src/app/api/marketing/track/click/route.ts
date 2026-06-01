import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const sendId = request.nextUrl.searchParams.get('id')
  const url = request.nextUrl.searchParams.get('url')
  const ignore = request.nextUrl.searchParams.get('ignore') === 'true'

  if (!url) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Registrar clique apenas se não houver flag de ignorar
  if (sendId && !ignore) {
    try {
      const { data: send } = await supabaseAdmin
        .from('email_sends')
        .update({ clicked: true, clicked_at: new Date().toISOString() })
        .eq('id', sendId)
        .eq('clicked', false)
        .select('campaign_id')
        .single()

      if (send?.campaign_id) {
        await supabaseAdmin
          .from('email_campaigns')
          .update({ total_clicked: (await supabaseAdmin
            .from('email_sends')
            .select('id', { count: 'exact', head: true })
            .eq('campaign_id', send.campaign_id)
            .eq('clicked', true)
          ).count || 0 })
          .eq('id', send.campaign_id)
      }
    } catch {
      // Silencioso
    }
  }

  return NextResponse.redirect(decodeURIComponent(url))
}
