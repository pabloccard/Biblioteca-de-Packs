'use client'

import BgCards from './BgCards'
import { usePacksContext } from './PacksContext'

export default function EditeSection({ mockupSrc }: { mockupSrc?: string }) {
  const context = usePacksContext()
  const content = context.content.edite
  const imageSrc =
    mockupSrc || context?.mockupSrc || '/sales-pages/provedor-v2/mockup.webp'

  return (
    <section className="v2-edite">
      <BgCards section="edite" />
      <div className="v2-edite-content">
        {/* Título */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">{content.badge}</span>
          </div>
          <h2 className="v2-section-title">
            {content.titleBefore} <br />
            {content.titleFor}{' '}
            <span className="v2-highlight">
              {content.highlight1} <br />
              {content.highlight2}
            </span>
          </h2>
        </div>

        {/* Mockup */}
        <img
          src={imageSrc}
          alt="Mockup de edição em Canva e Photoshop"
          className="v2-edite-mockup"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.src.includes('/provedor-v2-es/mockup-')) {
              e.currentTarget.src = '/sales-pages/provedor-v2-es/mockup.webp'
            } else if (e.currentTarget.src.includes('/provedor-v2-es/mockup.png')) {
              e.currentTarget.src = '/sales-pages/provedor-v2-es/mockup.webp'
            } else if (!e.currentTarget.src.includes('/provedor-v2/mockup.webp')) {
              e.currentTarget.src = '/sales-pages/provedor-v2/mockup.webp'
            }
          }}
        />

        {/* Descrição */}
        <p className="v2-section-desc">
          {content.desc}
        </p>
      </div>
    </section>
  )
}
