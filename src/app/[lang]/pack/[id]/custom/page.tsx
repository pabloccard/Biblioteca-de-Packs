import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMemberSession } from '../../../../actions'
import { getDictionary, Locale } from '@/lib/dictionaries'
import CustomContent from './CustomContent'

interface CustomPageProps {
  params: Promise<{ id: string; lang: string }>
}

export default async function CustomPage({ params }: CustomPageProps) {
  const { id: packId, lang } = await params
  const session = await getMemberSession()
  const dict: any = await getDictionary(lang as Locale, 'pack')

  if (!session.email) redirect('/')

  const supabase = await createClient()

  // Get member ID directly from session cookie, fallback to DB if absent
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
    .eq('pack_id', packId)
    .single()

  if (!purchase) redirect(`/${lang}/dashboard`)

  // Fetch pack
  const { data: pack } = await supabase
    .from('packs')
    .select('id, name, version, cover_image_url, art_captions, parent_pack_id')
    .eq('id', packId)
    .single()

  if (!pack) notFound()

  // Resolve art captions (with parent pack fallback if this is a child pack)
  let artCaptions: Record<string, string> = pack.art_captions || {}
  if ((!artCaptions || Object.keys(artCaptions).length === 0) && pack.parent_pack_id) {
    const { data: parentPack } = await supabase
      .from('packs')
      .select('art_captions')
      .eq('id', pack.parent_pack_id)
      .single()
    if (parentPack?.art_captions) {
      artCaptions = parentPack.art_captions
    }
  }

  // Fetch custom complement
  const { data: complement } = await supabase
    .from('pack_complements')
    .select('*')
    .eq('pack_id', packId)
    .eq('type', 'custom')
    .single()

  if (!complement) notFound()

  // Check if purchased via complement_purchases or customization_orders
  const { data: complementPurchase } = await supabase
    .from('complement_purchases')
    .select('id')
    .eq('member_id', memberId)
    .eq('complement_id', complement.id)
    .maybeSingle()

  const { data: order } = await supabase
    .from('customization_orders')
    .select('id, status, delivery_links, custom_cover_url')
    .eq('member_id', memberId)
    .eq('complement_id', complement.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const isPurchased = !!complementPurchase || !!order

  // Check customization order status
  let orderStatus: 'not_purchased' | 'pending' | 'delivered' = 'not_purchased'
  let deliveryLinks: any = null

  if (isPurchased) {
    if (order) {
      orderStatus = order.status === 'delivered' ? 'delivered' : 'pending'
      deliveryLinks = order.delivery_links
    } else {
      orderStatus = 'pending'
    }
  }

  // Extract folder IDs and prefetch files if delivered
  let feedFolderId = deliveryLinks?.feed_folder_id || null
  let storiesFolderId = deliveryLinks?.stories_folder_id || null

  if (!feedFolderId && deliveryLinks?.feed_url) {
    const { extractDriveFolderId } = await import('@/lib/drive-utils')
    feedFolderId = extractDriveFolderId(deliveryLinks.feed_url)
  }
  if (!storiesFolderId && deliveryLinks?.stories_url) {
    const { extractDriveFolderId } = await import('@/lib/drive-utils')
    storiesFolderId = extractDriveFolderId(deliveryLinks.stories_url)
  }

  let initialFeedFiles: any[] = []
  let initialStoriesFiles: any[] = []

  if (orderStatus === 'delivered') {
    try {
      const { getCachedDriveFiles } = await import('@/lib/pack-arts')
      const [feedRes, storiesRes] = await Promise.allSettled([
        feedFolderId ? getCachedDriveFiles(feedFolderId) : Promise.resolve([]),
        storiesFolderId ? getCachedDriveFiles(storiesFolderId) : Promise.resolve([]),
      ])

      if (feedRes.status === 'fulfilled') {
        initialFeedFiles = (feedRes.value || []).filter(f =>
          f.mimeType.startsWith('image/') ||
          f.name.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)
        )
      }

      if (storiesRes.status === 'fulfilled') {
        initialStoriesFiles = (storiesRes.value || []).filter(f =>
          f.mimeType.startsWith('image/') ||
          f.name.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)
        )
      }
    } catch (driveErr) {
      console.warn('Could not prefetch drive files on SSR:', driveErr)
    }
  }

  const whatsappNumber = '5564993237320'

  const customCoverUrl = order?.custom_cover_url || order?.delivery_links?.custom_cover_url || null

  return (
    <CustomContent
      pack={{
        id: pack.id,
        name: pack.name,
        version: pack.version,
        coverImageUrl: customCoverUrl || pack.cover_image_url,
      }}
      complement={{
        id: complement.id,
        buyLink: complement.buy_link || '',
        price: complement.price,
      }}
      status={orderStatus}
      deliveryLinks={deliveryLinks}
      feedFolderId={feedFolderId}
      storiesFolderId={storiesFolderId}
      initialFeedFiles={initialFeedFiles}
      initialStoriesFiles={initialStoriesFiles}
      artCaptions={artCaptions}
      whatsappNumber={whatsappNumber}
      lang={lang}
      dict={dict}
    />
  )
}
