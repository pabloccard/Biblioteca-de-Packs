'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '../actions'
import { revalidatePath } from 'next/cache'

export async function updateSuggestionStatusAction(id: string, status: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { error } = await supabase
    .from('suggestions')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/suggestions')
  return { success: true }
}

export async function updateSuggestionNotesAction(id: string, notes: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { error } = await supabase
    .from('suggestions')
    .update({ admin_notes: notes })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/suggestions')
  return { success: true }
}

export async function deleteSuggestionAction(id: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { error } = await supabase.from('suggestions').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/suggestions')
  return { success: true }
}
