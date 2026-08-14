'use client'

import { useState, useMemo, useCallback } from 'react'
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
      <div className="sheet-backdrop" onClick={() => router.back()}>
        <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
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
    <div className="sheet-backdrop" onClick={() => router.back()} />
    <div className="sheet-wrapper" onClick={() => router.back()}>
      <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        {/* Drag Handle */}
        <div className="sheet-handle-area">
          <div className="sheet-handle" />
        </div>

        {/* Header */}
        <header className="sheet-header">
          <button onClick={() => router.back()} className="sheet-close-btn" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="sheet-pack-info">
            {cardImage && (
              <div className="sheet-pack-image">
                <img src={cardImage} alt={pack.name} />
              </div>
            )}
            <div className="sheet-pack-meta">
              <h1 className="sheet-pack-name">{pack.name}</h1>
              <span className="sheet-pack-version">{pack.version}</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        {availableTabs.length > 1 && (
          <nav className="sheet-tabs">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                className={`sheet-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {/* Content */}
        <div className="sheet-content">

          {/* FILES TAB */}
          {activeTab === 'files' && (
            <div className="sheet-section">

              {/* FEED subsections (not story, not utilities) */}
              {subsections
                .filter(s => {
                  const n = s.name_pt.toLowerCase()
                  return !n.includes('story') && !n.includes('utilitário') && !n.includes('utilidades')
                })
                .map((sub) => {
                  const subLinks = links.filter(l => l.subsection_id === sub.id)
                  if (subLinks.length === 0) return null
                  const isFeedLocked = !isParentUnlocked
                  return (
                    <div key={sub.id} className={`glass-card ${expandedAccordion === sub.id ? 'expanded' : ''} ${isFeedLocked ? 'locked' : ''}`}>
                      <button className="glass-card-header" onClick={() => toggleAccordion(sub.id)}>
                        <div className="glass-card-info">
                          <span className="glass-card-title">{getSubName(sub)}</span>
                          <span className="glass-card-count">{subLinks.length} {subLinks.length === 1 ? 'link' : 'links'}</span>
                        </div>
                        <div className="glass-card-actions">
                          {isFeedLocked && feedBuyLink && (
                            <a
                              href={feedBuyLink}
                              className="unlock-btn"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {dict.unlockNow || 'Unlock'}
                            </a>
                          )}
                          <div className={`glass-chevron ${expandedAccordion === sub.id ? 'open' : ''}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                      </button>
                      <div className="glass-card-body-wrapper">
                        <div className="glass-card-body">
                          {isFeedLocked ? (
                            <p className="locked-text">
                              {lang === 'en'
                                ? 'You haven\'t unlocked the Feed files yet. Click "Unlock" to get them at an exclusive discount.'
                                : lang === 'es'
                                  ? 'Aún no has desbloqueado los archivos en la versión Feed. Haz clic en "Liberar" y adquiérelos con descuento exclusivo.'
                                  : 'Você ainda não liberou os arquivos na versão Feed. Clique em "Liberar" e adquira com desconto exclusivo.'}
                            </p>
                          ) : (
                            subLinks.map(link => (
                              <LinkButton key={link.id} href={link.url} label={getLinkLabel(link)} />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

              {/* STORY subsections (child pack) */}
              {storyPack && storyPack.subsections.map((sub) => {
                const subLinks = storyPack.links.filter(l => l.subsection_id === sub.id)
                if (subLinks.length === 0) return null
                const isLocked = !storyPack.isUnlocked

                return (
                  <div key={sub.id} className={`glass-card ${expandedAccordion === sub.id ? 'expanded' : ''} ${isLocked ? 'locked' : ''}`}>
                    <button className="glass-card-header" onClick={() => toggleAccordion(sub.id)}>
                      <div className="glass-card-info">
                        <span className="glass-card-title">
                          {getSubName(sub)
                            .replace(/^Story$/i, lang === 'en' ? 'Story Files' : lang === 'es' ? 'Archivos Stories' : 'Arquivos Stories')
                            .replace(/^Stories$/i, lang === 'en' ? 'Story Files' : lang === 'es' ? 'Archivos Stories' : 'Arquivos Stories')}
                        </span>
                        <span className="glass-card-count">{subLinks.length} {subLinks.length === 1 ? 'link' : 'links'}</span>
                      </div>
                      <div className="glass-card-actions">
                        {isLocked && (
                          <a
                            href={storyBuyLink}
                            className="unlock-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {dict.unlockNow || 'Unlock'}
                          </a>
                        )}
                        <div className={`glass-chevron ${expandedAccordion === sub.id ? 'open' : ''}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </div>
                    </button>
                    <div className="glass-card-body-wrapper">
                      <div className="glass-card-body">
                        {isLocked ? (
                          <p className="locked-text">
                            {lang === 'en'
                              ? 'You haven\'t unlocked the Story files yet. Click "Unlock" to get them at an exclusive discount.'
                              : lang === 'es'
                                ? 'Aún no has desbloqueado los archivos en la versión Story. Haz clic en "Liberar" y adquiérelos con descuento exclusivo.'
                                : 'Você ainda não liberou os arquivos na versão Story. Clique em "Liberar" e adquira com desconto exclusivo.'}
                          </p>
                        ) : (
                          subLinks.map(link => (
                            <LinkButton key={link.id} href={link.url} label={getLinkLabel(link)} locked={isLocked} />
                          ))
                        )}
                      </div>
                    </div>
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
                    <div key={sub.id} className={`glass-card ${expandedAccordion === sub.id ? 'expanded' : ''}`}>
                      <button className="glass-card-header" onClick={() => toggleAccordion(sub.id)}>
                        <div className="glass-card-info">
                          <span className="glass-card-title">{getSubName(sub)}</span>
                          <span className="glass-card-count">{subLinks.length} {subLinks.length === 1 ? 'link' : 'links'}</span>
                        </div>
                        <div className="glass-card-actions">
                          <div className={`glass-chevron ${expandedAccordion === sub.id ? 'open' : ''}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                      </button>
                      <div className="glass-card-body-wrapper">
                        <div className="glass-card-body">
                          {subLinks.map(link => (
                            <LinkButton key={link.id} href={link.url} label={getLinkLabel(link)} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {/* LEGENDS TAB */}
          {activeTab === 'legends' && (
            <div className="sheet-section">
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
