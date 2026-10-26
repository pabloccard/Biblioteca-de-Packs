'use client'

import { useEffect } from 'react'
import Image from 'next/image'

interface PackArt {
  id: string
  image_url: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  packName: string
  arts: PackArt[]
  buyLink: string
  lang: string
}

export default function LockedPackModal({ isOpen, onClose, packName, arts, buyLink, lang }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const translations = {
    pt: { title: 'Desbloqueie este pack', unlock: 'Desbloquear Pack', soon: 'Em breve' },
    es: { title: 'Desbloquea este pack', unlock: 'Desbloquear Pack', soon: 'Próximamente' }
  }
  const t = translations[lang as 'pt' | 'es'] || translations.pt

  // Split arts into 2 rows for the carousel
  const half = Math.ceil(arts.length / 2)
  const row1 = arts.slice(0, half)
  const row2 = arts.slice(half)

  return (
    <div className="locked-overlay" onClick={onClose}>
      <div className="locked-modal" onClick={e => e.stopPropagation()}>
        {/* Back Button */}
        <button className="locked-back-btn" onClick={onClose} aria-label="Voltar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header */}
        <div className="locked-header">
          <h3>{t.title}</h3>
          <p className="locked-pack-name">{packName}</p>
        </div>

        {/* Carousel */}
        {arts.length > 0 && (
          <div className="locked-carousel">
            <div className="locked-carousel-row locked-carousel-left">
              <div className="locked-carousel-track">
                {[...row1, ...row1, ...row1].map((art, i) => (
                  <div key={`r1-${i}`} className="locked-carousel-item">
                    <img src={art.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                  </div>
                ))}
              </div>
            </div>
            {row2.length > 0 && (
              <div className="locked-carousel-row locked-carousel-right">
                <div className="locked-carousel-track">
                  {[...row2, ...row2, ...row2].map((art, i) => (
                    <div key={`r2-${i}`} className="locked-carousel-item">
                      <img src={art.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buy Button */}
        <div className="locked-footer">
          {buyLink ? (
            <a href={buyLink} target="_blank" rel="noopener noreferrer" className="btn-unlock">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
              {t.unlock}
            </a>
          ) : (
            <span className="btn-unlock btn-unlock-disabled">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
              {t.soon}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
