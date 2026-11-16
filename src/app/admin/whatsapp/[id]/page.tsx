import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthenticated } from '../../actions'
import { getWhatsAppCampaignDetailAction } from '../../whatsapp-actions'
import CampaignExecutionView from './CampaignExecutionView'

export const dynamic = 'force-dynamic'

interface CampaignPageProps {
  params: Promise<{ id: string }>
}

export default async function WhatsAppCampaignDetailPage({ params }: CampaignPageProps) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const { id } = await params
  const campaign = await getWhatsAppCampaignDetailAction(id)

  if (!campaign) {
    redirect('/admin/whatsapp')
  }

  return (
    <div className="wa-container">
      <div style={{ marginBottom: '20px' }}>
        <Link href="/admin/whatsapp" className="pack-back-btn" style={{ marginBottom: '8px', display: 'inline-block' }}>
          ← Voltar para Campanhas
        </Link>
      </div>

      <CampaignExecutionView campaign={campaign} />
    </div>
  )
}
