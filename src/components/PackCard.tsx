'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LockedPackModal from './LockedPackModal'

interface PackArt {
  id: string
  image_url: string
}

interface PackCardProps {
  id: string
  name: string
  coverImageUrl: string | null
  artCount: number
  isUnlocked: boolean
  specs: string[]
  arts: PackArt[]
  buyLink: string
  showDiscountTag?: boolean
  version?: string
  lang: string
}

export default function PackCard({ id, name, coverImageUrl, artCount, isUnlocked, specs, arts, buyLink, showDiscountTag = true, version = '1.0', lang }: PackCardProps) {
  const [showModal, setShowModal] = useState(false)

  const cardContent = (
    <div className={`pack-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
      {showDiscountTag && !isUnlocked && (
        <div className="promo-tag">PROMOÇÃO</div>
      )}
      {isUnlocked && version && (
        <div className="version-tag">{version}</div>
      )}
      <div className="pack-card-image">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={name}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            fontSize: '2.5rem',
          }}>
            📦
          </div>
        )}

        {!isUnlocked && (
          <div className="pack-card-lock">
            <div className="lock-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
        )}

      </div>
    </div>
  )

  if (isUnlocked) {
    return <Link href={`/${lang}/pack/${id}`}>{cardContent}</Link>
  }

  return (
    <>
      <div className="pack-card-wrapper-locked" style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>

        {cardContent}
      </div>
      <LockedPackModal
        lang={lang}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        packName={name}
        specs={specs}
        arts={arts}
        buyLink={buyLink}
      />
    </>
  )
}
