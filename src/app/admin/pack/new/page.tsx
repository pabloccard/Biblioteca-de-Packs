import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import NewPackForm from './NewPackForm'

export const dynamic = 'force-dynamic'

export default async function AdminNewPackPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const [{ data: categories }, { data: icons }, { data: parentPacksData }] = await Promise.all([
    supabase.from('pack_categories').select('*').order('name'),
    supabase.from('subsection_icons').select('*').order('name'),
    supabase.from('packs').select('id, name').is('parent_pack_id', null).order('name'),
  ])

  return <NewPackForm categories={categories || []} icons={icons || []} parentPacks={parentPacksData || []} />
}
