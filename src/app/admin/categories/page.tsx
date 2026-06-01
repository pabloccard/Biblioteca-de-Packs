import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../actions'
import CategoryForm from './CategoryForm'
import DeleteCategoryButton from './DeleteCategoryButton'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: categories } = await supabase.from('pack_categories').select('*').order('name', { ascending: true })

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header">
          <h1 className="pack-name">Gerenciar Categorias</h1>
          <p style={{ color: 'var(--text-muted)' }}>Crie categorias para organizar seus packs.</p>
        </header>

        <div className="admin-form-section" style={{ marginBottom: '24px' }}>
          <h2 className="admin-form-section-title">Adicionar Nova Categoria</h2>
          <CategoryForm />
        </div>

        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Categorias Salvas</h2>
          {categories && categories.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {categories.map((cat) => (
                <div key={cat.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)' }}>{cat.name}</strong>
                    <code style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'rgba(0, 82, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{cat.tag}</code>
                  </div>
                  <DeleteCategoryButton categoryId={cat.id} categoryName={cat.name} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma categoria cadastrada ainda.</p>
          )}
        </div>
      </div>
    </div>
  )
}
