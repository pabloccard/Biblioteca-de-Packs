'use client'

import { useRef, useEffect, useState } from 'react'
import {
  SECTION_BG_CARDS,
  resolveArtPath,
  type SectionBgName,
} from './cardsConfig'

interface BgCardsProps {
  section?: SectionBgName
  cards?: (number | string)[]
}

const DEFAULT_CARDS = [1, 2, 3, 4, 5, 6].map(resolveArtPath)

export default function BgCards({ section, cards }: BgCardsProps) {
  const cardList = cards
    ? cards.map(resolveArtPath)
    : (section && SECTION_BG_CARDS[section]) || DEFAULT_CARDS
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let rafId: number
    let isIntersecting = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.05, rootMargin: '100px 0px 100px 0px' }
    )

    observer.observe(el)

    const onScroll = () => {
      if (!isIntersecting) return
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const viewportHeight = window.innerHeight || 800
        // Parallax factor (-40px to +40px)
        const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight
        const translateY = Math.max(-45, Math.min(45, progress * -35))
        el.style.setProperty('--parallax-y', `${translateY.toFixed(2)}px`)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`v2-bg-wrapper ${isVisible ? 'v2-bg-in-view' : ''}`}
    >
      <div className="v2-bg-cards-container">
        <div className="v2-bg-cards-rotated">
          <div className="v2-bg-cards-grid">
            {cardList.map((src, i) => (
              <div key={i} className={`v2-bg-card v2-bg-card-${i + 1}`}>
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="v2-bg-shadow v2-bg-shadow-1" />
      <div className="v2-bg-shadow v2-bg-shadow-2" />
    </div>
  )
}
