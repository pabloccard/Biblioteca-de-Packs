'use client'

import { useRef, useEffect } from 'react'
import BgCards from './BgCards'
import { CARROSSEL_ARTES } from './cardsConfig'
import { usePacksContext } from './PacksContext'

export default function HeroSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const context = usePacksContext()
  const content = context.content.hero
  const artes = context?.carrosselArtes || CARROSSEL_ARTES
  const duplicated = [...artes, ...artes]

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    let isDragging = false
    let startX = 0
    let currentTranslate = 0
    let animationPaused = false

    const pauseAnimation = () => {
      if (!animationPaused) {
        const computedStyle = getComputedStyle(track)
        const matrix = new DOMMatrix(computedStyle.transform)
        currentTranslate = matrix.m41
        track.style.animation = 'none'
        track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`
        animationPaused = true
      }
    }

    const resumeAnimation = () => {
      if (animationPaused) {
        const totalWidth = track.scrollWidth / 2
        const progress = (Math.abs(currentTranslate) % totalWidth) / totalWidth
        track.style.transform = ''
        track.style.animation = `v2Marquee 138s linear infinite`
        track.style.animationDelay = `-${progress * 138}s`
        animationPaused = false
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      isDragging = true
      startX = e.touches[0].clientX
      pauseAnimation()
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const deltaX = e.touches[0].clientX - startX
      const totalWidth = track.scrollWidth / 2
      let newTranslate = currentTranslate + deltaX
      if (Math.abs(newTranslate) > totalWidth) newTranslate += totalWidth
      if (newTranslate > 0) newTranslate -= totalWidth
      track.style.transform = `translate3d(${newTranslate}px, 0, 0)`
    }

    const onTouchEnd = () => {
      if (!isDragging) return
      isDragging = false
      const computedStyle = getComputedStyle(track)
      const matrix = new DOMMatrix(computedStyle.transform)
      currentTranslate = matrix.m41
      resumeAnimation()
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.clientX
      pauseAnimation()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - startX
      const totalWidth = track.scrollWidth / 2
      let newTranslate = currentTranslate + deltaX
      if (Math.abs(newTranslate) > totalWidth) newTranslate += totalWidth
      if (newTranslate > 0) newTranslate -= totalWidth
      track.style.transform = `translate3d(${newTranslate}px, 0, 0)`
    }

    const onMouseUp = () => {
      if (!isDragging) return
      isDragging = false
      const computedStyle = getComputedStyle(track)
      const matrix = new DOMMatrix(computedStyle.transform)
      currentTranslate = matrix.m41
      resumeAnimation()
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: true })
    container.addEventListener('touchend', onTouchEnd)
    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <section className="v2-hero">
      <BgCards section="hero" />

      <div className="v2-hero-content">
        {/* Bloco de título com badge */}
        <div className="v2-section-title-block v2-hero-enter v2-hero-enter-1">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">
              {content.badge}
            </span>
          </div>

          <h1 className={`v2-hero-title ${context.lang === 'es' ? 'v2-hero-title--es' : ''}`}>
            {content.titleBefore} <br />
            {content.titleMid} <br />
            <span className="v2-highlight">
              {content.titleHighlight} <br />
              {content.titleHighlight2}
            </span>
          </h1>
        </div>

        {/* Subtítulo */}
        <p className="v2-hero-subtitle v2-hero-enter v2-hero-enter-3">
          {content.subtitle}
        </p>

        {/* Carrossel de artes — infinito, full width, draggable */}
        <div ref={containerRef} className="v2-carousel-track-container v2-hero-enter v2-hero-enter-4">
          <div ref={trackRef} className="v2-carousel-track">
            {duplicated.map((src, i) => {
              const isPriority = i < 2
              return (
                <div key={i} className="v2-carousel-card">
                  <img
                    src={src}
                    alt={`Arte ${(i % artes.length) + 1}`}
                    loading={isPriority ? 'eager' : 'lazy'}
                    fetchPriority={isPriority ? 'high' : 'low'}
                    decoding="async"
                    onError={(e) => {
                      if (!e.currentTarget.src.includes('/provedor-v2/artes/')) {
                        e.currentTarget.src = src.replace('/provedor-v2-es/', '/provedor-v2/')
                      }
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Texto descritivo final */}
        <p className="v2-hero-desc">
          {content.desc}
        </p>
      </div>
    </section>
  )
}
