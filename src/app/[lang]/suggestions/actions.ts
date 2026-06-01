'use server'

import { createClient } from '@/lib/supabase/server'
import { getMemberEmail, getMemberName } from '../../actions'

export async function submitSuggestionAction(data: {
  niche: string
  message: string
}) {
  if (!data.message.trim()) {
    return { error: 'Por favor, escreva sua sugestão.' }
  }

  const email = await getMemberEmail()
  const name = await getMemberName()

  const supabase = await createClient()

  const { error } = await supabase.from('suggestions').insert({
    member_name: name || '',
    member_email: email || '',
    niche: data.niche || '',
    message: data.message.trim(),
    status: 'pending',
  })

  if (error) {
    return { error: `Erro ao enviar sugestão: ${error.message}` }
  }

  return { success: true }
}
