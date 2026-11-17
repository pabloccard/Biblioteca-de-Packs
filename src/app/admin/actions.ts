'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { hasLocalCover } from '@/lib/pack-arts'
import { createPackArtsFolder, extractDriveFolderId } from '@/lib/google-drive'

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

  // Google Drive Arts Folder ID
  const driveArtsFolderRaw = formData.get('drive_arts_folder_id') as string | null
  const driveArtsFolderId = extractDriveFolderId(driveArtsFolderRaw) || (driveArtsFolderRaw?.trim() || null)

  // Legendas: salvar como JSON
  const artCaptionsRaw = formData.get('local_art_captions') as string
  const artCaptions = artCaptionsRaw ? JSON.parse(artCaptionsRaw) : {}

  // Campos de personalização por arte: salvar como JSON
  const artCustomFieldsRaw = formData.get('art_custom_fields') as string
  const artCustomFields = artCustomFieldsRaw ? JSON.parse(artCustomFieldsRaw) : {}

  const coverImageUrl = (formData.get('cover_image_url') as string)?.trim() || null

  const packData = {
    hotmart_id: formData.get('hotmart_id') as string,
    name: formData.get('name') as string,
    release_date: formData.get('release_date') as string || null,
    language: formData.get('language') as string || 'pt',
    category_id: categoryId || null,
    cover_image_url: coverImageUrl,
    drive_arts_folder_id: driveArtsFolderId,
    arts_folder: artsFolder,
    art_captions: artCaptions,
    art_custom_fields: artCustomFields,
    section_order: sectionOrderRaw ? JSON.parse(sectionOrderRaw) : ['files', 'legends'],
    buy_link: (formData.get('buy_link') as string) || '',
    parent_pack_id: (formData.get('parent_pack_id') as string) || null,
    hide_when_locked: formData.get('hide_when_locked') === 'on',
    version: (formData.get('version') as string) || '1.0',
  }

  // Capa local de fallback se nenhuma cover_image_url foi enviada
  if (!packData.cover_image_url && artsFolder && hasLocalCover(artsFolder)) {
    packData.cover_image_url = `/${artsFolder}/card.webp`
  }

  const { data: pack, error } = await supabase.from('packs').insert(packData).select('id').single()
  if (error) return { error: `Erro ao criar pack: ${error.message}` }

  // Parse sections JSON from form
  const sectionsRaw = formData.get('sections_data') as string
  if (sectionsRaw) {
    const sections = JSON.parse(sectionsRaw) as {
      subsections: { name_pt: string; name_es: string; name_en: string; icon: string; order: number; links: { url: string; label_pt: string; label_es: string; label_en: string; order: number }[] }[]
    }

    if (sections.subsections) {
      for (const sub of sections.subsections) {
        const { data: newSub } = await supabase.from('pack_subsections').insert({
          pack_id: pack.id,
          name_pt: sub.name_pt,
          name_es: sub.name_es || sub.name_pt,
          name_en: sub.name_en || '',
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
              label_en: link.label_en || '',
              url: link.url,
              display_order: link.order,
              category: sub.icon || 'canva',
              subsection_id: newSub.id,
            })
          }
        }
      }
    }
  }


  // Save Versions & Complements
  const versionsRaw = formData.get('versions_data') as string
  const complementsRaw = formData.get('complements_data') as string
  await savePackVersionsAndComplements(supabase, pack.id, versionsRaw, complementsRaw)

  try {
    revalidateTag('packs-catalog', 'default')
    revalidateTag('drive-arts', 'default')
  } catch (e) {
    // ignore
  }

  revalidatePath('/admin', 'page')
  revalidatePath('/[lang]/dashboard', 'page')

  return { success: true, id: pack.id }
}

