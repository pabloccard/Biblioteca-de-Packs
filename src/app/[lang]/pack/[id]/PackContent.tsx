'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import LinkButton from '@/components/LinkButton'
import ArtThumbnail from '@/components/ArtThumbnail'

interface Pack {
  id: string
  name: string
  version: string
  cover_image_url?: string | null
  arts_folder?: string | null
}

interface PackLink {
  id: string
  category: string
  url: string
  label_pt: string
  label_es?: string
  label_en?: string
  subsection_id: string | null
}

interface PackArt {
  id: string
  image_url: string
  caption: string | null
}

interface PackSubsection {
  id: string
  name_pt: string
  name_es: string
  name_en?: string
  icon: string
  display_order: number
}

interface StoryPackData {
  id: string
  buyLink: string
  isUnlocked: boolean
  subsections: PackSubsection[]
  links: PackLink[]
}

interface FullProps {
  pack: Pack
  links: PackLink[]
  arts: PackArt[]
  subsections: PackSubsection[]
  sectionOrder: string[]
  storyPack: StoryPackData | null
  isParentUnlocked: boolean
  parentBuyLink: string
  memberEmail: string
  lang: string
  dict: any
}

type TabType = 'files' | 'legends'

export default function PackContent({ pack, links, arts, subsections, sectionOrder, storyPack, isParentUnlocked, parentBuyLink, memberEmail, lang, dict }: FullProps) {
  const router = useRouter()
  const hasFiles = subsections.length > 0

  // Build buy links
  const storyBuyLink = useMemo(() => {
    if (!storyPack?.buyLink) return ''
    const separator = storyPack.buyLink.includes('?') ? '&' : '?'
    return `${storyPack.buyLink}${separator}email=${encodeURIComponent(memberEmail)}`
  }, [storyPack?.buyLink, memberEmail])

  const feedBuyLink = useMemo(() => {
    if (!parentBuyLink) return ''
    const separator = parentBuyLink.includes('?') ? '&' : '?'
    return `${parentBuyLink}${separator}email=${encodeURIComponent(memberEmail)}`
  }, [parentBuyLink, memberEmail])

  // Build tabs (no tutorial)
  const availableTabs = useMemo(() => {
    const tabs: { id: TabType; label: string }[] = []
    if (hasFiles) tabs.push({ id: 'files', label: dict.tabFiles })
    if (arts.length > 0) tabs.push({ id: 'legends', label: dict.tabLegends })
    return tabs
  }, [hasFiles, arts.length, dict])

  const [skipAnimation] = useState(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('sheetAnimated') === 'true'
    return false
  })
  useEffect(() => {
    return () => sessionStorage.removeItem('sheetAnimated')
  }, [])

  const [activeTab, setActiveTab] = useState<TabType>(availableTabs[0]?.id || 'files')
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null)

  const toggleAccordion = useCallback((id: string) => {
    setExpandedAccordion(prev => prev === id ? null : id)
  }, [])

  // Pack card image
  const cardImage = pack.arts_folder ? `/${pack.arts_folder}/card.webp` : pack.cover_image_url || ''

  // Subsection name helper
  const getSubName = (sub: PackSubsection) => {
    if (lang === 'en') return sub.name_en || sub.name_pt
    if (lang === 'es') return sub.name_es || sub.name_pt
    return sub.name_pt
  }

  // Link label helper
  const getLinkLabel = (link: PackLink) => {
    if (lang === 'en') return link.label_en || link.label_pt
    if (lang === 'es') return link.label_es || link.label_pt
    return link.label_pt
  }

  if (availableTabs.length === 0) {
    return (
      <div className={`sheet-backdrop ${skipAnimation ? "no-animation" : ""}`} onClick={() => router.back()}>
        <div className={`sheet-card ${skipAnimation ? "no-animation" : ""}`} onClick={(e) => e.stopPropagation()}>
          <div className="sheet-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>{dict.noContent}</h2>
            <button onClick={() => router.back()} className="btn-admin-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
              {dict.backToPacks}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className={`sheet-backdrop ${skipAnimation ? "no-animation" : ""}`} onClick={() => router.back()} />
    <div className="sheet-wrapper" onClick={() => router.back()}>
      <div className={`sheet-card ${skipAnimation ? "no-animation" : ""}`} onClick={(e) => e.stopPropagation()}>
        
        <div className="sheet-content">
          
          <div className="sheet-top-controls">
            <button onClick={() => router.back()} className="sheet-close-top" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Header Block */}
          <div className="content-block header-block">
            {cardImage && <img src={cardImage} alt={pack.name} />}
            <div className="header-info">
              <h1>{pack.name}</h1>
              <span>{pack.version || 'volume 01'}</span>
            </div>
          </div>

          {/* Tabs Block */}
          {availableTabs.length > 1 && (
            <div className="content-block tabs-block">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* FILES TAB */}
          {activeTab === 'files' && (
            <>
              {/* FEED subsections */}
              {subsections
                .filter(s => {
                  const n = s.name_pt.toLowerCase()
                  return !n.includes('story') && !n.includes('utilitário') && !n.includes('utilidades')
                })
                .map((sub) => {
                  const subLinks = links.filter(l => l.subsection_id === sub.id)
                  if (subLinks.length === 0) return null
                  const isLocked = !isParentUnlocked
                  return (
                    <div key={sub.id} className="content-block link-block">
                      <h2>{getSubName(sub)}</h2>
                      {isLocked ? (
                        <>
                          <p className="locked-text">
                            {lang === 'en'
                              ? 'You haven\'t unlocked the Feed files yet. Click below to get them.'
                              : lang === 'es'
                                ? 'Aún no has desbloqueado los archivos en la versión Feed. Haz clic para liberar el acceso.'
                                : 'Você ainda não liberou o acesso para os arquivos de feed.'}
                          </p>
                          {feedBuyLink && (
                            <a href={feedBuyLink} className="pack-btn-unlock" target="_blank" rel="noopener noreferrer">
                              <span>{dict.unlockNow || 'Clique para liberar o acesso'}</span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                              </svg>
                            </a>
                          )}
                        </>
                      ) : (
                        <div className="link-list">
                          {subLinks.map(link => (
                            <LinkButton key={link.id} href={link.url} label={getLinkLabel(link)} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

              {/* STORY subsections */}
              {storyPack && storyPack.subsections.map((sub) => {
                const subLinks = storyPack.links.filter(l => l.subsection_id === sub.id)
                if (subLinks.length === 0) return null
                const isLocked = !storyPack.isUnlocked

                return (
                  <div key={sub.id} className="content-block link-block">
                    <h2>
                      {getSubName(sub)
                        .replace(/^Story$/i, lang === 'en' ? 'Story Files' : lang === 'es' ? 'Archivos Stories' : 'Arquivos para stories')
                        .replace(/^Stories$/i, lang === 'en' ? 'Story Files' : lang === 'es' ? 'Archivos Stories' : 'Arquivos para stories')}
                    </h2>
                    {isLocked ? (
                      <>
                        <p className="locked-text">
                          {lang === 'en'
                            ? 'You haven\'t unlocked the Story files yet.'
                            : lang === 'es'
                              ? 'Aún no has desbloqueado los archivos en la versión Story.'
                              : 'Você ainda não liberou o acesso para os arquivos de stories.'}
                        </p>
                        <a href={storyBuyLink} className="pack-btn-unlock" target="_blank" rel="noopener noreferrer">
                          <span>{dict.unlockNow || 'Clique para liberar o acesso'}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </a>
                      </>
                    ) : (
                      <div className="link-list">
                        {subLinks.map(link => (
                          <LinkButton key={link.id} href={link.url} label={getLinkLabel(link)} locked={isLocked} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* UTILITIES subsections */}
              {subsections
                .filter(s => {
                  const n = s.name_pt.toLowerCase()
                  return n.includes('utilitário') || n.includes('utilidades')
                })
                .map((sub) => {
                  const subLinks = links.filter(l => l.subsection_id === sub.id)
                  if (subLinks.length === 0) return null
                  return (
                    <div key={sub.id} className="content-block link-block">
                      <h2>{getSubName(sub)}</h2>
                      <div className="link-list">
                        {subLinks.map(link => (
                          <LinkButton key={link.id} href={link.url} label={getLinkLabel(link)} />
                        ))}
                      </div>
                    </div>
                  )
                })}
            </>
          )}

          {/* LEGENDS TAB */}
          {activeTab === 'legends' && (
            <div className="content-block">
              <div className="legends-grid-view">
                {arts.map((art) => (
                  <ArtThumbnail
                    key={art.id}
                    imageUrl={art.image_url}
                    caption={art.caption || ''}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
    </>
  )
}
