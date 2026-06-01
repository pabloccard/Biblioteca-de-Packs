import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthenticated } from '../../actions'
import { getCampaignDetails } from '../../marketing-actions'
import CampaignSendButton from './CampaignSendButton'

interface CampaignDetailProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: CampaignDetailProps) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const { id } = await params
  const data = await getCampaignDetails(id)

  if (!data) {
    return (
      <div className="page-wrapper"><div className="container">
        <Link href="/admin/marketing" className="pack-back-btn">← Voltar</Link>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '80px' }}>Campanha não encontrada.</p>
      </div></div>
    )
  }

  const { campaign, sends } = data
  const openRate = campaign.total_sent > 0 ? Math.round((campaign.total_opened / campaign.total_sent) * 100) : 0
  const clickRate = campaign.total_sent > 0 ? Math.round(((campaign.total_clicked || 0) / campaign.total_sent) * 100) : 0

  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: 'Rascunho', color: '#71717a' },
    sending: { label: 'Enviando...', color: '#f59e0b' },
    sent: { label: 'Enviada', color: '#22c55e' },
    failed: { label: 'Falha', color: '#ef4444' },
  }

  const s = statusMap[campaign.status] || statusMap.draft

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin/marketing" className="pack-back-btn">← Voltar</Link>

        <header style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 className="pack-name" style={{ margin: 0 }}>{campaign.subject}</h1>
            <span className="mkt-campaign-badge" style={{ background: `${s.color}20`, color: s.color }}>{s.label}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Criada em {new Date(campaign.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
          </p>
        </header>

        {/* Stats */}
        <div className="mkt-stats-grid">
          <div className="mkt-stat-card">
            <span className="mkt-stat-number">{campaign.total_recipients}</span>
            <span className="mkt-stat-label">Destinatários</span>
          </div>
          <div className="mkt-stat-card">
            <span className="mkt-stat-number" style={{ color: 'var(--success)' }}>{campaign.total_sent}</span>
            <span className="mkt-stat-label">Enviados</span>
          </div>
          <div className="mkt-stat-card">
            <span className="mkt-stat-number" style={{ color: '#3b82f6' }}>{openRate}%</span>
            <span className="mkt-stat-label">Abriram</span>
          </div>
          <div className="mkt-stat-card">
            <span className="mkt-stat-number" style={{ color: '#a78bfa' }}>{clickRate}%</span>
            <span className="mkt-stat-label">Clicaram</span>
          </div>
          <div className="mkt-stat-card">
            <span className="mkt-stat-number" style={{ color: campaign.total_failed > 0 ? 'var(--error)' : 'var(--text-muted)' }}>{campaign.total_failed}</span>
            <span className="mkt-stat-label">Falhas</span>
          </div>
        </div>

        {/* Send Button */}
        {campaign.status === 'draft' && (
          <div style={{ marginTop: '24px' }}>
            <CampaignSendButton campaignId={campaign.id} recipientCount={campaign.total_recipients} />
          </div>
        )}

        {/* Preview do Email */}
        <div className="admin-form-section" style={{ marginTop: '32px' }}>
          <h2 className="admin-form-section-title">Preview do Email</h2>
          <div className="mkt-preview-frame">
            <div dangerouslySetInnerHTML={{ __html: campaign.html_content }} />
          </div>
        </div>

        {/* Lista de Envios */}
        <div className="admin-form-section" style={{ marginTop: '32px' }}>
          <h2 className="admin-form-section-title">Destinatários ({sends.length})</h2>
          <div className="admin-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Abriu</th>
                  <th>Clicou</th>
                </tr>
              </thead>
              <tbody>
                {sends.map(send => {
                  const sendStatus = send.status === 'sent' ? { label: '✅ Enviado', color: '#22c55e' } :
                    send.status === 'failed' ? { label: '❌ Falha', color: '#ef4444' } :
                    { label: '⏳ Pendente', color: '#71717a' }
                  return (
                    <tr key={send.id}>
                      <td>{send.email}</td>
                      <td>{send.member_name || '—'}</td>
                      <td><span style={{ color: sendStatus.color, fontSize: '0.85rem' }}>{sendStatus.label}</span></td>
                      <td>
                        {send.opened ? (
                          <span style={{ color: '#3b82f6', fontSize: '0.85rem' }}>👁️ {send.opened_at ? new Date(send.opened_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) : 'Sim'}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        {send.clicked ? (
                          <span style={{ color: '#a78bfa', fontSize: '0.85rem' }}>🔗 {send.clicked_at ? new Date(send.clicked_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) : 'Sim'}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