export async function updatePackAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const packId = formData.get('pack_id') as string

  const categoryId = formData.get('category_id') as string
  const sectionOrderRaw = formData.get('section_order') as string
  const artsFolder = (formData.get('arts_folder') as string)?.trim() || null

  // Google Drive Arts Folder ID
  const driveArtsFolderRaw = formData.get('drive_arts_folder_id') as string | null
  const driveArtsFolderId = extractDriveFolderId(driveArtsFolderRaw) || (driveArtsFolderRaw?.trim() || null)

  // Legendas: salvar como JSON
  const artCaptionsRaw = formData.get('local_art_captions') as string
  const artCaptions = artCaptionsRaw ? JSON.parse(artCaptionsRaw) : {}

  // Campos de personalização por arte: salvar como JSON
  const artCustomFieldsRaw = formData.get('art_custom_fields') as string

  const coverImageUrl = (formData.get('cover_image_url') as string)?.trim() || null

  const updates: Record<string, unknown> = {
    hotmart_id: formData.get('hotmart_id') as string,
    name: formData.get('name') as string,
    release_date: formData.get('release_date') as string || null,
    language: formData.get('language') as string || 'pt',
    category_id: categoryId || null,
    cover_image_url: coverImageUrl,
    buy_link: (formData.get('buy_link') as string) || '',
    parent_pack_id: (formData.get('parent_pack_id') as string) || null,
    hide_when_locked: formData.get('hide_when_locked') === 'on',
    version: (formData.get('version') as string) || '1.0',
    drive_arts_folder_id: driveArtsFolderId,
    arts_folder: artsFolder,
    art_captions: artCaptions,
  }
  if (artCustomFieldsRaw !== null) {
    updates.art_custom_fields = artCustomFieldsRaw ? JSON.parse(artCustomFieldsRaw) : {}
  }
  if (sectionOrderRaw) {
    updates.section_order = JSON.parse(sectionOrderRaw)
  }

  // Capa local de fallback se nenhuma cover_image_url foi informada
  if (!updates.cover_image_url && artsFolder && hasLocalCover(artsFolder)) {
    updates.cover_image_url = `/${artsFolder}/card.webp`
  }

  const { error } = await supabase.from('packs').update(updates).eq('id', packId)
  if (error) return { error: `Erro ao atualizar pack: ${error.message}` }

  // Parse sections JSON
  const sectionsRaw = formData.get('sections_data') as string
  if (sectionsRaw) {
    const sections = JSON.parse(sectionsRaw) as {
      subsections: {
        id?: string; name_pt: string; name_es: string; name_en: string; icon: string; order: number; _delete?: boolean;
        links: { id?: string; url: string; label_pt: string; label_es: string; label_en: string; order: number; _delete?: boolean }[]
      }[]
    }

    if (sections.subsections) {
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
          name_en: sub.name_en || '',
          icon: sub.icon || 'folder',
          display_order: sub.order,
        }).eq('id', sub.id)
      } else {
        const { data: newSub } = await supabase.from('pack_subsections').insert({
          pack_id: packId,
          name_pt: sub.name_pt,
          name_es: sub.name_es || sub.name_pt,
          name_en: sub.name_en || '',
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
            label_en: link.label_en || '',
            url: link.url,
            display_order: link.order,
            subsection_id: subsectionId,
          }).eq('id', link.id)
        } else {
          await supabase.from('pack_links').insert({
            pack_id: packId,
            label_pt: link.label_pt,
            label_es: link.label_es || link.label_pt,
            label_en: link.label_en || '',
            url: link.url,
            display_order: link.order,
            category: sub.icon || 'canva',
            subsection_id: subsectionId,
          })
        }
      }
    }
  }
}


  // Save Versions & Complements
  const versionsRaw = formData.get('versions_data') as string
  const complementsRaw = formData.get('complements_data') as string
  await savePackVersionsAndComplements(supabase, packId, versionsRaw, complementsRaw)

  try {
    revalidateTag('packs-catalog', 'default')
    revalidateTag('drive-arts', 'default')
  } catch (e) {
    // ignore
  }

  revalidatePath('/admin', 'page')
  revalidatePath(`/admin/pack/${packId}`, 'page')
  revalidatePath(`/admin/pack/${packId}/edit`, 'page')
  revalidatePath('/[lang]/dashboard', 'page')
  revalidatePath(`/[lang]/pack/${packId}`, 'page')

  return { success: true }
}

interface VersionLinkInput {
  id?: string
  platform: 'canva' | 'photoshop'
  format: 'feed' | 'stories'
  url: string
  label_pt?: string
  label_es?: string
  label_en?: string
  display_order?: number
  _delete?: boolean
}

interface VersionInput {
  id?: string
  name: string
  cover_image_url?: string | null
  display_order?: number
  _delete?: boolean
  links?: VersionLinkInput[]
}

interface ComplementsInput {
  stories?: {
    id?: string
    is_active: boolean
    hotmart_id?: string
    hotmart_id_secondary?: string
    buy_link?: string
    price?: number | string | null
  }
  custom?: {
    id?: string
    is_active: boolean
    hotmart_id?: string
    hotmart_id_secondary?: string
    buy_link?: string
    price?: number | string | null
  }
}

