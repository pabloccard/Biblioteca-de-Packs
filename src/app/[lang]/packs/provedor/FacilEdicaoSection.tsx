'use client'

import { usePacksContext } from './PacksContext'

export default function FacilEdicaoSection() {
  const context = usePacksContext()
  const content = context.content.facilEdicao
  const imgSrc =
    context.facilEdicaoScreenshot ||
    '/sales-pages/provedor-v2/facil-edicao-screenshot.webp'

  return (
    <section className="v2-facil-edicao">
      <div className="v2-facil-edicao-content">
        {/* Title */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--green">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">{content.badge}</span>
          </div>
          <h2 className="v2-section-title">
            {content.titleBefore} <br />
            <span className="v2-highlight">
              {content.highlight1} <br />
              {content.highlight2}
            </span>
          </h2>
        </div>

        {/* Screenshot image */}
        <div className="v2-facil-edicao-img-wrapper">
          <img
            src={imgSrc}
            alt="Screenshot de edição no Canva com camadas organizadas"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              if (
                e.currentTarget.src.includes(
                  '/provedor-v2-es/facil-edicao-screenshot.webp'
                )
              ) {
                e.currentTarget.src =
                  '/sales-pages/provedor-v2-es/facil-edicao-screenshot.png'
              } else if (
                !e.currentTarget.src.includes(
                  '/provedor-v2/facil-edicao-screenshot.webp'
                )
              ) {
                e.currentTarget.src =
                  '/sales-pages/provedor-v2/facil-edicao-screenshot.webp'
              }
            }}
          />
        </div>

        {/* Description */}
        <p className="v2-section-desc">
          {content.desc}
        </p>
      </div>
    </section>
  )
}
