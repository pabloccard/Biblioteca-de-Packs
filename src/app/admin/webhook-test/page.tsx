import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../actions'
import WebhookTestForm from './WebhookTestForm'

export default async function WebhookTestPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: packs } = await supabase.from('packs').select('id, name, hotmart_id').order('name')

  return <WebhookTestForm packs={packs || []} />
}
