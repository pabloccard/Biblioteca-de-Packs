'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const fallbackLang = (formData.get('lang') as string) || 'pt'

  if (!email) {
    return { error: 'emptyEmail' }
  }

  const supabase = await createClient()

  // Verificar se o email existe na tabela de membros e pegar o language
  const { data: member, error } = await supabase
    .from('members')
    .select('id, name, email, language')
    .eq('email', email)
    .single()

  if (error || !member) {
    return { error: 'notFound' }
  }

  const dbLang = member.language || fallbackLang

  // Salvar email e info do membro em cookies httpOnly (30 dias)
  const cookieStore = await cookies()
  cookieStore.set('member_email', member.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
  })

  cookieStore.set('member_id', member.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  cookieStore.set('member_name', member.name || '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  
  cookieStore.set('member_lang', dbLang, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return { success: true, url: `/${dbLang}/dashboard` }
}

export async function logoutAction(formData?: FormData) {
  const lang = (formData?.get('lang') as string) || 'pt'
  const cookieStore = await cookies()
  cookieStore.delete('member_id')
  cookieStore.delete('member_email')
  cookieStore.delete('member_name')
  cookieStore.delete('member_lang')
  redirect(`/${lang}`)
}

export async function getMemberEmail(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('member_email')?.value || null
}

export async function getMemberId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('member_id')?.value || null
}

export async function getMemberName(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('member_name')?.value || null
}

export async function getMemberSession(): Promise<{
  id: string | null
  email: string | null
  name: string | null
  lang: string | null
}> {
  const cookieStore = await cookies()
  return {
    id: cookieStore.get('member_id')?.value || null,
    email: cookieStore.get('member_email')?.value || null,
    name: cookieStore.get('member_name')?.value || null,
    lang: cookieStore.get('member_lang')?.value || null,
  }
}
