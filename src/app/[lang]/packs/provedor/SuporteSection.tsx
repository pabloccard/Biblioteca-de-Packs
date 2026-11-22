'use client'

import BgCards from './BgCards'
import { usePacksContext } from './PacksContext'

export default function SuporteSection() {
  const context = usePacksContext()
  const content = context.content.suporte
  const bannerSrc =
    context.suporteBanner || '/sales-pages/provedor-v2/suporte-banner.webp'

  return (
    <section className="v2-suporte">
      <BgCards section="suporte" />

      <div className="v2-suporte-content">
        {/* Título com Badge */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">{content.badge}</span>
          </div>
          <h2 className="v2-section-title">
            {content.title}
          </h2>
        </div>

        {/* Banner WhatsApp */}
        <div className="v2-suporte-banner-wrapper">
          <img
            src={bannerSrc}
            alt="Suporte pelo WhatsApp"
            className="v2-suporte-banner"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src =
                '/sales-pages/provedor-v2/suporte-banner.webp'
            }}
          />
        </div>

        {/* Descrição */}
        <p className="v2-section-desc">
          {content.desc}
        </p>
      </div>
    </section>
  )
}
