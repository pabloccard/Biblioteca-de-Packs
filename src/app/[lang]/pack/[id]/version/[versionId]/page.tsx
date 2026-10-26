import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMemberSession } from '../../../../../actions'
import { getDictionary, Locale } from '@/lib/dictionaries'
import VersionContent from './VersionContent'

interface VersionPageProps {
  params: Promise<{ id: string; versionId: string; lang: string }>
}

export default async function VersionPage({ params }: VersionPageProps) {
  const { id: packId, versionId, lang } = await params
  const session = await getMemberSession()
  const dict: any = await getDictionary(lang as Locale, 'pack')

  if (!session.email) redirect('/')

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
    .eq('pack_id', packId)
    .single()

  if (!purchase) redirect(`/${lang}/dashboard`)

  // Fetch pack
  const { data: pack } = await supabase
    .from('packs')
    .select('id, name, version, cover_image_url')
    .eq('id', packId)
    .single()

  if (!pack) notFound()

  // Fetch version
  const { data: version } = await supabase
    .from('pack_versions')
    .select('*')
    .eq('id', versionId)
    .single()

  if (!version) notFound()

  // Fetch version links and stories complement in parallel
  const [linksResult, complementResult] = await Promise.all([
    supabase
      .from('pack_version_links')
      .select('*')
      .eq('version_id', versionId)
      .order('display_order', { ascending: true }),
    supabase
      .from('pack_complements')
      .select('id, buy_link')
      .eq('pack_id', packId)
      .eq('type', 'stories')
      .maybeSingle(),
  ])

  const links = linksResult.data || []
  const storiesComplement = complementResult.data

  let hasStories = false
  if (storiesComplement) {
    const { data: storiesPurchase } = await supabase
      .from('complement_purchases')
      .select('id')
      .eq('member_id', memberId)
      .eq('complement_id', storiesComplement.id)
      .single()

    hasStories = !!storiesPurchase
  }

  const storiesBuyLink = storiesComplement && !hasStories ? (storiesComplement.buy_link || '') : ''

  // Separate links by format and platform
  const feedLinks = (links || []).filter((l: any) => l.format === 'feed')
  const storiesLinks = (links || []).filter((l: any) => l.format === 'stories')

  return (
    <VersionContent
      pack={{
        id: pack.id,
        name: pack.name,
        version: pack.version,
        coverImageUrl: pack.cover_image_url,
      }}
      version={{
        id: version.id,
        name: version.name,
        coverImageUrl: version.cover_image_url,
      }}
      feedLinks={feedLinks.map((l: any) => ({
        id: l.id,
        platform: l.platform,
        format: l.format,
        url: l.url,
        labelPt: l.label_pt,
        labelEs: l.label_es,
        labelEn: l.label_en,
      }))}
      storiesLinks={storiesLinks.map((l: any) => ({
        id: l.id,
        platform: l.platform,
        format: l.format,
        url: l.url,
        labelPt: l.label_pt,
        labelEs: l.label_es,
        labelEn: l.label_en,
      }))}
      hasStories={hasStories}
      storiesBuyLink={storiesBuyLink}
      lang={lang}
      dict={dict}
    />
  )
}