async function savePackVersionsAndComplements(
  supabase: any,
  packId: string,
  versionsRaw?: string | null,
  complementsRaw?: string | null
) {
  // 1. Process versions
  if (versionsRaw) {
    try {
      const versions = JSON.parse(versionsRaw) as VersionInput[]
      for (let vIdx = 0; vIdx < versions.length; vIdx++) {
        const v = versions[vIdx]

        if (v._delete && v.id) {
          await supabase.from('pack_version_links').delete().eq('version_id', v.id)
          await supabase.from('pack_versions').delete().eq('id', v.id)
          continue
        }

        if (!v.name?.trim()) continue

        let versionId = v.id
        if (v.id) {
          await supabase.from('pack_versions').update({
            name: v.name.trim(),
            cover_image_url: v.cover_image_url?.trim() || null,
            display_order: v.display_order ?? vIdx,
          }).eq('id', v.id)
        } else {
          const { data: newV } = await supabase.from('pack_versions').insert({
            pack_id: packId,
            name: v.name.trim(),
            cover_image_url: v.cover_image_url?.trim() || null,
            display_order: v.display_order ?? vIdx,
          }).select('id').single()
          versionId = newV?.id
        }

        if (!versionId) continue

        if (v.links && Array.isArray(v.links)) {
          for (let lIdx = 0; lIdx < v.links.length; lIdx++) {
            const link = v.links[lIdx]
            if (link._delete && link.id) {
              await supabase.from('pack_version_links').delete().eq('id', link.id)
              continue
            }

            if (!link.url?.trim()) {
              if (link.id) {
                await supabase.from('pack_version_links').delete().eq('id', link.id)
              }
              continue
            }

            const linkPayload = {
              platform: link.platform || 'canva',
              format: link.format || 'feed',
              url: link.url.trim(),
              label_pt: link.label_pt?.trim() || `${link.platform === 'canva' ? 'Canva' : 'Photoshop'} ${link.format === 'stories' ? 'Stories' : 'Feed'}`,
              label_es: link.label_es?.trim() || link.label_pt?.trim() || '',
              label_en: link.label_en?.trim() || '',
              display_order: link.display_order ?? lIdx,
            }

            if (link.id) {
              await supabase.from('pack_version_links').update(linkPayload).eq('id', link.id)
            } else {
              await supabase.from('pack_version_links').insert({
                version_id: versionId,
                ...linkPayload,
              })
            }
          }
        }
      }
    } catch (e) {
      console.error('Error saving versions:', e)
    }
  }

  // 2. Process complements
  if (complementsRaw) {
    try {
      const comps = JSON.parse(complementsRaw) as ComplementsInput

      if (comps.stories) {
        const s = comps.stories
        const priceNum = s.price ? parseFloat(String(s.price).replace(',', '.')) : null

        const { data: existingStories } = await supabase
          .from('pack_complements')
          .select('id')
          .eq('pack_id', packId)
          .eq('type', 'stories')
          .maybeSingle()

        if (existingStories) {
          await supabase.from('pack_complements').update({
            is_active: !!s.is_active,
            hotmart_id: s.hotmart_id?.trim() || null,
            hotmart_id_secondary: s.hotmart_id_secondary?.trim() || null,
            buy_link: s.buy_link?.trim() || null,
            price: isNaN(priceNum as number) ? null : priceNum,
          }).eq('id', existingStories.id)
        } else if (s.is_active || s.hotmart_id || s.hotmart_id_secondary || s.buy_link) {
          await supabase.from('pack_complements').insert({
            pack_id: packId,
            type: 'stories',
            is_active: !!s.is_active,
            hotmart_id: s.hotmart_id?.trim() || null,
            hotmart_id_secondary: s.hotmart_id_secondary?.trim() || null,
            buy_link: s.buy_link?.trim() || null,
            price: isNaN(priceNum as number) ? null : priceNum,
            display_order: 1,
          })
        }
      }

      if (comps.custom) {
        const c = comps.custom
        const priceNum = c.price ? parseFloat(String(c.price).replace(',', '.')) : null

        const { data: existingCustom } = await supabase
          .from('pack_complements')
          .select('id')
          .eq('pack_id', packId)
          .eq('type', 'custom')
          .maybeSingle()

        if (existingCustom) {
          await supabase.from('pack_complements').update({
            is_active: !!c.is_active,
            hotmart_id: c.hotmart_id?.trim() || null,
            hotmart_id_secondary: c.hotmart_id_secondary?.trim() || null,
            buy_link: c.buy_link?.trim() || null,
            price: isNaN(priceNum as number) ? null : priceNum,
          }).eq('id', existingCustom.id)
        } else if (c.is_active || c.hotmart_id || c.hotmart_id_secondary || c.buy_link) {
          await supabase.from('pack_complements').insert({
            pack_id: packId,
            type: 'custom',
            is_active: !!c.is_active,
            hotmart_id: c.hotmart_id?.trim() || null,
            hotmart_id_secondary: c.hotmart_id_secondary?.trim() || null,
            buy_link: c.buy_link?.trim() || null,
            price: isNaN(priceNum as number) ? null : priceNum,
            display_order: 2,
          })
        }
      }
    } catch (e) {
      console.error('Error saving complements:', e)
    }
  }
}

