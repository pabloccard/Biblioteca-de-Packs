import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMemberEmail } from '../../../../actions'
import PackContent from '../../../pack/[id]/PackContent'
import { getDictionary, Locale } from '@/lib/dictionaries'
import { getLocalArts } from '@/lib/pack-arts'

interface Props {
  params: Promise<{ id: string; lang: string }>
}

export default async function InterceptedPackPage({ params }: Props) {
  const { id, lang } = await params
  const email = await getMemberEmail()
  const dict: any = await getDictionary(lang as Locale, 'pack')

  if (!email) redirect('/')

  const supabase = await createClient()

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('email', email)
    .single()

  if (!member) redirect('/')

  const { data: purchase } = await supabase
    .from('member_purchases')
    .select('id')
    .eq('member_id', member.id)
    .eq('pack_id', id)
    .single()

  const isParentUnlocked = !!purchase

  const { data: pack } = await supabase
    .from('packs')
    .select('*')
    .eq('id', id)
    .single()

  if (!pack) notFound()

  const [{ data: links }, { data: subsections }] = await Promise.all([
    supabase
      .from('pack_links')
      .select('*')
      .eq('pack_id', id)
      .order('display_order', { ascending: true }),
    supabase
      .from('pack_subsections')
      .select('*')
      .eq('pack_id', id)
      .order('display_order', { ascending: true }),
  ])

  const localArts = getLocalArts(pack.arts_folder, pack.art_captions)
  const packArts = localArts.map(a => ({
    id: String(a.number),
    image_url: a.imageUrl,
    caption: a.caption,
    display_order: a.number,
  }))

  const { data: storyPacks } = await supabase
    .from('packs')
    .select('id, buy_link')
    .eq('parent_pack_id', id)

  let storyPackData = null
  let hasAnyPurchase = isParentUnlocked

  if (storyPacks && storyPacks.length > 0) {
    const storyPack = storyPacks[0]
    const { data: storyPurchase } = await supabase
      .from('member_purchases')
      .select('id')
      .eq('member_id', member.id)
      .eq('pack_id', storyPack.id)
      .single()

    if (storyPurchase) hasAnyPurchase = true

    const [{ data: storySubs }, { data: storyLinks }] = await Promise.all([
      supabase
        .from('pack_subsections')
        .select('*')
        .eq('pack_id', storyPack.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('pack_links')
        .select('*')
        .eq('pack_id', storyPack.id)
        .order('display_order', { ascending: true }),
    ])

    storyPackData = {
      id: storyPack.id,
      buyLink: storyPack.buy_link || '',
      isUnlocked: !!storyPurchase,
      subsections: storySubs || [],
      links: storyLinks || [],
    }
  }

  if (!hasAnyPurchase) redirect(`/${lang}/dashboard`)

  return (
    <PackContent
      pack={pack}
      links={links || []}
      arts={packArts}
      subsections={subsections || []}
      sectionOrder={pack.section_order || ['files', 'tutorial', 'legends']}
      storyPack={storyPackData}
      isParentUnlocked={isParentUnlocked}
      parentBuyLink={pack.buy_link || ''}
      memberEmail={email}
      lang={lang}
      dict={dict}
    />
  )
}
