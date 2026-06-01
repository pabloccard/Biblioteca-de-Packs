'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '../actions'
import { revalidatePath } from 'next/cache'

export async function uploadIconAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const name = formData.get('name') as string
  const file = formData.get('image') as File

  if (!name || !file || file.size === 0) {
    return { error: 'Nome e imagem são obrigatórios.' }
  }

  const supabase = await createClient()

  const ext = file.name.split('.').pop()
  const filePath = `icons/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage.from('pack-images').upload(filePath, file)
  
  if (uploadError) {
    return { error: `Erro no upload: ${uploadError.message}` }
  }

  const { data: urlData } = supabase.storage.from('pack-images').getPublicUrl(filePath)

  const { error: dbError } = await supabase.from('subsection_icons').insert({
    name,
    image_url: urlData.publicUrl
  })

  if (dbError) {
    return { error: `Erro no banco de dados: ${dbError.message}` }
  }

  revalidatePath('/admin/icons')
  revalidatePath('/admin/pack/new')
  return { success: true }
}

export async function deleteIconAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const id = formData.get('id') as string
  const imageUrl = formData.get('image_url') as string

  if (!id || !imageUrl) return { error: 'Dados inválidos' }

  const supabase = await createClient()

  // Extrair o caminho do arquivo a partir da URL
  const pathParts = imageUrl.split('/pack-images/')
  if (pathParts.length === 2) {
    const filePath = pathParts[1]
    await supabase.storage.from('pack-images').remove([filePath])
  }

  const { error } = await supabase.from('subsection_icons').delete().eq('id', id)
  if (error) {
    return { error: `Erro ao deletar: ${error.message}` }
  }

  revalidatePath('/admin/icons')
  revalidatePath('/admin/pack/new')
  return { success: true }
}