// =====================
// GOOGLE DRIVE PACK ARTS ACTIONS
// =====================

export async function generateDriveArtsFolderForPackAction(packId: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  // Buscar informações do pack
  const { data: pack, error: fetchError } = await supabase
    .from('packs')
    .select('id, name, drive_arts_folder_id')
    .eq('id', packId)
    .single()

  if (fetchError || !pack) {
    return { error: 'Pack não encontrado' }
  }

  // Se já tiver pasta vinculada, retorna a existente
  if (pack.drive_arts_folder_id) {
    return {
      success: true,
      folderId: pack.drive_arts_folder_id,
      folderUrl: `https://drive.google.com/drive/folders/${pack.drive_arts_folder_id}`,
      message: 'Pack já possui uma pasta vinculada no Google Drive.',
    }
  }

  try {
    const { folderId, folderUrl } = await createPackArtsFolder(pack.name)

    const { error: updateError } = await supabase
      .from('packs')
      .update({ drive_arts_folder_id: folderId })
      .eq('id', packId)

    if (updateError) {
      return { error: `Erro ao salvar ID da pasta: ${updateError.message}` }
    }

    try {
      revalidateTag('drive-arts', 'default')
    } catch (e) {
      // ignore
    }

    revalidatePath(`/admin/pack/${packId}`, 'page')
    revalidatePath(`/admin/pack/${packId}/edit`, 'page')
    revalidatePath('/admin', 'page')
    revalidatePath('/dashboard')

    return {
      success: true,
      folderId,
      folderUrl,
      message: 'Pasta criada com sucesso no Google Drive!',
    }
  } catch (err: any) {
    return { error: err.message || 'Erro ao criar pasta no Google Drive' }
  }
}

export async function createDriveFolderForNewPackAction(packName: string) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  if (!packName?.trim()) {
    return { error: 'Informe o nome do pack antes de criar a pasta.' }
  }

  try {
    const { folderId, folderUrl } = await createPackArtsFolder(packName)
    return {
      success: true,
      folderId,
      folderUrl,
      message: 'Pasta criada com sucesso no Google Drive!',
    }
  } catch (err: any) {
    return { error: err.message || 'Erro ao criar pasta no Google Drive' }
  }
}

export async function deletePackAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const packId = formData.get('pack_id') as string

  // Clean relations before deleting pack
  const { data: versions } = await supabase.from('pack_versions').select('id').eq('pack_id', packId)
  if (versions && versions.length > 0) {
    const vIds = versions.map((v: any) => v.id)
    await supabase.from('pack_version_links').delete().in('version_id', vIds)
    await supabase.from('pack_versions').delete().eq('pack_id', packId)
  }
  await supabase.from('pack_complements').delete().eq('pack_id', packId)
  await supabase.from('pack_links').delete().eq('pack_id', packId)
  await supabase.from('pack_subsections').delete().eq('pack_id', packId)

  await supabase.from('packs').delete().eq('id', packId)

  try {
    revalidateTag('packs-catalog', 'default')
    revalidateTag('drive-arts', 'default')
  } catch (e) {
    // ignore
  }

  revalidatePath('/admin', 'page')
  revalidatePath('/[lang]/dashboard', 'page')
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

  // Buscar compras de packs
  const { data: purchases } = await supabase
    .from('member_purchases')
    .select('id, pack_id, packs(id, name, cover_image_url, version, parent_pack_id)')
    .eq('member_id', member.id)

  // Filtrar apenas packs principais (sem parent_pack_id)
  const mainPurchases = (purchases || []).filter((p: any) => !p.packs?.parent_pack_id)

  // Buscar compras de complementos (Stories e Personalizado)
  const { data: complementPurchases } = await supabase
    .from('complement_purchases')
    .select('id, complement_id, purchased_at, pack_complements(id, pack_id, type, price, buy_link, packs(id, name, version))')
    .eq('member_id', member.id)

  return {
    member,
    purchases: mainPurchases,
    complementPurchases: complementPurchases || [],
  }
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

  // Remover compra do pack
  await supabase
    .from('member_purchases')
    .delete()
    .eq('member_id', memberId)
    .eq('pack_id', packId)

  // Também remover compras legadas de packs filhos vinculados caso existam
  const { data: childPacks } = await supabase
    .from('packs')
    .select('id')
    .eq('parent_pack_id', packId)

  if (childPacks && childPacks.length > 0) {
    const childIds = childPacks.map((c: any) => c.id)
    await supabase
      .from('member_purchases')
      .delete()
      .eq('member_id', memberId)
      .in('pack_id', childIds)
  }

  return { success: true }
}

