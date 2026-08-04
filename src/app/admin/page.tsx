import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated, adminLogoutAction } from './actions'
import DeletePackForm from './DeletePackForm'
import { getLocalArtCount } from '@/lib/pack-arts'

export default async function AdminDashboardPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  const { data: packs } = await supabase
    .from('packs')
    .select('*')
    .order('created_at', { ascending: false })

  const allPacks = packs || []

  // Organizar packs em hierarquia: pais primeiro, filhos agrupados abaixo
  const parentPacks = allPacks.filter(p => !p.parent_pack_id)
  const childPacks = allPacks.filter(p => !!p.parent_pack_id)

  // Montar lista ordenada: pai → seus filhos → próximo pai → seus filhos...
  const sortedPacks: typeof allPacks = []
  for (const parent of parentPacks) {
    sortedPacks.push(parent)
    const children = childPacks.filter(c => c.parent_pack_id === parent.id)
    sortedPacks.push(...children)
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <header className="admin-header">
          <div className="admin-header-top">
            <div>
              <h1 className="admin-title">Painel Admin</h1>
              <p className="dashboard-subtitle">
                {allPacks.length} {allPacks.length === 1 ? 'pack cadastrado' : 'packs cadastrados'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/admin/pack/new" className="btn-admin-primary">
                + Novo Pack
              </Link>
              <Link href="/admin/members/new" className="btn-admin-secondary">
                + Adicionar Membro
              </Link>
              <Link href="/admin/members/search" className="btn-admin-secondary">
                🔍 Gerenciar Membro
              </Link>
              <Link href="/admin/marketing" className="btn-admin-secondary">
                📧 Email Marketing
              </Link>
              <Link href="/admin/suggestions" className="btn-admin-secondary">
                💡 Sugestões
              </Link>
              <Link href="/admin/categories" className="btn-admin-secondary">
                📂 Categorias
              </Link>
              <Link href="/admin/icons" className="btn-admin-secondary">
                🎨 Ícones
              </Link>
              <Link href="/admin/webhook-test" className="btn-admin-secondary">
                🧪 Testar Webhook
              </Link>
              <form action={adminLogoutAction}>
                <button type="submit" className="btn-logout">Sair</button>
              </form>
            </div>
          </div>
        </header>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Capa</th>
                <th>Nome</th>
                <th>Versão</th>
                <th>Hotmart ID</th>
                <th>Artes</th>

                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedPacks.map((pack) => {
                const artCount = getLocalArtCount(pack.arts_folder)

                const isChild = !!pack.parent_pack_id

                return (
                  <tr key={pack.id} className={isChild ? 'admin-child-row' : ''}>
                    <td>
                      <div className="admin-table-cover">
                        {pack.cover_image_url ? (
                          <img src={pack.cover_image_url} alt={pack.name} />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {isChild ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>└─</span>
                          <strong style={{ color: 'var(--text-secondary)' }}>{pack.name}</strong>
                        </span>
                      ) : (
                        <strong>{pack.name}</strong>
                      )}
                    </td>
                    <td>
                      <span className="admin-version-badge">{pack.version || '1.0'}</span>
                    </td>
                    <td><code className="admin-code">{pack.hotmart_id}</code></td>
                    <td>{artCount}</td>

                    <td>
                      <div className="admin-actions">
                        <Link href={`/admin/pack/${pack.id}`} className="btn-admin-action btn-view">Ver</Link>
                        <Link href={`/admin/pack/${pack.id}/edit`} className="btn-admin-action btn-edit">Editar</Link>
                        <DeletePackForm packId={pack.id} packName={pack.name} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {allPacks.length === 0 && (
            <div className="admin-empty">
              <p>📦</p>
              <p>Nenhum pack cadastrado ainda.</p>
              <Link href="/admin/pack/new" className="btn-admin-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
                + Criar Primeiro Pack
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
