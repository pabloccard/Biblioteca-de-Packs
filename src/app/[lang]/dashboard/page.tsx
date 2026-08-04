import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMemberEmail, getMemberName, logoutAction } from '../../actions'
import PackCard from '@/components/PackCard'
import SuggestionButton from '@/components/SuggestionButton'
import WhatsAppButton from '@/components/WhatsAppButton'
import { getLocalArts, getLocalArtCount } from '@/lib/pack-arts'

import { getDictionary, Locale } from '@/lib/dictionaries'

interface DashboardPageProps {
  params: Promise<{ lang: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params
  const dict: any = await getDictionary(lang as Locale, 'dashboard')
  const email = await getMemberEmail()

  if (!email) {
    redirect('/')
  }

  const memberName = await getMemberName()
  const supabase = await createClient()

  // Buscar membro com idioma e suas compras
  const { data: member } = await supabase
    .from('members')
    .select('id, language')
    .eq('email', email)
    .single()

  const memberLanguage = member?.language || 'pt'

  // Fetch purchases, packs, specs, and categories in parallel
  const [purchasesResult, packsResult, specsResult, categoriesResult] = await Promise.all([
    member
      ? supabase.from('member_purchases').select('pack_id').eq('member_id', member.id)
      : Promise.resolve({ data: null }),
    supabase.from('packs').select('*').is('parent_pack_id', null).order('release_date', { ascending: false }),
    supabase.from('pack_specs').select('*').order('display_order', { ascending: true }),
    supabase.from('pack_categories').select('*').order('name'),
  ])

  const purchasedPackIds = purchasesResult.data?.map(p => p.pack_id) || []
  const allPacks = packsResult.data || []
  const allSpecs = specsResult.data || []
  const allCategories = categoriesResult.data || []

  // Buscar packs filhos para verificar se o membro comprou algum filho
  // (nesse caso, o pack pai correspondente deve aparecer como desbloqueado)
  const { data: childPacks } = await supabase
    .from('packs')
    .select('id, parent_pack_id')
    .not('parent_pack_id', 'is', null)

  const parentIdsUnlockedViaChild = new Set<string>()
  if (childPacks) {
    for (const child of childPacks) {
      if (purchasedPackIds.includes(child.id) && child.parent_pack_id) {
        parentIdsUnlockedViaChild.add(child.parent_pack_id)
      }
    }
  }

  // Um pack é considerado "desbloqueado" se o membro comprou ele OU comprou um filho dele
  const isPackAccessible = (packId: string) => purchasedPackIds.includes(packId) || parentIdsUnlockedViaChild.has(packId)

  // Filtrar e Ordenar todos os packs (bloqueados primeiro, depois por data)
  const sortedPacks = [...allPacks].filter(p => {
    const isUnlocked = isPackAccessible(p.id)
    if (!isUnlocked && p.language !== memberLanguage) return false // não mostra pack bloqueado de outro idioma
    if (!isUnlocked && p.hide_when_locked) return false
    return true
  }).sort((a, b) => {
    const aUnlocked = isPackAccessible(a.id) ? 1 : 0
    const bUnlocked = isPackAccessible(b.id) ? 1 : 0
    if (aUnlocked !== bUnlocked) {
      return aUnlocked - bUnlocked // 0 (bloqueado) vem antes de 1 (liberado)
    }
    return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
  })

  const hasAnyPacks = sortedPacks.length > 0

  const subtitleText = lang === 'en'
    ? "Access your templates below."
    : lang === 'es'
      ? "Accede a tus packs a continuación."
      : "Acesse seus packs abaixo."

  return (
    <div className="page-wrapper">
      <div className="container">
        <header className="dashboard-header">
          <div className="dashboard-header-top">
            <div className="dashboard-header-text">
              <div>
                <h1 className="dashboard-title">
                  {dict.greeting.replace('{name}', memberName || dict.visitor)}
                </h1>
                <p className="dashboard-subtitle" style={{ marginBottom: 0 }}>
                  {subtitleText}
                </p>
              </div>
            </div>
            <div className="dashboard-header-actions" style={{ alignItems: 'center' }}>
              <SuggestionButton lang={lang} />
              
              <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center' }}>
                <form action={logoutAction} style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="hidden" name="lang" value={lang} />
                  <button type="submit" className="btn-logout" aria-label={lang === 'en' ? 'Log out' : lang === 'es' ? 'Salir' : 'Sair'} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '0 0 0 8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{lang === 'en' ? 'Log out' : lang === 'es' ? 'Salir' : 'Sair'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="packs-categories-container">
          {hasAnyPacks && (
            <div className="container" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '48px' }}>
              {allCategories.filter(cat => sortedPacks.some(p => p.category_id === cat.id)).map(category => {
                const categoryPacks = sortedPacks.filter(p => p.category_id === category.id)
                return (
                  <section key={category.id} className="packs-category-section">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px', paddingLeft: '8px', borderLeft: '4px solid #4ade80' }}>
                      {category.name}
                    </h2>
                    <div className="packs-grid">
                      {categoryPacks.map((pack, index) => {
                        const artCount = getLocalArtCount(pack.arts_folder)
                        const packSpecs = allSpecs.filter(s => s.pack_id === pack.id).map(s => s.label)
                        const localArts = getLocalArts(pack.arts_folder, pack.art_captions)
                        const packArts = localArts.map(a => ({ id: String(a.number), image_url: a.imageUrl }))
                        return (
                          <div key={pack.id} className="packs-grid-item">
                            <PackCard
                              id={pack.id}
                              name={pack.name}
                              coverImageUrl={pack.cover_image_url}
                              artCount={artCount}
                              isUnlocked={isPackAccessible(pack.id)}
                              specs={packSpecs}
                              arts={packArts}
                              buyLink={pack.buy_link || ''}
                              showDiscountTag={pack.show_discount_tag ?? true}
                              version={pack.version || '1.0'}
                              lang={lang}
                              priority={index < 4}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
              
              {/* Renderizar packs sem categoria, se houver */}
              {sortedPacks.filter(p => !p.category_id).length > 0 && (
                <section className="packs-category-section">
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px', paddingLeft: '8px', borderLeft: '4px solid #4ade80' }}>
                    {lang === 'es' ? 'Otros Packs' : 'Outros Packs'}
                  </h2>
                  <div className="packs-grid">
                    {sortedPacks.filter(p => !p.category_id).map((pack, index) => {
                      const artCount = getLocalArtCount(pack.arts_folder)
                      const packSpecs = allSpecs.filter(s => s.pack_id === pack.id).map(s => s.label)
                      const localArts = getLocalArts(pack.arts_folder, pack.art_captions)
                      const packArts = localArts.map(a => ({ id: String(a.number), image_url: a.imageUrl }))
                      return (
                        <div key={pack.id} className="packs-grid-item">
                          <PackCard
                            id={pack.id}
                            name={pack.name}
                            coverImageUrl={pack.cover_image_url}
                            artCount={artCount}
                            isUnlocked={isPackAccessible(pack.id)}
                            specs={packSpecs}
                            arts={packArts}
                            buyLink={pack.buy_link || ''}
                            showDiscountTag={pack.show_discount_tag ?? true}
                            version={pack.version || '1.0'}
                            lang={lang}
                            priority={index < 4}
                          />
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {!hasAnyPacks && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: 'var(--text-muted)',
            }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📦</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{dict.noPacksAvailable}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>{dict.comeBackSoon}</p>
            </div>
          )}
        </div>
      <WhatsAppButton />
    </div>
  )
}