export async function assignComplementToMemberAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  const memberId = formData.get('member_id') as string
  const complementId = formData.get('complement_id') as string

  if (!memberId || !complementId) return { error: 'Dados incompletos.' }

  // Verificar se o membro já tem esse complemento
  const { data: existing } = await supabase
    .from('complement_purchases')
    .select('id')
    .eq('member_id', memberId)
    .eq('complement_id', complementId)
    .single()

  if (existing) return { error: 'Membro já possui este complemento.' }

  // Buscar dados do complemento
  const { data: complement } = await supabase
    .from('pack_complements')
    .select('id, pack_id, type')
    .eq('id', complementId)
    .single()

  if (complement?.pack_id) {
    const { data: hasPack } = await supabase
      .from('member_purchases')
      .select('id')
      .eq('member_id', memberId)
      .eq('pack_id', complement.pack_id)
      .single()

    if (!hasPack) {
      await supabase
        .from('member_purchases')
        .insert({ member_id: memberId, pack_id: complement.pack_id })
    }
  }

  const { error } = await supabase
    .from('complement_purchases')
    .insert({ member_id: memberId, complement_id: complementId })

  if (error) return { error: `Erro ao atribuir complemento: ${error.message}` }

  // Se for complemento do tipo 'custom' (Pacote Premium Completo):
  // Desbloquear também Stories e outros complementos do pack
  if (complement?.type === 'custom') {
    if (complement.pack_id) {
      const { data: otherComplements } = await supabase
        .from('pack_complements')
        .select('id')
        .eq('pack_id', complement.pack_id)
        .neq('id', complementId)

      if (otherComplements && otherComplements.length > 0) {
        for (const other of otherComplements) {
          const { data: existingOther } = await supabase
            .from('complement_purchases')
            .select('id')
            .eq('member_id', memberId)
            .eq('complement_id', other.id)
            .maybeSingle()

          if (!existingOther) {
            await supabase
              .from('complement_purchases')
              .insert({ member_id: memberId, complement_id: other.id })
          }
        }
      }
    }

    const { data: existingOrder } = await supabase
      .from('customization_orders')
      .select('id')
      .eq('member_id', memberId)
      .eq('complement_id', complementId)
      .single()

    if (!existingOrder) {
      const { data: member } = await supabase
        .from('members')
        .select('name, email')
        .eq('id', memberId)
        .single()

      await supabase
        .from('customization_orders')
        .insert({
          member_id: memberId,
          complement_id: complementId,
          pack_id: complement.pack_id,
          client_name: member?.name || '',
          client_email: member?.email || '',
          status: 'pending',
          delivery_links: {},
          source_drive_folder_id: '',
          access_token: crypto.randomUUID(),
        })
    }
  }

  return { success: true }
}

export async function removeComplementFromMemberAction(formData: FormData) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { error: 'Não autorizado.' }

  const supabase = await createClient()
  const memberId = formData.get('member_id') as string
  const complementId = formData.get('complement_id') as string

  if (!memberId || !complementId) return { error: 'Dados incompletos.' }

  const { error } = await supabase
    .from('complement_purchases')
    .delete()
    .eq('member_id', memberId)
    .eq('complement_id', complementId)

  if (error) return { error: `Erro ao remover complemento: ${error.message}` }
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
