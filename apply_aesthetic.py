import os

css_path = 'src/app/styles/pack-detail.css'
tsx_path = 'src/app/[lang]/pack/[id]/PackContent.tsx'
link_path = 'src/components/LinkButton.tsx'

# 1. Update pack-detail.css
css_content = '''/* ================================ */
/* PACK DETAIL — Solid Dark Premium */
/* ================================ */

.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 40;
  animation: fadeInBackdrop 0.25s ease forwards;
}

.sheet-wrapper {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

@keyframes fadeInBackdrop {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sheet-card {
  pointer-events: auto;
  width: 100%;
  max-width: 520px;
  height: 90dvh;
  background: #050505;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-bottom: none;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from { margin-bottom: -100vh; }
  to { margin-bottom: 0; }
}

.sheet-card.no-animation, .sheet-backdrop.no-animation {
  animation: none !important;
}

.sheet-content {
  padding: 24px 20px 40px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sheet-content::-webkit-scrollbar {
  width: 0;
}

/* Blocks */
.content-block {
  background: #111111;
  border-radius: 16px;
  padding: 20px;
}

.header-block {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.header-block img {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-info h1 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-info span {
  font-size: 0.85rem;
  color: #888;
}

.header-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1A1A1A;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  position: absolute;
  top: 16px;
  right: 16px;
}

/* Tabs */
.tabs-block {
  display: flex;
  padding: 6px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  background: transparent;
  color: #666;
  border: none;
  padding: 10px 0;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #1D1D1F;
  color: #DDDDDD;
}

/* Sections */
.link-block h2 {
  font-size: 1.15rem;
  font-weight: 500;
  color: #fff;
  margin-bottom: 24px;
}

.link-list {
  display: flex;
  flex-direction: column;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  text-decoration: none;
}

.link-item:first-child {
  padding-top: 0;
}

.link-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.link-item.locked {
  opacity: 0.5;
  pointer-events: none;
}

.link-icon-area {
  flex-shrink: 0;
}

.link-icon-canva {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00C4CC, #7D2AE8);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: bold; font-size: 0.75rem;
  font-family: sans-serif;
}

.link-icon-ps {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #001E36;
  display: flex; align-items: center; justify-content: center;
  color: #31A8FF; font-weight: bold; font-size: 1.2rem;
  font-family: sans-serif;
}

.link-icon-generic {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #1A1A1A;
  display: flex; align-items: center; justify-content: center;
  color: #666;
}

.link-title {
  font-size: 0.95rem;
  color: #ccc;
}

/* Locked State */
.locked-text {
  font-size: 0.95rem;
  color: #A0A0A0;
  line-height: 1.5;
  margin-bottom: 24px;
}

.btn-unlock {
  display: block;
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #0066FF, #00D4FF);
  color: #fff;
  text-align: center;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 8px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-unlock:hover {
  opacity: 0.9;
}

/* Legends Grid */
.legends-grid-view {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
'''
open(css_path, 'w').write(css_content)

# 2. Update LinkButton.tsx
link_content = '''import React from 'react'

interface LinkButtonProps {
  href: string
  label: string
  icon?: React.ReactNode
  locked?: boolean
}

export default function LinkButton({ href, label, icon, locked }: LinkButtonProps) {
  let cleanLabel = label

  let colorMatch = cleanLabel.match(/"#([a-fA-F0-9]{3,6})"/)
  if (colorMatch) cleanLabel = cleanLabel.replace(colorMatch[0], '')

  let tagMatch = cleanLabel.match(/\[(.*?)\]/)
  let tag = tagMatch ? tagMatch[1] : null
  if (tagMatch) cleanLabel = cleanLabel.replace(tagMatch[0], '')

  cleanLabel = cleanLabel.trim()

  const isCanva = tag?.toLowerCase() === 'canva' || cleanLabel.toLowerCase().includes('canva')
  const isPS = tag?.toLowerCase() === 'psd' || tag?.toLowerCase() === 'photoshop' || cleanLabel.toLowerCase().includes('psd')

  return (
    <a
      href={locked ? undefined : href}
      target={locked ? undefined : '_blank'}
      rel={locked ? undefined : 'noopener noreferrer'}
      className={`link-item ${locked ? 'locked' : ''}`}
      onClick={locked ? (e) => e.preventDefault() : undefined}
    >
      <div className="link-icon-area">
        {isCanva ? (
          <div className="link-icon-canva">Canva</div>
        ) : isPS ? (
          <div className="link-icon-ps">Ps</div>
        ) : icon ? (
          <div className="link-icon-generic">{icon}</div>
        ) : (
          <div className="link-icon-generic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
          </div>
        )}
      </div>
      <div className="link-text-area">
        <span className="link-title">{cleanLabel}</span>
      </div>
    </a>
  )
}
'''
open(link_path, 'w').write(link_content)

# 3. Update PackContent.tsx
tsx_content = open(tsx_path).read()

import re
# Replace from `return (` to the end with the new rendering logic
new_render = '''return (
    <>
    <div className={`sheet-backdrop ${skipAnimation ? "no-animation" : ""}`} onClick={() => router.back()} />
    <div className="sheet-wrapper" onClick={() => router.back()}>
      <div className={`sheet-card ${skipAnimation ? "no-animation" : ""}`} onClick={(e) => e.stopPropagation()}>
        
        <div className="sheet-content">
          
          {/* Header Block */}
          <div className="content-block header-block">
            {cardImage && <img src={cardImage} alt={pack.name} />}
            <div className="header-info">
              <h1>{pack.name}</h1>
              <span>{pack.version || 'volume 01'}</span>
            </div>
            {/* Close button inside header block */}
            <button onClick={() => router.back()} className="header-close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
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
                              ? 'You haven\\'t unlocked the Feed files yet. Click below to get them.'
                              : lang === 'es'
                                ? 'Aún no has desbloqueado los archivos en la versión Feed. Haz clic para liberar el acceso.'
                                : 'Você ainda não liberou o acesso para os arquivos de feed.'}
                          </p>
                          {feedBuyLink && (
                            <a href={feedBuyLink} className="btn-unlock" target="_blank" rel="noopener noreferrer">
                              {dict.unlockNow || 'Clique para liberar o acesso'}
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
                            ? 'You haven\\'t unlocked the Story files yet.'
                            : lang === 'es'
                              ? 'Aún no has desbloqueado los archivos en la versión Story.'
                              : 'Você ainda não liberou o acesso para os arquivos de stories.'}
                        </p>
                        <a href={storyBuyLink} className="btn-unlock" target="_blank" rel="noopener noreferrer">
                          {dict.unlockNow || 'Clique para liberar o acesso'}
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
'''
tsx_content = re.sub(r'return \(\s*<>\s*<div className=\{`sheet-backdrop.*', new_render, tsx_content, flags=re.DOTALL)
open(tsx_path, 'w').write(tsx_content)

print("Aesthetic changes applied")
