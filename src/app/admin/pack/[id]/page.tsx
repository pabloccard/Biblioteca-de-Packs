import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import { getLocalArts } from '@/lib/pack-arts'

interface Props { params: Promise<{ id: string }> }

export default async function AdminPackViewPage({ params }: Props) {
  const { id } = await params
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: pack } = await supabase.from('packs').select('*').eq('id', id).single()
  if (!pack) notFound()

  const { data: links } = await supabase.from('pack_links').select('*').eq('pack_id', id).order('display_order', { ascending: true })
  const { data: purchases } = await supabase.from('member_purchases').select('*, members(name, email)').eq('pack_id', id)

  const packArts = getLocalArts(pack.arts_folder, pack.art_captions)
  const packLinks = links || []
  const packPurchases = purchases || []

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
          <div>
            <h1 className="pack-name">{pack.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hotmart ID: <code className="admin-code">{pack.hotmart_id}</code></p>
          </div>
          <Link href={`/admin/pack/${id}/edit`} className="btn-admin-primary">Editar Pack</Link>
        </header>

        {/* Stats: apenas artes */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card"><span className="admin-stat-value">{packArts.length}</span><span className="admin-stat-label">Artes Cadastradas</span></div>
        </div>

        {pack.cover_image_url && (
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">Capa</h2>
            <div className="admin-cover-preview"><img src={pack.cover_image_url} alt={pack.name} /></div>
          </div>
        )}

        {/* Links */}
        {packLinks.length > 0 && (
          <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
            <h2 className="admin-form-section-title">Links ({packLinks.length})</h2>
            <div className="admin-links-list">
              {packLinks.map((link) => (
                <div key={link.id} className="admin-link-item">
                  <span>{link.label_pt}:</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artes com scroll interno */}
        <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
          <h2 className="admin-form-section-title">Artes ({packArts.length})</h2>
          <div className="admin-arts-scroll">
            <div className="admin-arts-grid">
              {packArts.map((art) => (
                <div key={art.number} className="admin-art-card">
                  <img src={art.imageUrl} alt={art.caption || 'Arte'} />
                  <div className="admin-art-card-info">
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#{art.number}</span>
                    <p>{art.caption || 'Sem legenda'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compradores */}
        {packPurchases.length > 0 && (
          <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
            <h2 className="admin-form-section-title">Compradores ({packPurchases.length})</h2>
            <div className="admin-table-wrapper" style={{ marginBottom: 0 }}>
              <table className="admin-table">
                <thead><tr><th>Nome</th><th>Email</th><th>Data</th></tr></thead>
                <tbody>
                  {packPurchases.map((p) => {
                    const m = p.members as { name: string; email: string } | null
                    return <tr key={p.id}><td>{m?.name || '-'}</td><td>{m?.email || '-'}</td><td>{new Date(p.purchased_at).toLocaleDateString('pt-BR')}</td></tr>
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
