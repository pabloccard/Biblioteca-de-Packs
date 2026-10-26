import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../actions'
import WebhookTestForm from './WebhookTestForm'

export default async function WebhookTestPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  const [{ data: packs }, { data: complements }] = await Promise.all([
    supabase
      .from('packs')
      .select('id, name, version, hotmart_id')
      .is('parent_pack_id', null)
      .order('name'),
    supabase
      .from('pack_complements')
      .select('id, pack_id, type, hotmart_id, packs(id, name, version)')
      .eq('is_active', true)
      .order('type'),
  ])

  return (
    <WebhookTestForm
      packs={packs || []}
      complements={(complements || []) as any}
    />
  )
}
