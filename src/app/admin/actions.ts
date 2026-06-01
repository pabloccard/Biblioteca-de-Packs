'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasLocalCover } from '@/lib/pack-arts'

// =====================
// AUTH
// =====================

export async function adminLoginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Preencha todos os campos.' }
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (email !== adminEmail || password !== adminPassword) {
    return { error: 'Credenciais inválidas.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  redirect('/admin')
}

export async function adminLogoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'authenticated'
}

// =====================
// PACKS CRUD
// =====================

export async function createPackAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  const categoryId = formData.get('category_id') as string
  const sectionOrderRaw = formData.get('section_order') as string
  const artsFolder = (formData.get('arts_folder') as string)?.trim() || null

  // Legendas: salvar como JSON
  const artCaptionsRaw = formData.get('local_art_captions') as string
  const artCaptions = artCaptionsRaw ? JSON.parse(artCaptionsRaw) : {}

  const packData = {
    hotmart_id: formData.get('hotmart_id') as string,
    name: formData.get('name') as string,
    release_date: formData.get('release_date') as string || null,
    language: formData.get('language') as string || 'pt',
    category_id: categoryId || null,
    cover_image_url: null as string | null,
    arts_folder: artsFolder,
    art_captions: artCaptions,
    section_order: sectionOrderRaw ? JSON.parse(sectionOrderRaw) : ['files', 'tutorial', 'legends'],
    buy_link: (formData.get('buy_link') as string) || '',
    parent_pack_id: (formData.get('parent_pack_id') as string) || null,
    show_discount_tag: formData.get('show_discount_tag') === 'on',
    hide_when_locked: formData.get('hide_when_locked') === 'on',
    version: (formData.get('version') as string) || '1.0',
  }

  // Capa: usar capa.webp local da pasta
  if (artsFolder && hasLocalCover(artsFolder)) {
    packData.cover_image_url = `/${artsFolder}/capa.webp`
  }

  const { data: pack, error } = await supabase.from('packs').insert(packData).select('id').single()
  if (error) return { error: `Erro ao criar pack: ${error.message}` }

  // Parse sections JSON from form
  const sectionsRaw = formData.get('sections_data') as string
  if (sectionsRaw) {
    const sections = JSON.parse(sectionsRaw) as {
      tutorials: { url: string; label_pt: string; label_es: string; order: number }[]
      subsections: { name_pt: string; name_es: string; icon: string; order: number; links: { url: string; label_pt: string; label_es: string; order: number }[] }[]
    }

    for (const t of sections.tutorials) {
      if (!t.url) continue
      await supabase.from('pack_links').insert({
        pack_id: pack.id,
        label_pt: t.label_pt,
        label_es: t.label_es || t.label_pt,
        url: t.url,
        display_order: t.order,
        category: 'youtube',
      })
    }

    for (const sub of sections.subsections) {
      const { data: newSub } = await supabase.from('pack_subsections').insert({
        pack_id: pack.id,
        name_pt: sub.name_pt,
        name_es: sub.name_es || sub.name_pt,
        icon: sub.icon || 'folder',
        display_order: sub.order,
      }).select('id').single()

      if (newSub) {
        for (const link of sub.links) {
          if (!link.url) continue
          await supabase.from('pack_links').insert({
            pack_id: pack.id,
            label_pt: link.label_pt,
            label_es: link.label_es || link.label_pt,
            url: link.url,
            display_order: link.order,
            category: sub.icon || 'canva',
            subsection_id: newSub.id,
          })
        }
      }
    }
  }

  // Insert specs
  const specsRaw = formData.get('specs_data') as string
  if (specsRaw) {
    const specs = JSON.parse(specsRaw) as { label: string; order: number }[]
    for (const spec of specs) {
      if (!spec.label.trim()) continue
      await supabase.from('pack_specs').insert({
        pack_id: pack.id,
        label: spec.label.trim(),
        display_order: spec.order,
      })
    }
  }

  redirect('/admin')
}

