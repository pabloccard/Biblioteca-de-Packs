import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMemberSession, logoutAction } from '../../actions'
import DashboardView, { PackItemData } from '@/components/DashboardView'
import { getDictionary, Locale } from '@/lib/dictionaries'
import { getCachedPacksCatalog } from '@/lib/catalog'

interface DashboardPageProps {
  params: Promise<{ lang: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params
  const dict: any = await getDictionary(lang as Locale, 'dashboard')
  const session = await getMemberSession()

  if (!session.email) {
    redirect('/')
  }

  const rawName = session.name
  const firstName = rawName ? rawName.trim().split(' ')[0] : dict.visitor
  const greetingText = dict.greeting.replace('{name}', firstName)

  const supabase = await createClient()

  // Buscar ID do membro se não estiver no cookie
  let memberId = session.id
  let memberLanguage = session.lang || 'pt'

  if (!memberId) {
    const { data: member } = await supabase
      .from('members')
      .select('id, language')
      .eq('email', session.email)
      .single()

    if (member) {
      memberId = member.id
      memberLanguage = member.language || memberLanguage
    }
  }

  // Fetch purchases and cached packs catalog
  const [purchasesResult, allPacks] = await Promise.all([
    memberId
      ? supabase.from('member_purchases').select('pack_id').eq('member_id', memberId)
      : Promise.resolve({ data: null }),
    getCachedPacksCatalog(),
  ])

  const purchasedPackIds = new Set(
    (purchasesResult.data || []).map((p: { pack_id: string }) => p.pack_id)
  )

  const isPackAccessible = (packId: string) => purchasedPackIds.has(packId)
  const userLang = memberLanguage || lang || 'pt'

  // Filtrar e Ordenar todos os packs:
  // 1. Todos os packs do idioma do usuário são exibidos (os não obtidos ficam bloqueados).
  // 2. Os adquiridos ficam no topo, ordenados por data de lançamento (mais recentes primeiro).
  const sortedPacks = [...allPacks].filter(p => {
    const isUnlocked = isPackAccessible(p.id)
    if (!isUnlocked && (p.language || 'pt') !== userLang) return false
    return true
  }).sort((a, b) => {
    const aUnlocked = isPackAccessible(a.id) ? 1 : 0
    const bUnlocked = isPackAccessible(b.id) ? 1 : 0
    if (aUnlocked !== bUnlocked) {
      return bUnlocked - aUnlocked
    }
    const dateA = new Date(a.release_date || a.created_at || 0).getTime()
    const dateB = new Date(b.release_date || b.created_at || 0).getTime()
    return dateB - dateA
  })

  const subtitleText = dict.subtitle || (
    lang === 'en'
      ? "Choose a pack to access its arts and captions."
      : lang === 'es'
        ? "Elige un pack para acceder a tus diseños y textos para publicaciones."
        : "Escolha um pack para acessar suas artes e legendas."
  )

  // Mapeamento síncrono e instantâneo sem carregar artes desnecessárias na home
  const packsData: PackItemData[] = sortedPacks.map((pack: any) => {
    const firstVersionCover = (pack.pack_versions || [])
      .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .find((v: any) => !!v.cover_image_url)?.cover_image_url

    const coverImageUrl = pack.cover_image_url || firstVersionCover || null

    return {
      id: pack.id,
      name: pack.name,
      coverImageUrl,
      artCount: 0,
      isUnlocked: isPackAccessible(pack.id),
      arts: [],
      buyLink: pack.buy_link || '',
      version: pack.version || '1.0',
    }
  })

  return (
    <DashboardView
      greetingText={greetingText}
      subtitleText={subtitleText}
      lang={lang}
      dict={dict}
      packs={packsData}
      logoutAction={logoutAction}
    />
  )
}
