import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { parseCustomizeParam } from '@/lib/customization-slug'
import CustomizeForm from './CustomizeForm'
import WhatsAppButton from '@/components/WhatsAppButton'

export default async function CustomizePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams?: Promise<{ lang?: string }>
}) {
  const { token } = await params
  const { lang: urlLang } = (await searchParams) || {}
  const supabase = await createClient()

  const parsed = parseCustomizeParam(token)

  let query = supabase
    .from('customization_orders')
    .select('*, packs(id, name, cover_image_url, arts_folder, version, language), members(language)')

  if (parsed.isUuid && parsed.uuid) {
    query = query.eq('access_token', parsed.uuid)
  } else if (parsed.shortToken) {
    query = query.ilike('access_token', `${parsed.shortToken}%`)
  } else {
    query = query.eq('access_token', parsed.raw)
  }

  const { data: order } = await query.limit(1).maybeSingle()

  if (!order) notFound()

  const { data: arts } = await supabase
    .from('customization_arts')
    .select('*')
    .eq('order_id', order.id)
    .order('display_order')

  const memberData = order.members as { language?: string } | null
  const packData = order.packs as {
    name: string
    cover_image_url: string | null
    arts_folder: string | null
    version: string | null
    language?: string
  } | null

  const rawPackName = packData?.name || 'Pack'
  const packName = rawPackName.includes('|') ? rawPackName.split('|')[0].trim() : rawPackName
  const coverImage = packData?.cover_image_url || (packData?.arts_folder ? `/${packData.arts_folder}/card.webp` : '/herocover.png')
  const alreadySubmitted = order.status !== 'waiting'
  const clientFirstName = order.client_name ? order.client_name.trim().split(' ')[0] : ''
  const effectiveLang = urlLang || memberData?.language || packData?.language || 'pt'

  return (
    <div className="cust-flow-wrapper">
      <CustomizeForm
        accessToken={order.access_token}
        arts={arts || []}
        packName={packName}
        coverImage={coverImage}
        clientFirstName={clientFirstName}
        alreadySubmitted={alreadySubmitted}
        initialGeneralNotes={order.general_notes || ''}
        lang={effectiveLang}
      />
      <WhatsAppButton />
    </div>
  )
}