export async function updatePackAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const packId = formData.get('pack_id') as string

  const categoryId = formData.get('category_id') as string
  const sectionOrderRaw = formData.get('section_order') as string
  const artsFolder = (formData.get('arts_folder') as string)?.trim() || null

  // Legendas: salvar como JSON
  const artCaptionsRaw = formData.get('local_art_captions') as string
  const artCaptions = artCaptionsRaw ? JSON.parse(artCaptionsRaw) : {}

  const updates: Record<string, unknown> = {
    hotmart_id: formData.get('hotmart_id') as string,
    name: formData.get('name') as string,
    release_date: formData.get('release_date') as string || null,
    language: formData.get('language') as string || 'pt',
    category_id: categoryId || null,
    buy_link: (formData.get('buy_link') as string) || '',
    parent_pack_id: (formData.get('parent_pack_id') as string) || null,
    show_discount_tag: formData.get('show_discount_tag') === 'on',
    hide_when_locked: formData.get('hide_when_locked') === 'on',
    version: (formData.get('version') as string) || '1.0',
    arts_folder: artsFolder,
    art_captions: artCaptions,
  }
  if (sectionOrderRaw) {
    updates.section_order = JSON.parse(sectionOrderRaw)
  }

  // Capa: usar capa.webp da pasta
  if (artsFolder && hasLocalCover(artsFolder)) {
    updates.cover_image_url = `/${artsFolder}/capa.webp`
  }

  const { error } = await supabase.from('packs').update(updates).eq('id', packId)
  if (error) return { error: `Erro ao atualizar pack: ${error.message}` }

  // Parse sections JSON
  const sectionsRaw = formData.get('sections_data') as string
  if (sectionsRaw) {
    const sections = JSON.parse(sectionsRaw) as {
      tutorials: { id?: string; url: string; label_pt: string; label_es: string; order: number; _delete?: boolean }[]
      subsections: {
        id?: string; name_pt: string; name_es: string; icon: string; order: number; _delete?: boolean;
        links: { id?: string; url: string; label_pt: string; label_es: string; order: number; _delete?: boolean }[]
      }[]
    }

    for (const t of sections.tutorials) {
      if (t._delete && t.id) {
        await supabase.from('pack_links').delete().eq('id', t.id)
        continue
      }
      if (!t.url) continue
      if (t.id) {
        await supabase.from('pack_links').update({
          label_pt: t.label_pt,
          label_es: t.label_es || t.label_pt,
          url: t.url,
          display_order: t.order,
        }).eq('id', t.id)
      } else {
        await supabase.from('pack_links').insert({
          pack_id: packId,
          label_pt: t.label_pt,
          label_es: t.label_es || t.label_pt,
          url: t.url,
          display_order: t.order,
          category: 'youtube',
        })
      }
    }

    for (const sub of sections.subsections) {
      if (sub._delete && sub.id) {
        await supabase.from('pack_links').delete().eq('subsection_id', sub.id)
        await supabase.from('pack_subsections').delete().eq('id', sub.id)
        continue
      }

      let subsectionId = sub.id
      if (sub.id) {
        await supabase.from('pack_subsections').update({
          name_pt: sub.name_pt,
          name_es: sub.name_es || sub.name_pt,
          icon: sub.icon || 'folder',
          display_order: sub.order,
        }).eq('id', sub.id)
      } else {
        const { data: newSub } = await supabase.from('pack_subsections').insert({
          pack_id: packId,
          name_pt: sub.name_pt,
          name_es: sub.name_es || sub.name_pt,
          icon: sub.icon || 'folder',
          display_order: sub.order,
        }).select('id').single()
        subsectionId = newSub?.id
      }

      if (!subsectionId) continue

      for (const link of sub.links) {
        if (link._delete && link.id) {
          await supabase.from('pack_links').delete().eq('id', link.id)
          continue
        }
        if (!link.url) continue
        if (link.id) {
          await supabase.from('pack_links').update({
            label_pt: link.label_pt,
            label_es: link.label_es || link.label_pt,
            url: link.url,
            display_order: link.order,
            subsection_id: subsectionId,
          }).eq('id', link.id)
        } else {
          await supabase.from('pack_links').insert({
            pack_id: packId,
            label_pt: link.label_pt,
            label_es: link.label_es || link.label_pt,
            url: link.url,
            display_order: link.order,
            category: sub.icon || 'canva',
            subsection_id: subsectionId,
          })
        }
      }
    }
  }

  // Update specs
  const specsRaw = formData.get('specs_data') as string
  if (specsRaw) {
    await supabase.from('pack_specs').delete().eq('pack_id', packId)
    const specs = JSON.parse(specsRaw) as { label: string; order: number }[]
    for (const spec of specs) {
      if (!spec.label.trim()) continue
      await supabase.from('pack_specs').insert({
        pack_id: packId,
        label: spec.label.trim(),
        display_order: spec.order,
      })
    }
  }

  redirect('/admin')
}

export async function deletePackAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const packId = formData.get('pack_id') as string

  await supabase.from('packs').delete().eq('id', packId)
  redirect('/admin')
}

export async function deleteLinkAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const linkId = formData.get('link_id') as string
  await supabase.from('pack_links').delete().eq('id', linkId)
}

// =====================
// MEMBERS MANAGEMENT
// =====================

export async function searchMemberByEmail(email: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return null

  const supabase = await createClient()
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (!member) return null

  const { data: purchases } = await supabase
    .from('member_purchases')
    .select('*, packs(id, name, cover_image_url, version)')
    .eq('member_id', member.id)

  return { member, purchases: purchases || [] }
}

