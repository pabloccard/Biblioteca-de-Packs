import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import NewCampaignForm from './NewCampaignForm'

export const dynamic = 'force-dynamic'

export default async function NewWhatsAppCampaignPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  // Buscar todos os packs principais com categoria
  const { data: packs } = await supabase
    .from('packs')
    .select('id, name, version, language, buy_link, category_id, pack_categories(tag, name)')
    .order('name')

  return (
    <div className="wa-container">
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/whatsapp" className="pack-back-btn" style={{ marginBottom: '8px', display: 'inline-block' }}>
          ← Voltar para Campanhas
        </Link>
        <h1 className="wa-title">
          <span>Nova Campanha de WhatsApp</span>
        </h1>
        <p className="wa-subtitle">
          Configure a campanha selecionando o Pack de destino. O sistema segmentará os compradores daquele nicho e idioma automaticamente.
        </p>
      </div>

      <NewCampaignForm packs={packs || []} />
    </div>
  )
}
