'use client'

import { usePacksContext } from './PacksContext'

export default function AutoralSection() {
  const context = usePacksContext()
  const content = context.content.autoral
  const autoralBg = context.autoralBg || '/sales-pages/provedor-v2/autoral-bg.webp'

  return (
    <section className="v2-autoral">
      {/* Background image with gradient shadows */}
      <div className="v2-autoral-bg">
        <img
          src={autoralBg}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.src.includes('/provedor-v2-es/autoral-bg.png')) {
              e.currentTarget.src = '/sales-pages/provedor-v2-es/autoral-bg.webp'
            } else if (!e.currentTarget.src.includes('/provedor-v2/autoral-bg.webp')) {
              e.currentTarget.src = '/sales-pages/provedor-v2/autoral-bg.webp'
            }
          }}
        />
      </div>
      <div className="v2-autoral-shadow" />
      <div className="v2-autoral-shadow2" />

      <div className="v2-autoral-content">
        {/* Title */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">{content.badge}</span>
          </div>
          <h2 className="v2-section-title">
            {content.titleBefore} <br />
            {content.titleBy} <br />
            <span className="v2-highlight">{content.highlight}</span>
          </h2>
        </div>

        {/* Description with mixed styling */}
        <p className="v2-autoral-desc">
          <span className="white">{content.intro}</span>
          <span className="white-bold">{content.name}</span>
          {content.desc}
        </p>
      </div>
    </section>
  )
}
