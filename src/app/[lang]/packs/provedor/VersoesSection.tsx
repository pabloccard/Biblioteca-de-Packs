'use client'

import { useRef, useEffect } from 'react'
import { VERSOES_COVERS } from './cardsConfig'
import { usePacksContext } from './PacksContext'

export default function VersoesSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const context = usePacksContext()
  const content = context.content.versoes
  const covers = context.versoesCovers || VERSOES_COVERS

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
        track.style.animation = `v2VersoesMarquee 60s linear infinite`
        track.style.animationDelay = `-${progress * 60}s`
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
    <section className="v2-versoes">
      <div className="v2-versoes-content">
        {/* Título */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--green">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text v2-badge-text--semibold">
              {content.badge}
            </span>
          </div>
          <h2 className="v2-section-title">
            {content.titleBefore} <br />
            <span className="v2-highlight" style={{ whiteSpace: 'nowrap' }}>
              {content.highlight}
            </span>{' '}
            {content.titleAfter}
          </h2>
        </div>

        {/* Carrossel de versões — infinito, full width, draggable */}
        <div ref={containerRef} className="v2-versoes-carousel-container">
          <div ref={trackRef} className="v2-versoes-carousel-track">
            {[...covers, ...covers].map((src, i) => (
              <div key={i} className="v2-versoes-carousel-card">
                <img
                  src={src}
                  alt={`Versão de cores ${(i % covers.length) + 1}`}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (!e.currentTarget.src.includes('/provedor-v2/versao-cover-')) {
                      e.currentTarget.src = src.replace('/provedor-v2-es/', '/provedor-v2/')
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <p className="v2-versoes-desc">
          {content.desc}
        </p>
      </div>
    </section>
  )
}
