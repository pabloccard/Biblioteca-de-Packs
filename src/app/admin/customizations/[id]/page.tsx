import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../../actions'
import { generateCustomizeSlug } from '@/lib/customization-slug'
import OrderDetailClient from './OrderDetailClient'

export default async function CustomizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('customization_orders')
    .select('*, packs(id, name, cover_image_url, language, art_custom_fields)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const { data: arts } = await supabase
    .from('customization_arts')
    .select('*')
    .eq('order_id', id)
    .order('display_order')

  const { data: deliveryFiles } = await supabase
    .from('customization_delivery_files')
    .select('*')
    .eq('order_id', id)
    .order('display_order')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const customizeSlug = generateCustomizeSlug(order.client_name, order.access_token)
  const customizeLink = `${appUrl}/customize/${customizeSlug}`

  return (
    <div className="admin-page-container">
      <Link href="/admin/customizations" className="pack-back-btn">
        ← Voltar para Personalizações
      </Link>

      <header className="admin-view-header" style={{ marginBottom: '24px' }}>
        <div className="admin-view-header-text">
          <h1 className="admin-view-title">Pedido de Personalização</h1>
          <p className="admin-view-subtitle">{(order.packs as { name: string } | null)?.name || 'Pack removido'}</p>
        </div>
      </header>

      <OrderDetailClient
        order={order}
        initialArts={arts || []}
        customizeLink={customizeLink}
      />
    </div>
  )
}
