import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import SearchMemberForm from './SearchMemberForm'

export default async function SearchMemberPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: packs } = await supabase.from('packs').select('id, name, version, parent_pack_id').order('name')

  return <SearchMemberForm allPacks={packs || []} />
}
