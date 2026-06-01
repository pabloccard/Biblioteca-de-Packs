import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import CampaignForm from './CampaignForm'

export default async function NewCampaignPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: packs } = await supabase
    .from('packs')
    .select('id, name, version, parent_pack_id')
    .order('name')

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin/marketing" className="pack-back-btn">← Voltar</Link>
        <header className="pack-header"><h1 className="pack-name">Nova Campanha</h1></header>
        <CampaignForm packs={packs || []} />
      </div>
    </div>
  )
}
