import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../../actions'
import EditPackForm from './EditPackForm'

interface Props { params: Promise<{ id: string }> }

export default async function AdminPackEditPage({ params }: Props) {
  const { id } = await params
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: pack } = await supabase.from('packs').select('*').eq('id', id).single()
  if (!pack) notFound()

  const [{ data: links }, { data: subsections }, { data: categories }, { data: icons }, { data: specs }, { data: parentPacksData }] = await Promise.all([
    supabase.from('pack_links').select('*').eq('pack_id', id).order('display_order', { ascending: true }),
    supabase.from('pack_subsections').select('*').eq('pack_id', id).order('display_order', { ascending: true }),
    supabase.from('pack_categories').select('*').order('name'),
    supabase.from('subsection_icons').select('*').order('name'),
    supabase.from('pack_specs').select('*').eq('pack_id', id).order('display_order', { ascending: true }),
    supabase.from('packs').select('id, name').is('parent_pack_id', null).order('name'),
  ])

  return <EditPackForm pack={pack} existingLinks={links || []} existingSubsections={subsections || []} categories={categories || []} icons={icons || []} existingSpecs={specs || []} parentPacks={parentPacksData || []} />
}
