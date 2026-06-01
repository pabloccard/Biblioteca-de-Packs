import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMemberEmail, logoutAction } from '../../../actions'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import WhatsAppButton from '@/components/WhatsAppButton'
import LinkButton from '@/components/LinkButton'
import ArtThumbnail from '@/components/ArtThumbnail'
import PackContent from './PackContent'
import { getDictionary, Locale } from '@/lib/dictionaries'
import { getLocalArts } from '@/lib/pack-arts'

interface PackPageProps {
  params: Promise<{ id: string; lang: string }>
}

export default async function PackPage({ params }: PackPageProps) {
  const { id, lang } = await params
  const email = await getMemberEmail()
  const dict: any = await getDictionary(lang as Locale, 'pack')

  if (!email) {
    redirect('/')
  }

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

  if (!purchase) redirect(`/${lang}/dashboard`)

  const { data: pack } = await supabase
    .from('packs')
    .select('*')
    .eq('id', id)
    .single()

  if (!pack) notFound()

  // Fetch links and subsections in parallel
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

  // Artes vêm da pasta local
  const localArts = getLocalArts(pack.arts_folder, pack.art_captions)
  const packArts = localArts.map(a => ({
    id: String(a.number),
    image_url: a.imageUrl,
    caption: a.caption,
    display_order: a.number,
  }))
  const allLinks = links || []
  const packSubsections = subsections || []

  // Fetch story packs (complementares) vinculados a este pack
  const { data: storyPacks } = await supabase
    .from('packs')
    .select('id, buy_link')
    .eq('parent_pack_id', id)

  let storyPackData = null

  if (storyPacks && storyPacks.length > 0) {
    const storyPack = storyPacks[0]

    // Verificar se o membro comprou o story pack
    const { data: storyPurchase } = await supabase
      .from('member_purchases')
      .select('id')
      .eq('member_id', member.id)
      .eq('pack_id', storyPack.id)
      .single()

    // Buscar subsections e links do story pack
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

  return (
    <div className="page-wrapper">
      <PackContent
        pack={pack}
        links={allLinks}
        arts={packArts}
        subsections={packSubsections}
        sectionOrder={pack.section_order || ['files', 'tutorial', 'legends']}
        storyPack={storyPackData}
        memberEmail={email}
        lang={lang}
        dict={dict}
      />
      <WhatsAppButton />
    </div>
  )
}
