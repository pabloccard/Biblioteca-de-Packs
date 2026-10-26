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

function getResendClient(apiKey: string) {
  return new Resend(apiKey)
}

let countLockPromise: Promise<void> = Promise.resolve()

/** Retorna a contagem de e-mails enviados hoje */
async function getTodayCount(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

  const { data } = await supabaseAdmin
    .from('email_daily_count')
    .select('count')
    .eq('date', today)
    .maybeSingle()

  return data?.count ?? 0
}

/** Incrementa o contador diário de forma atômica (RPC ou lock otimista com retries) */
async function incrementTodayCount(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)

  // 1. Tentar execução via RPC nativo atômico no PostgreSQL (se disponível)
  try {
    const { error: rpcError } = await supabaseAdmin.rpc('increment_email_daily_count', {
      target_date: today,
    })
    if (!rpcError) return
  } catch {
    // Fallback se a função RPC não estiver instalada
  }

  // 2. Fallback: serialização em memória + atualização otimista contra race conditions
  countLockPromise = countLockPromise
    .then(async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: existing } = await supabaseAdmin
          .from('email_daily_count')
          .select('count')
          .eq('date', today)
          .maybeSingle()

        if (existing) {
          const { error, count: updatedCount } = await supabaseAdmin
            .from('email_daily_count')
            .update({ count: existing.count + 1 })
            .eq('date', today)
            .eq('count', existing.count) // Trava otimista

          if (!error && (updatedCount === null || updatedCount === undefined || updatedCount > 0)) {
            break
          }
        } else {
          const { error } = await supabaseAdmin
            .from('email_daily_count')
            .insert({ date: today, count: 1 })

          if (!error) break
        }
      }
    })
    .catch(err => {
      console.warn('⚠️ Falha ao incrementar contador diário de e-mails:', err)
    })

  await countLockPromise
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
  const primaryKey = process.env.RESEND_API_KEY?.trim()
  const fallbackKey = process.env.RESEND_MARKETING_API_KEY?.trim()

  if (!primaryKey && !fallbackKey) {
    console.warn('⚠️ Nenhuma chave Resend (RESEND_API_KEY ou RESEND_MARKETING_API_KEY) configurada no ambiente. E-mail não enviado.')
    return { data: null, error: { message: 'Chave da API Resend não configurada no .env.local.' } }
  }

  const count = await getTodayCount()
  let useFallback = count >= DAILY_LIMIT

  // Se a principal não estiver disponível, tenta usar fallback e vice-versa
  if (!primaryKey && fallbackKey) {
    useFallback = true
  } else if (useFallback && !fallbackKey && primaryKey) {
    useFallback = false
  }

  const selectedKey = useFallback ? fallbackKey! : primaryKey!
  const resend = getResendClient(selectedKey)
  const keyUsed = useFallback ? 'MARKETING (fallback)' : 'PRINCIPAL'

  // Se estiver usando fallback, troca o domínio do remetente
  const finalFrom = useFallback
    ? params.from.replace('@pablocastilho.com', '@pablocastilho.com.br')
    : params.from

  console.log(`📊 E-mails hoje: ${count}/${DAILY_LIMIT} — Usando API: ${keyUsed}`)

  const result = await resend.emails.send({ ...params, from: finalFrom })

  // Só incrementa o contador se usou a API principal
  if (!useFallback && !result.error) {
    await incrementTodayCount()
  }

  return result
}
