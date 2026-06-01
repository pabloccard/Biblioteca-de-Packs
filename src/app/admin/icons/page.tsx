import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../actions'
import UploadIconForm from './UploadIconForm'
import DeleteIconButton from './DeleteIconButton'

export const dynamic = 'force-dynamic'

export default async function AdminIconsPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: icons } = await supabase.from('subsection_icons').select('*').order('created_at', { ascending: false })

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header">
          <h1 className="pack-name">Gerenciar Ícones</h1>
          <p style={{ color: 'var(--text-muted)' }}>Faça o upload de ícones aqui para usá-los nas subseções de qualquer pack.</p>
        </header>

        <div className="admin-form-section" style={{ marginBottom: '24px' }}>
          <h2 className="admin-form-section-title">Adicionar Novo Ícone</h2>
          <UploadIconForm />
        </div>

        <div className="admin-form-section">
          <h2 className="admin-form-section-title">Ícones Salvos</h2>
          {icons && icons.length > 0 ? (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {icons.map((icon) => (
                <div key={icon.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '120px', background: 'rgba(255,255,255,0.02)' }}>
                  <img src={icon.image_url} alt={icon.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', wordBreak: 'break-word' }}>{icon.name}</span>
                  <DeleteIconButton iconId={icon.id} imageUrl={icon.image_url} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum ícone cadastrado ainda.</p>
          )}
        </div>

      </div>
    </div>
  )
}
