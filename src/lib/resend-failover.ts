import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Sistema de failover para API keys do Resend.
 *
 * Usa uma tabela `email_daily_count` no Supabase para rastrear
 * quantos e-mails foram enviados hoje pela API principal.
 * Quando atinge o limite (90), passa a usar a API de marketing.
 *
 * Tabela necessária:
 *   email_daily_count (
 *     date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
 *     count INTEGER DEFAULT 0
 *   )
 */

const DAILY_LIMIT = 90

function getResendPrimary() {
  return new Resend(process.env.RESEND_API_KEY)
}

function getResendFallback() {
  return new Resend(process.env.RESEND_MARKETING_API_KEY)
}

/** Retorna a contagem de e-mails enviados hoje */
async function getTodayCount(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

  const { data } = await supabaseAdmin
    .from('email_daily_count')
    .select('count')
    .eq('date', today)
    .single()

  return data?.count ?? 0
}

/** Incrementa o contador diário em 1 (cria o registro se não existir) */
async function incrementTodayCount(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)

  // Tenta fazer upsert: se já existe a data, incrementa; se não, cria com count = 1
  const { data: existing } = await supabaseAdmin
    .from('email_daily_count')
    .select('count')
    .eq('date', today)
    .single()

  if (existing) {
    await supabaseAdmin
      .from('email_daily_count')
      .update({ count: existing.count + 1 })
      .eq('date', today)
  } else {
    await supabaseAdmin
      .from('email_daily_count')
      .insert({ date: today, count: 1 })
  }
}

/**
 * Envia um e-mail usando o Resend com failover automático.
 * 
 * - Se o contador diário < 90 → usa a API principal (RESEND_API_KEY)
 * - Se >= 90 → usa a API de marketing (RESEND_MARKETING_API_KEY)
 * 
 * Retorna o resultado do envio.
 */
export async function sendEmailWithFailover(params: {
  from: string
  to: string
  subject: string
  html: string
}) {
  const count = await getTodayCount()
  const useFallback = count >= DAILY_LIMIT

  const resend = useFallback ? getResendFallback() : getResendPrimary()
  const keyUsed = useFallback ? 'MARKETING (fallback)' : 'PRINCIPAL'

  console.log(`📊 E-mails hoje: ${count}/${DAILY_LIMIT} — Usando API: ${keyUsed}`)

  const result = await resend.emails.send(params)

  // Só incrementa o contador se usou a API principal
  if (!useFallback) {
    await incrementTodayCount()
  }

  return result
}
