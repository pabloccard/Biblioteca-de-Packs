import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthenticated } from '../actions'
import { getCampaigns, getMarketingStats } from '../marketing-actions'

export default async function MarketingDashboardPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const [stats, campaigns] = await Promise.all([
    getMarketingStats(),
    getCampaigns(),
  ])

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Rascunho', color: '#71717a' },
    sending: { label: 'Enviando...', color: '#f59e0b' },
    sent: { label: 'Enviada', color: '#22c55e' },
    failed: { label: 'Falha', color: '#ef4444' },
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="admin-header">
          <div className="admin-header-top">
            <div>
              <h1 className="admin-title">📧 Email Marketing</h1>
              <p className="dashboard-subtitle">Gerencie suas campanhas de email</p>
            </div>
            <Link href="/admin/marketing/new" className="btn-admin-primary">+ Nova Campanha</Link>
          </div>
        </header>

        {/* Stats */}
        <div className="mkt-stats-grid">
          <div className="mkt-stat-card">
            <span className="mkt-stat-number">{stats?.totalSubscribed || 0}</span>
            <span className="mkt-stat-label">Inscritos</span>
          </div>
          <div className="mkt-stat-card">
            <span className="mkt-stat-number">{stats?.totalOptOut || 0}</span>
            <span className="mkt-stat-label">Desinscritos</span>
          </div>
          <div className="mkt-stat-card">
            <span className="mkt-stat-number">{stats?.totalCampaigns || 0}</span>
            <span className="mkt-stat-label">Campanhas Enviadas</span>
          </div>
          <div className="mkt-stat-card">
            <span className="mkt-stat-number">{stats?.totalMembers || 0}</span>
            <span className="mkt-stat-label">Total de Membros</span>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="admin-form-section" style={{ marginTop: '32px' }}>
          <h2 className="admin-form-section-title">Campanhas</h2>
          {campaigns.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '24px 0', textAlign: 'center' }}>
              Nenhuma campanha criada ainda.
            </p>
          ) : (
            <div className="mkt-campaigns-list">
              {campaigns.map(c => {
                const s = statusLabels[c.status] || statusLabels.draft
                const openRate = c.total_sent > 0 ? Math.round((c.total_opened / c.total_sent) * 100) : 0
                return (
                  <Link key={c.id} href={`/admin/marketing/${c.id}`} className="mkt-campaign-row">
                    <div className="mkt-campaign-info">
                      <span className="mkt-campaign-subject">{c.name || c.subject}</span>
                      {c.name && <span className="mkt-campaign-date" style={{ color: 'var(--text-secondary)' }}>{c.subject}</span>}
                      <span className="mkt-campaign-date">
                        {c.sent_at ? new Date(c.sent_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Não enviada'}
                      </span>
                    </div>
                    <div className="mkt-campaign-stats">
                      {c.status === 'sent' && (
                        <>
                          <span className="mkt-campaign-metric">{c.total_sent} <small>enviados</small></span>
                          <span className="mkt-campaign-metric">{openRate}% <small>abertos</small></span>
                        </>
                      )}
                      <span className="mkt-campaign-badge" style={{ background: `${s.color}20`, color: s.color }}>{s.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
