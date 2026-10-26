import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMemberSession } from '../../../actions'
import { getDictionary, Locale } from '@/lib/dictionaries'
import { getPackArts } from '@/lib/pack-arts'
import PackOverview from './PackOverview'

interface PackPageProps {
  params: Promise<{ id: string; lang: string }>
  searchParams?: Promise<{ tab?: string }>
}

export default async function PackPage({ params, searchParams }: PackPageProps) {
  const { id, lang } = await params
  const { tab } = (await searchParams) || {}
  const session = await getMemberSession()
  const dict: any = await getDictionary(lang as Locale, 'pack')

  if (!session.email) {
    redirect('/')
  }

  const supabase = await createClient()

  // Get member ID directly from session cookie, with fallback to DB
  let memberId = session.id
  if (!memberId) {
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('email', session.email)
      .single()

    if (!member) redirect('/')
    memberId = member.id
  }

  // Verify pack purchase
  const { data: purchase } = await supabase
    .from('member_purchases')
    .select('id')
    .eq('member_id', memberId)
    .eq('pack_id', id)
    .single()

  if (!purchase) redirect(`/${lang}/dashboard`)

  // Fetch pack (apenas colunas necessárias)
  const { data: pack } = await supabase
    .from('packs')
    .select('id, name, version, cover_image_url, drive_arts_folder_id, arts_folder, art_captions')
    .eq('id', id)
    .single()

  if (!pack) notFound()

  // Fetch versions, complements, and complement purchases in parallel
  const [
    { data: versions },
    { data: complements },
    { data: complementPurchases },
    { data: customOrders },
  ] = await Promise.all([
    supabase
      .from('pack_versions')
      .select('id, name, cover_image_url, display_order')
      .eq('pack_id', id)
      .order('display_order', { ascending: true }),
    supabase
      .from('pack_complements')
      .select('id, type, buy_link, price, description_pt, description_es, description_en, display_order')
      .eq('pack_id', id)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('complement_purchases')
      .select('complement_id')
      .eq('member_id', memberId),
    supabase
      .from('customization_orders')
      .select('id, status, delivery_links, custom_cover_url, complement_id, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false }),
  ])

  const purchasedComplementIds = new Set(
    (complementPurchases || []).map((cp: { complement_id: string }) => cp.complement_id)
  )

  // Build complements data with purchase status
  const complementsData = (complements || []).map((c: any) => {
    const hasOrder = (customOrders || []).some((o: any) => o.complement_id === c.id)
    const isPurchased = purchasedComplementIds.has(c.id) || (c.type === 'custom' && hasOrder)
    let customStatus: 'not_purchased' | 'pending' | 'delivered' = 'not_purchased'
    let customDeliveryLinks: any = null
    let customCoverUrl: string | null = null

    if (c.type === 'custom' && isPurchased) {
      const order = (customOrders || []).find((o: any) => o.complement_id === c.id)
      if (order) {
        customStatus = order.status === 'delivered' ? 'delivered' : 'pending'
        customDeliveryLinks = order.delivery_links
        customCoverUrl = order.custom_cover_url || order.delivery_links?.custom_cover_url || null
      } else {
        customStatus = 'pending'
      }
    }

    return {
      id: c.id,
      type: c.type as 'stories' | 'custom',
      buyLink: c.buy_link || '',
      price: c.price,
      descriptionPt: c.description_pt || '',
      descriptionEs: c.description_es || '',
      descriptionEn: c.description_en || '',
      isPurchased,
      customStatus,
      customDeliveryLinks,
      customCoverUrl,
    }
  })

  // Build versions data
  const versionsData = (versions || []).map((v: any) => ({
    id: v.id,
    name: v.name,
    coverImageUrl: v.cover_image_url,
    displayOrder: v.display_order,
  }))

  // Check if stories complement is purchased
  const storiesComplement = complementsData.find((c: any) => c.type === 'stories')
  const hasStories = storiesComplement?.isPurchased || false

  // Fallback para a capa da primeira versão se o pack não tiver capa geral
  const firstVersionCover = versionsData.find((v: any) => !!v.coverImageUrl)?.coverImageUrl
  const effectiveCover = pack.cover_image_url || firstVersionCover || null
  // Fetch pack arts (from Drive or local) with captions
  const packArts = await getPackArts(pack)

  return (
    <PackOverview
      pack={{
        id: pack.id,
        name: pack.name,
        version: pack.version,
        coverImageUrl: effectiveCover,
      }}
      versions={versionsData}
      complements={complementsData}
      hasStories={hasStories}
      arts={packArts}
      initialTab={tab === 'legends' ? 'legends' : 'files'}
      lang={lang}
      dict={dict}
    />
  )
}
