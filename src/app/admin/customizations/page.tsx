import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../actions'
import AdminCustomizationsTable, { CustomizationOrderRow } from '@/components/admin/AdminCustomizationsTable'
import GoogleDriveConnectionCard from './GoogleDriveConnectionCard'

export const dynamic = 'force-dynamic'

export default async function CustomizationsListPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('customization_orders')
    .select('*, packs(name)')
    .order('created_at', { ascending: false })

  const allOrders = orders || []

  const orderRows: CustomizationOrderRow[] = allOrders.map((order) => ({
    id: order.id,
    status: order.status,
    client_name: order.client_name,
    client_email: order.client_email,
    pack_name: (order.packs as { name: string } | null)?.name || 'Pack não identificado',
    created_at: order.created_at,
  }))

  return (
    <div className="admin-page-container">
      {/* Top Header Bar */}
      <header className="admin-view-header">
        <div className="admin-view-header-text">
          <h1 className="admin-view-title">Personalizações</h1>
          <p className="admin-view-subtitle">
            Gerencie os pedidos de personalização, acompanhe produção e entregas.
          </p>
        </div>

        <div className="admin-view-header-actions">
          <Link href="/admin/customizations/new" className="admin-btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Novo Pedido</span>
          </Link>
        </div>
      </header>

      {/* Google Drive Connection Card */}
      <Suspense fallback={null}>
        <GoogleDriveConnectionCard />
      </Suspense>

      {/* Table Section */}
      <section className="admin-content-section">
        <AdminCustomizationsTable orders={orderRows} />
      </section>
    </div>
  )
}
