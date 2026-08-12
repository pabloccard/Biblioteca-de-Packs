import { NextResponse } from 'next/server'
import { sendEmailWithFailover } from '@/lib/resend-failover'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Rota temporária para testar o sistema de failover do Resend.
 * 
 * GET /api/test-failover → mostra o status atual (contagem do dia)
 * POST /api/test-failover → envia um e-mail de teste e mostra qual API foi usada
 * 
 * ⚠️ REMOVER ESTA ROTA APÓS OS TESTES!
 */

const TEST_EMAIL = 'pablocdesigner@gmail.com'

export async function GET() {
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabaseAdmin
    .from('email_daily_count')
    .select('count')
    .eq('date', today)
    .single()

  const count = data?.count ?? 0

  return NextResponse.json({
    date: today,
    emailsSentToday: count,
    limit: 90,
    willUseFallback: count >= 90,
    apiThatWillBeUsed: count >= 90 ? 'RESEND_MARKETING_API_KEY (fallback)' : 'RESEND_API_KEY (principal)',
  })
}

export async function POST(request: Request) {
  // Proteção básica: precisa de um header secreto pra usar
  const authHeader = request.headers.get('x-test-secret')
  if (authHeader !== 'testar-failover-2026') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const { data: before } = await supabaseAdmin
    .from('email_daily_count')
    .select('count')
    .eq('date', today)
    .single()

  const countBefore = before?.count ?? 0

  try {
    await sendEmailWithFailover({
      from: 'Teste Failover <send@pablocastilho.com>',
      to: TEST_EMAIL,
      subject: `🧪 Teste Failover — Contagem: ${countBefore}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Teste de Failover do Resend</h2>
          <p><strong>Data:</strong> ${today}</p>
          <p><strong>Contagem antes do envio:</strong> ${countBefore}</p>
          <p><strong>API utilizada:</strong> ${countBefore >= 90 ? '🟡 MARKETING (fallback)' : '🟢 PRINCIPAL'}</p>
          <p>Se você recebeu este e-mail, o sistema está funcionando!</p>
        </div>
      `,
    })

    const { data: after } = await supabaseAdmin
      .from('email_daily_count')
      .select('count')
      .eq('date', today)
      .single()

    return NextResponse.json({
      success: true,
      sentTo: TEST_EMAIL,
      countBefore,
      countAfter: after?.count ?? 0,
      apiUsed: countBefore >= 90 ? 'MARKETING (fallback)' : 'PRINCIPAL',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 })
  }
}
