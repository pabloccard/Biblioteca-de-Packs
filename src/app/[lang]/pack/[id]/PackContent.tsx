'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import LinkButton from '@/components/LinkButton'
import ArtThumbnail from '@/components/ArtThumbnail'
import SuggestionModal from '@/components/SuggestionModal'

/** Extrai tags entre *asteriscos* do título e retorna o título limpo + array de tags */
function parseTutorialTitle(title: string): { cleanTitle: string; tags: string[] } {
  const tags: string[] = []
  const cleanTitle = title.replace(/\*([^*]+)\*/g, (_, tag) => {
    tags.push(tag.trim())
    return ''
  }).replace(/\s+/g, ' ').trim()
  return { cleanTitle, tags }
}

interface Pack {
  id: string
  name: string
  version: string
  cover_image_url?: string | null
}

interface PackLink {
  id: string
  category: string
  url: string
  label_pt: string
  label_es?: string
  subsection_id: string | null
}

interface PackArt {
  id: string
  image_url: string
  caption: string | null
}

interface Props {
  pack: Pack
  links: PackLink[]
  arts: PackArt[]
}

type TabType = 'tutorial' | 'files' | 'legends'

// YouTube Lite Embed with pause support via ref
function YouTubeLite({ url, shouldPause }: { url: string; shouldPause: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [active, setActive] = useState(false)

  const videoId = useMemo(() => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }, [url])

  // Pause video when shouldPause becomes true or when accordion closes
  useEffect(() => {
    if (shouldPause && active && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      )
    }
  }, [shouldPause, active])

  if (!videoId) {
    return (
      <div className="youtube-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Vídeo não disponível</p>
      </div>
    )
  }

  if (active) {
    return (
      <div className="youtube-wrapper">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&enablejsapi=1`}
          title="Tutorial do Pack"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="youtube-wrapper youtube-lite" onClick={() => setActive(true)}>
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt="Tutorial do Pack"
        loading="lazy"
        className="youtube-lite-thumb"
      />
      <button className="youtube-lite-play" aria-label="Play video">
        <svg viewBox="0 0 68 48" width="68" height="48">
          <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#212121" fillOpacity="0.8"/>
          <path d="M45 24 27 14v20" fill="#fff"/>
        </svg>
      </button>
    </div>
  )
}

// Icons are now URLs from the database

interface PackSubsection {
  id: string
  name_pt: string
  name_es: string
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
  memberEmail: string
  lang: string
  dict: any
}

export default function PackContent({ pack, links, arts, subsections, sectionOrder, storyPack, memberEmail, lang, dict }: FullProps) {
  const youtubeLinks = useMemo(() => links.filter(l => l.category === 'youtube'), [links])
  const hasFiles = subsections.length > 0

  // Construir buyLink com email pré-preenchido
  const storyBuyLink = useMemo(() => {
    if (!storyPack?.buyLink) return ''
    const separator = storyPack.buyLink.includes('?') ? '&' : '?'
    return `${storyPack.buyLink}${separator}email=${encodeURIComponent(memberEmail)}`
  }, [storyPack?.buyLink, memberEmail])

  // Build available tabs based on section_order
  const availableTabs = useMemo(() => {
    const tabMap: Record<string, { id: TabType; label: string }> = {}
    if (youtubeLinks.length > 0) tabMap['tutorial'] = { id: 'tutorial', label: dict.tabTutorials }
    if (hasFiles) tabMap['files'] = { id: 'files', label: dict.tabFiles }
    if (arts.length > 0) tabMap['legends'] = { id: 'legends', label: dict.tabLegends }

    // Return in section_order order
    const ordered: { id: TabType; label: string }[] = []
    for (const s of sectionOrder) {
      if (tabMap[s]) ordered.push(tabMap[s])
    }
    // Add any tabs not in sectionOrder (safety)
    for (const key of Object.keys(tabMap)) {
      if (!ordered.find(t => t.id === key)) ordered.push(tabMap[key])
    }
    return ordered
  }, [youtubeLinks.length, hasFiles, arts.length, sectionOrder])

  const defaultTab = useMemo(() => {
    return availableTabs[0]?.id || null
  }, [availableTabs])

  const [activeTab, setActiveTab] = useState<TabType | null>(defaultTab)
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null)
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null)
  const [selectedTutorialId, setSelectedTutorialId] = useState<string>(youtubeLinks[0]?.id || '')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const selectedTutorial = useMemo(() => youtubeLinks.find(l => l.id === selectedTutorialId) || youtubeLinks[0] || null, [youtubeLinks, selectedTutorialId])
  const setSelectedTutorialById = useCallback((id: string) => setSelectedTutorialId(id), [])

  const toggleAccordion = useCallback((id: string) => {
    setExpandedAccordion(prev => prev === id ? null : id)
  }, [])

  const toggleTutorial = useCallback((id: string) => {
    setExpandedTutorial(prev => prev === id ? null : id)
  }, [])

  const handleTabChange = useCallback((tabId: TabType) => {
    if (tabId !== 'tutorial') {
      setExpandedTutorial(null)
    }
    setActiveTab(tabId)
  }, [])

  if (availableTabs.length === 0) {
    return (
      <div className="container pack-page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>{dict.noContent}</h2>
        <Link href={`/${lang}/dashboard`} className="btn-admin-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
          {dict.backToPacks}
        </Link>
      </div>
    )
  }

  if (!activeTab) return null

  const hasTutorial = availableTabs.some(t => t.id === 'tutorial')
  const hasFilesTab = availableTabs.some(t => t.id === 'files')
  const hasLegends = availableTabs.some(t => t.id === 'legends')

  return (
    <>
      {/* Pack Page Header Hero (Edge to Edge) */}
      <header 
        className="pack-page-header-edge" 
        style={pack.cover_image_url ? { backgroundImage: `url(${pack.cover_image_url})` } : {}}
      >
        <div className="pack-header-overlay" />
        
        <div className="container pack-header-container">
          <div className="pack-header-top">
            <Link href={`/${lang}/dashboard`} className="pack-page-back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </Link>
          </div>
          {/* Navbar / Segmented Control */}
          <div className="pack-navbar-container">
            <nav className="pack-navbar">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`pack-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                  {activeTab === tab.id && <div className="pack-nav-indicator" />}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="container pack-page">

      {/* Content Area */}
      <div className="pack-content-area">
        {hasTutorial && (
          <div className="tab-pane" style={{ display: activeTab === 'tutorial' ? 'block' : 'none' }}>

            {/* MOBILE: Accordion layout */}
            <div className="tutorial-mobile">
              <div className="accordion-container">
                {youtubeLinks.map((link, index) => {
                  const isExpanded = expandedTutorial === link.id
                  const shouldPause = !isExpanded || activeTab !== 'tutorial'
                  const rawTitle = lang === 'es' ? (link.label_es || link.label_pt) : link.label_pt || `${dict.tutorialPrefix} ${index + 1}`
                  const { cleanTitle, tags } = parseTutorialTitle(rawTitle)
                  return (
                    <div key={link.id} className={`accordion-card ${isExpanded ? 'expanded' : ''}`}>
                      <button className="accordion-header" onClick={() => toggleTutorial(link.id)}>
                        <div className="accordion-title">
                          <div className="accordion-icon icon-yt-glow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                          <div className="accordion-title-text">
                            <span>{cleanTitle}</span>
                            {tags.length > 0 && (
                              <span className="accordion-count">{tags.join(' · ')}</span>
                            )}
                          </div>
                        </div>
                        <div className="accordion-chevron">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </button>
                      <div className="accordion-wrapper">
                        <div className="accordion-content">
                          <div style={{ padding: '0 0 4px' }}>
                            <YouTubeLite url={link.url} shouldPause={shouldPause} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* DESKTOP: Video + Summary sidebar */}
            <div className="tutorial-desktop-header">
              {selectedTutorial && (() => {
                const rawTitle = lang === 'es' ? (selectedTutorial.label_es || selectedTutorial.label_pt) : (selectedTutorial.label_pt || dict.tutorialPrefix)
                const { cleanTitle } = parseTutorialTitle(rawTitle)
                return <h2 className="tutorial-desktop-title">{cleanTitle}</h2>
              })()}
            </div>
            <div className="tutorial-desktop">
              <div className="tutorial-desktop-player">
                {selectedTutorial && (
                  <YouTubeLite
                    key={selectedTutorial.id}
                    url={selectedTutorial.url}
                    shouldPause={activeTab !== 'tutorial'}
                  />
                )}
              </div>
              <div className="tutorial-desktop-summary">
                <div className="tutorial-summary-list">
                  {youtubeLinks.map((link, index) => {
                    const rawLabel = link.label_pt || `Tutorial ${index + 1}`
                    const { cleanTitle, tags } = parseTutorialTitle(rawLabel)
                    return (
                      <button
                        key={link.id}
                        className={`tutorial-summary-item ${selectedTutorial?.id === link.id ? 'active' : ''}`}
                        onClick={() => setSelectedTutorialById(link.id)}
                      >
                        <span className="tutorial-summary-label">{cleanTitle}</span>
                        {tags.length > 0 && (
                          <span className="accordion-count">{tags.join(' · ')}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {hasFilesTab && (
          <div className="tab-pane" style={{ display: activeTab === 'files' ? 'block' : 'none' }}>
            <div className="accordion-container">

              {/* FEED — subsections do pack pai que NÃO são "story" nem "utilitários" */}
              {subsections
                .filter(s => {
                  const n = s.name_pt.toLowerCase()
                  return !n.includes('story') && !n.includes('utilitário') && !n.includes('utilidades')
                })
                .map((sub) => {
                  const subLinks = links.filter(l => l.subsection_id === sub.id)
                  if (subLinks.length === 0) return null
                  return (
                    <div key={sub.id} className={`accordion-card ${expandedAccordion === sub.id ? 'expanded' : ''}`}>
                      <button className="accordion-header" onClick={() => toggleAccordion(sub.id)}>
                        <div className="accordion-title">
                          <div className="accordion-icon icon-files-glow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                          </div>
                          <div className="accordion-title-text">
                            <span>{lang === 'es' ? (sub.name_es || sub.name_pt) : sub.name_pt}</span>
                            <span className="accordion-count">{subLinks.length} {subLinks.length === 1 ? 'link' : 'links'}</span>
                          </div>
                        </div>
                        <div className="accordion-chevron">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </button>
                      <div className="accordion-wrapper">
                        <div className="accordion-content">
                          {subLinks.map(link => (
                            <LinkButton key={link.id} href={link.url} label={lang === 'es' ? (link.label_es || link.label_pt) : link.label_pt} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}

              {/* STORY — subsections do pack FILHO */}
              {storyPack && storyPack.subsections.map((sub) => {
                const subLinks = storyPack.links.filter(l => l.subsection_id === sub.id)
                if (subLinks.length === 0) return null
                const isLocked = !storyPack.isUnlocked

                return (
                  <div key={sub.id} className={`accordion-card ${expandedAccordion === sub.id ? 'expanded' : ''} ${isLocked ? 'story-locked' : ''}`}>
                    <button
                      className="accordion-header"
                      onClick={() => toggleAccordion(sub.id)}
                    >
                      <div className="accordion-title">
                        <div className={`accordion-icon ${isLocked ? 'icon-locked-glow' : 'icon-files-glow'}`}>
                          {isLocked ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                          )}
                        </div>
                        <div className="accordion-title-text">
                          <span>{lang === 'es' ? (sub.name_es || sub.name_pt) : sub.name_pt}</span>
                          <span className="accordion-count">{subLinks.length} {subLinks.length === 1 ? 'link' : 'links'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isLocked && (
                          <a
                            href={storyBuyLink}
                            className="unlock-story-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                            {dict.unlockNow || 'Desbloqueie agora'}
                          </a>
                        )}
                        <div className="accordion-chevron">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                    </button>
                    <div className="accordion-wrapper">
                      <div className="accordion-content">
                        {isLocked ? (
                          <div className="locked-message">
                            <p>{lang === 'es' 
                              ? 'Aún no has desbloqueado los archivos en la versión Story. Haz clic en "Liberar Ahora" y adquiérelos con descuento exclusivo.' 
                              : 'Você ainda não liberou os arquivos na versão Story. Clique no botão "Liberar Agora" e adquira com desconto exclusivo.'
                            }</p>
                          </div>
                        ) : (
                          subLinks.map(link => (
                            <LinkButton key={link.id} href={link.url} label={lang === 'es' ? (link.label_es || link.label_pt) : link.label_pt} locked={isLocked} />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* UTILITÁRIOS — subsections do pack pai com nome "utilitários" */}
              {subsections
                .filter(s => {
                  const n = s.name_pt.toLowerCase()
                  return n.includes('utilitário') || n.includes('utilidades')
                })
                .map((sub) => {
                  const subLinks = links.filter(l => l.subsection_id === sub.id)
                  if (subLinks.length === 0) return null
                  return (
                    <div key={sub.id} className={`accordion-card ${expandedAccordion === sub.id ? 'expanded' : ''}`}>
                      <button className="accordion-header" onClick={() => toggleAccordion(sub.id)}>
                        <div className="accordion-title">
                          <div className="accordion-icon icon-files-glow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                          </div>
                          <div className="accordion-title-text">
                            <span>{lang === 'es' ? (sub.name_es || sub.name_pt) : sub.name_pt}</span>
                            <span className="accordion-count">{subLinks.length} {subLinks.length === 1 ? 'link' : 'links'}</span>
                          </div>
                        </div>
                        <div className="accordion-chevron">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </button>
                      <div className="accordion-wrapper">
                        <div className="accordion-content">
                          {subLinks.map(link => (
                            <LinkButton key={link.id} href={link.url} label={lang === 'es' ? (link.label_es || link.label_pt) : link.label_pt} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}

            </div>
          </div>
        )}

        {hasLegends && (
          <div className="tab-pane" style={{ display: activeTab === 'legends' ? 'block' : 'none' }}>
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
    <SuggestionModal
      isOpen={showSuggestion}
      onClose={() => setShowSuggestion(false)}
      lang={lang}
    />
    </>
  )
}

