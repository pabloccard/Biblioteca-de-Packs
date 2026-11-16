import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import { getPackArts } from '@/lib/pack-arts'

interface Props { params: Promise<{ id: string }> }

export default async function AdminPackViewPage({ params }: Props) {
  const { id } = await params
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: pack } = await supabase.from('packs').select('*').eq('id', id).single()
  if (!pack) notFound()

  const [
    { data: versions },
    { data: complements },
    { data: purchases },
    { data: complementPurchases },
  ] = await Promise.all([
    supabase
      .from('pack_versions')
      .select('*, pack_version_links(*)')
      .eq('pack_id', id)
      .order('display_order', { ascending: true }),
    supabase
      .from('pack_complements')
      .select('*')
      .eq('pack_id', id)
      .order('display_order', { ascending: true }),
    supabase
      .from('member_purchases')
      .select('*, members(name, email)')
      .eq('pack_id', id),
    supabase
      .from('complement_purchases')
      .select('*, members(name, email), pack_complements!inner(pack_id, type)')
      .eq('pack_complements.pack_id', id),
  ])

  const packArts = await getPackArts(pack)
  const packVersions = versions || []
  const packComplements = complements || []
  const packPurchases = purchases || []
  const packCompPurchases = complementPurchases || []

  const storiesComp = packComplements.find(c => c.type === 'stories')
  const customComp = packComplements.find(c => c.type === 'custom')

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1100px' }}>
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <h1 className="pack-name">{pack.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Hotmart ID: <code className="admin-code">{pack.hotmart_id}</code>
              {pack.version && <span style={{ marginLeft: '12px' }}>v{pack.version}</span>}
              <span style={{ marginLeft: '12px' }}>Idioma: {pack.language.toUpperCase()}</span>
            </p>
          </div>
          <Link href={`/admin/pack/${id}/edit`} className="btn-admin-primary" style={{ padding: '10px 20px' }}>
            ✏️ Editar Pack
          </Link>
        </header>

        {/* Stats */}
        <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{packVersions.length}</span>
            <span className="admin-stat-label">Versões de Cores</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{packArts.length}</span>
            <span className="admin-stat-label">Artes no Pack</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{packPurchases.length}</span>
            <span className="admin-stat-label">Compradores do Pack</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{packCompPurchases.length}</span>
            <span className="admin-stat-label">Vendas de Complementos</span>
          </div>
        </div>

        {/* VERSÕES DE CORES & LINKS */}
        <div className="admin-form-section" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="admin-form-section-title" style={{ margin: 0 }}>
              📦 Versões do Pack ({packVersions.length})
            </h2>
            <Link href={`/admin/pack/${id}/edit`} className="btn-admin-secondary" style={{ fontSize: '0.8rem' }}>
              + Gerenciar Versões
            </Link>
          </div>

          {packVersions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Nenhuma versão configurada. Clique em Editar Pack para adicionar.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {packVersions.map((v) => {
                const links = v.pack_version_links || []
                const feedLinks = links.filter((l: any) => l.format === 'feed')
                const storiesLinks = links.filter((l: any) => l.format === 'stories')

                return (
                  <div
                    key={v.id}
                    style={{
                      background: '#111111',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {v.cover_image_url ? (
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={v.cover_image_url} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <span style={{ fontSize: '1.2rem' }}>📁</span>
                        )}
                        <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{v.name}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {links.length} link(s) cadastrado(s)
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                      {/* Feed Links */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #0088ff' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>
                          🖼️ Formato Feed ({feedLinks.length})
                        </div>
                        {feedLinks.length === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sem links</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {feedLinks.map((l: any) => (
                              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>[{l.platform}]:</span>
                                <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {l.url}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stories Links */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #f97316' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fb923c', marginBottom: '6px' }}>
                          📱 Formato Stories ({storiesLinks.length})
                        </div>
                        {storiesLinks.length === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sem links</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {storiesLinks.map((l: any) => (
                              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>[{l.platform}]:</span>
                                <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#fb923c', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {l.url}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* COMPLEMENTOS */}
        <div className="admin-form-section" style={{ marginBottom: '24px' }}>
          <h2 className="admin-form-section-title">⚡ Complementos Configurados</h2>
          <div className="admin-complements-grid" style={{ marginTop: '12px' }}>
            {/* Stories */}
            <div className={`admin-complement-card ${storiesComp?.is_active ? 'stories-active' : ''}`}>
              <div className="admin-complement-header">
                <div className="admin-complement-info">
                  <div className="admin-complement-icon stories">📱</div>
                  <div>
                    <h3 className="admin-complement-title">Complemento Stories</h3>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: storiesComp?.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.1)', color: storiesComp?.is_active ? '#4ade80' : 'var(--text-muted)' }}>
                      {storiesComp?.is_active ? '✅ Ativo' : '⚪ Inativo'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Hotmart ID: <code className="admin-code">{storiesComp?.hotmart_id || 'Não informado'}</code></div>
                <div>Preço: <strong>{storiesComp?.price ? `R$ ${storiesComp.price}` : 'Não informado'}</strong></div>
                {storiesComp?.buy_link && (
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Checkout: <a href={storiesComp.buy_link} target="_blank" rel="noopener noreferrer" style={{ color: '#fb923c', textDecoration: 'underline' }}>{storiesComp.buy_link}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Custom */}
            <div className={`admin-complement-card ${customComp?.is_active ? 'active' : ''}`}>
              <div className="admin-complement-header">
                <div className="admin-complement-info">
                  <div className="admin-complement-icon custom">🎨</div>
                  <div>
                    <h3 className="admin-complement-title">Complemento Personalização</h3>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: customComp?.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.1)', color: customComp?.is_active ? '#4ade80' : 'var(--text-muted)' }}>
                      {customComp?.is_active ? '✅ Ativo' : '⚪ Inativo'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Hotmart ID (Principal): <code className="admin-code">{customComp?.hotmart_id || 'Não informado'}</code></div>
                {customComp?.hotmart_id_secondary && (
                  <div>Hotmart ID (Secundário): <code className="admin-code">{customComp.hotmart_id_secondary}</code></div>
                )}
                <div>Preço: <strong>{customComp?.price ? `R$ ${customComp.price}` : 'Não informado'}</strong></div>
                {customComp?.buy_link && (
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Checkout: <a href={customComp.buy_link} target="_blank" rel="noopener noreferrer" style={{ color: '#0088ff', textDecoration: 'underline' }}>{customComp.buy_link}</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Capa */}
        {pack.cover_image_url && (
          <div className="admin-form-section" style={{ marginBottom: '24px' }}>
            <h2 className="admin-form-section-title">Capa do Pack</h2>
            <div className="admin-cover-preview" style={{ maxWidth: '300px' }}>
              <img src={pack.cover_image_url} alt={pack.name} style={{ borderRadius: '12px' }} />
            </div>
          </div>
        )}

        {/* Artes da pasta ou Drive */}
        <div className="admin-form-section" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 className="admin-form-section-title" style={{ marginBottom: 0 }}>
              Artes de Amostra ({packArts.length})
            </h2>
            {pack.drive_arts_folder_id && (
              <a
                href={`https://drive.google.com/drive/folders/${pack.drive_arts_folder_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-admin-action"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#60a5fa',
                  background: 'rgba(59, 130, 246, 0.12)',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                }}
              >
                <span>📁</span> Abrir Pasta no Google Drive ↗
              </a>
            )}
          </div>
          {packArts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma arte de amostra cadastrada.</p>
          ) : (
            <div className="admin-arts-scroll">
              <div className="admin-arts-grid">
                {packArts.map((art) => (
                  <div key={art.id || art.number} className="admin-art-card">
                    <img src={art.imageUrl} alt={art.caption || art.name || 'Arte'} />
                    <div className="admin-art-card-info">
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        #{art.number} {art.name ? `• ${art.name}` : ''}
                      </span>
                      {art.caption && (
                        <p style={{ marginTop: '6px', whiteSpace: 'pre-line', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {art.caption}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compradores */}
        {packPurchases.length > 0 && (
          <div className="admin-form-section" style={{ marginBottom: '24px' }}>
            <h2 className="admin-form-section-title">Compradores do Pack ({packPurchases.length})</h2>
            <div className="admin-table-wrapper" style={{ marginBottom: 0 }}>
              <table className="admin-table">
                <thead><tr><th>Nome</th><th>Email</th><th>Data da Compra</th></tr></thead>
                <tbody>
                  {packPurchases.map((p) => {
                    const m = p.members as { name: string; email: string } | null
                    return (
                      <tr key={p.id}>
                        <td>{m?.name || '-'}</td>
                        <td>{m?.email || '-'}</td>
                        <td>{new Date(p.purchased_at).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ paddingBottom: 'var(--space-3xl)' }} />
      </div>
    </div>
  )
}