export async function addMemberAndAssignPackAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const name = (formData.get('name') as string)?.trim()
  const packId = formData.get('pack_id') as string

  if (!email) return { error: 'Email é obrigatório.' }
  if (!packId) return { error: 'Selecione um pack.' }

  // Verificar se membro já existe
  const { data: existing } = await supabase
    .from('members')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return { error: 'MEMBER_EXISTS' }
  }

  const language = formData.get('language') as string || 'pt'

  const { data: newMember, error } = await supabase
    .from('members')
    .insert({ email, name: name || '', language, unsubscribe_token: crypto.randomUUID() })
    .select('id')
    .single()

  if (error) return { error: `Erro ao criar membro: ${error.message}` }
  const memberId = newMember.id

  // Verificar se já tem esse pack
  const { data: existingPurchase } = await supabase
    .from('member_purchases')
    .select('id')
    .eq('member_id', memberId)
    .eq('pack_id', packId)
    .single()

  if (existingPurchase) {
    return { error: 'Este membro já possui esse pack.' }
  }

  const { error: purchaseError } = await supabase
    .from('member_purchases')
    .insert({ member_id: memberId, pack_id: packId })

  if (purchaseError) return { error: `Erro ao atribuir pack: ${purchaseError.message}` }

  return { success: true }
}

export async function updateMemberAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  const memberId = formData.get('member_id') as string
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!memberId || !email) return { error: 'Dados incompletos.' }

  const language = formData.get('language') as string || 'pt'

  const { error } = await supabase
    .from('members')
    .update({ name: name || '', email, language })
    .eq('id', memberId)

  if (error) return { error: `Erro ao atualizar: ${error.message}` }
  return { success: true }
}

export async function assignPackToMemberAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  const memberId = formData.get('member_id') as string
  const packId = formData.get('pack_id') as string

  const { data: existing } = await supabase
    .from('member_purchases')
    .select('id')
    .eq('member_id', memberId)
    .eq('pack_id', packId)
    .single()

  if (existing) return { error: 'Membro já possui este pack.' }

  const { error } = await supabase
    .from('member_purchases')
    .insert({ member_id: memberId, pack_id: packId })

  if (error) return { error: `Erro: ${error.message}` }
  return { success: true }
}

export async function removePackFromMemberAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  const memberId = formData.get('member_id') as string
  const packId = formData.get('pack_id') as string

  await supabase
    .from('member_purchases')
    .delete()
    .eq('member_id', memberId)
    .eq('pack_id', packId)

  return { success: true }
}

// =====================
// BULK MEMBERS (single-member action for real-time progress)
// =====================

export async function bulkAddSingleMemberAction(data: {
  name: string
  email: string
  pack_id: string
  language: string
}): Promise<{ email: string; status: 'created' | 'existing' | 'error'; message: string }> {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { email: data.email, status: 'error', message: 'Não autorizado.' }

  const supabase = await createClient()
  const email = data.email?.trim().toLowerCase()
  const name = data.name?.trim() || ''

  if (!email) return { email: data.email || '(vazio)', status: 'error', message: 'Email vazio' }
  if (!data.pack_id) return { email, status: 'error', message: 'Pack não selecionado' }

  try {
    // Verificar se membro já existe
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single()

    let memberId: string

    if (existing) {
      memberId = existing.id
      // Verificar se já tem esse pack
      const { data: existingPurchase } = await supabase
        .from('member_purchases')
        .select('id')
        .eq('member_id', memberId)
        .eq('pack_id', data.pack_id)
        .single()

      if (existingPurchase) {
        return { email, status: 'existing', message: 'Já possuía o pack' }
      }

      const { error: purchaseError } = await supabase
        .from('member_purchases')
        .insert({ member_id: memberId, pack_id: data.pack_id })

      if (purchaseError) {
        return { email, status: 'error', message: purchaseError.message }
      }
      return { email, status: 'existing', message: 'Pack adicionado ao membro existente' }
    } else {
      const { data: newMember, error: memberError } = await supabase
        .from('members')
        .insert({ email, name, language: data.language, unsubscribe_token: crypto.randomUUID() })
        .select('id')
        .single()

      if (memberError || !newMember) {
        return { email, status: 'error', message: memberError?.message || 'Erro desconhecido' }
      }

      memberId = newMember.id

      const { error: purchaseError } = await supabase
        .from('member_purchases')
        .insert({ member_id: memberId, pack_id: data.pack_id })

      if (purchaseError) {
        return { email, status: 'error', message: purchaseError.message }
      }
      return { email, status: 'created', message: 'Membro criado e pack atribuído' }
    }
  } catch {
    return { email, status: 'error', message: 'Erro inesperado' }
  }
}

// =====================
// CATEGORIES
// =====================

export async function createCategoryAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  const name = (formData.get('name') as string)?.trim()
  const tag = (formData.get('tag') as string)?.trim().toLowerCase()

  if (!name || !tag) return { error: 'Nome e tag são obrigatórios.' }

  const { error } = await supabase.from('pack_categories').insert({ name, tag })
  if (error) return { error: `Erro: ${error.message}` }
  return { success: true }
}

export async function deleteCategoryAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  const categoryId = formData.get('category_id') as string
  await supabase.from('pack_categories').delete().eq('id', categoryId)
  return { success: true }
}
