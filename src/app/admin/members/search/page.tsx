import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import SearchMemberForm from './SearchMemberForm'

export default async function SearchMemberPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const [{ data: packs }, { data: complements }] = await Promise.all([
    supabase
      .from('packs')
      .select('id, name, version')
      .is('parent_pack_id', null)
      .order('name'),
    supabase
      .from('pack_complements')
      .select('id, pack_id, type, packs(id, name, version)')
      .eq('is_active', true)
      .order('type'),
  ])

  return <SearchMemberForm allPacks={packs || []} allComplements={(complements || []) as any} />
}
