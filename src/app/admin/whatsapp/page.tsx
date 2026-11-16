import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthenticated } from '../actions'
import { getWhatsAppCampaignsAction, getWhatsAppDashboardStatsAction } from '../whatsapp-actions'

export const dynamic = 'force-dynamic'

export default async function WhatsAppDashboardPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const [stats, campaigns] = await Promise.all([
    getWhatsAppDashboardStatsAction(),
    getWhatsAppCampaignsAction(),
  ])

  const percentWithPhone =
    stats && stats.totalMembers > 0
      ? Math.round((stats.membersWithPhone / stats.totalMembers) * 100)
      : 0

  return (
    <div className="wa-container">
      {/* Top Header */}
      <div className="wa-header">
        <div className="wa-title-wrap">
          <Link href="/admin" className="pack-back-btn" style={{ marginBottom: '8px', display: 'inline-block' }}>
            ← Voltar ao painel
          </Link>
          <h1 className="wa-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>WhatsApp Marketing CRM</span>
          </h1>
          <p className="wa-subtitle">
            Gerencie disparos no WhatsApp segmentados por nicho e idioma, com controle individual de envio.
          </p>
        </div>

        <div className="wa-actions">
          <Link href="/admin/whatsapp/import" className="wa-btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Importar Planilha</span>
          </Link>

          <Link href="/admin/whatsapp/new" className="wa-btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nova Campanha</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="wa-stats-grid">
        <div className="wa-stat-card">
          <span className="wa-stat-value" style={{ color: '#25D366' }}>
            {stats?.membersWithPhone || 0}
          </span>
          <span className="wa-stat-label">
            Com WhatsApp ({percentWithPhone}% de {stats?.totalMembers || 0})
          </span>
        </div>

        <div className="wa-stat-card">
          <span className="wa-stat-value">{stats?.totalCampaigns || 0}</span>
          <span className="wa-stat-label">Campanhas Criadas</span>
        </div>

        <div className="wa-stat-card">
          <span className="wa-stat-value" style={{ color: '#60A5FA' }}>
            {stats?.totalSentMessages || 0}
          </span>
          <span className="wa-stat-label">Mensagens Já Enviadas</span>
        </div>
      </div>

      {/* Campaigns List */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
          Campanhas Ativas
        </h2>

        {campaigns.length === 0 ? (
          <div
            style={{
              background: '#141416',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#A1A1AA', fontSize: '15px', margin: '0 0 16px 0' }}>
              Nenhuma campanha de WhatsApp criada ainda.
            </p>
            <Link href="/admin/whatsapp/new" className="wa-btn-primary">
              Criar Primeira Campanha
            </Link>
          </div>
        ) : (
          <div className="wa-campaigns-grid">
            {campaigns.map((c) => (
              <Link key={c.id} href={`/admin/whatsapp/${c.id}`} className="wa-campaign-card">
                <div className="wa-campaign-info">
                  <div className="wa-campaign-top-badges">
                    <span className="wa-badge wa-badge-niche">
                      {c.niche === 'provedor' ? '🌐 Provedor' : c.niche === 'hamburgueria' ? '🍔 Hamburgueria' : c.niche}
                    </span>
                    <span className="wa-badge wa-badge-lang">
                      {c.language.toUpperCase()}
                    </span>
                    {c.pack && (
                      <span style={{ fontSize: '12px', color: '#71717A' }}>
                        • {c.pack.name} {c.pack.version ? `(${c.pack.version})` : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="wa-campaign-name">{c.name}</h3>
                  <span style={{ fontSize: '12px', color: '#71717A' }}>
                    Criada em {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="wa-campaign-stats">
                  <div className="wa-progress-wrap">
                    <div className="wa-progress-text">
                      <span>{c.progress}% concluído</span>
                      <span>{c.sentRecipients}/{c.totalRecipients}</span>
                    </div>
                    <div className="wa-progress-bar-bg">
                      <div className="wa-progress-bar-fill" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>

                  <span className="wa-btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                    Abrir Disparos →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
