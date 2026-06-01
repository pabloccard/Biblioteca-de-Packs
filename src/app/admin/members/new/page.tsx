import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import AddMemberForm from './AddMemberForm'

export default async function AddMemberPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: packs } = await supabase.from('packs').select('id, name, version, parent_pack_id').order('name')

  return <AddMemberForm allPacks={packs || []} />
}
