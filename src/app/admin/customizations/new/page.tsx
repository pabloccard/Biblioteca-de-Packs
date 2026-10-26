import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import NewCustomizationForm from './NewCustomizationForm'

export default async function NewCustomizationPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: packs } = await supabase
    .from('packs')
    .select('id, name, version')
    .is('parent_pack_id', null)
    .order('name')

  return (
    <div className="admin-page-container">
      <Link href="/admin/customizations" className="pack-back-btn">
        ← Voltar para Personalizações
      </Link>

      <header className="admin-view-header" style={{ marginBottom: '24px' }}>
        <div className="admin-view-header-text">
          <h1 className="admin-view-title">Novo Pedido de Personalização</h1>
          <p className="admin-view-subtitle">Cadastre um pedido manual e configure os links de entrega do cliente.</p>
        </div>
      </header>

      <NewCustomizationForm packs={packs || []} />
    </div>
  )
}
