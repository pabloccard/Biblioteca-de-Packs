'use client'

import BgCards from './BgCards'
import { usePacksContext } from './PacksContext'

export default function NovaOfertaSection() {
  const context = usePacksContext()
  const content = context.content.oferta

  return (
    <section className="v2-nova-oferta">
      <BgCards section="ofertas" />

      <div className="v2-nova-oferta-content">
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
            {content.titleMid} <br />
            <span className="v2-highlight">{content.highlight}</span>
          </h2>
        </div>

        {/* Benefits list */}
        <div className="v2-nova-oferta-benefits">
          {content.benefits.map((text, i) => (
            <div key={i} className="v2-nova-oferta-benefit">
              <span className="v2-nova-oferta-benefit-icon">
                <img
                  src="/sales-pages/provedor-v2/icon-check-green.png"
                  alt=""
                />
              </span>
              <p className="v2-nova-oferta-benefit-text">{text}</p>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="v2-nova-oferta-price">
          <p
            className="v2-nova-oferta-price-old"
            dangerouslySetInnerHTML={{ __html: content.priceOld }}
          />
          <p className="v2-nova-oferta-price-current">{content.priceCurrent}</p>
          <p className="v2-nova-oferta-price-unique">{content.priceUnique}</p>
        </div>

        {/* CTA button */}
        <a
          href={content.checkoutUrl}
          className="v2-nova-oferta-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          {content.ctaText}
        </a>

        {/* Trust badges */}
        <div className="v2-nova-selos">
          <div className="v2-nova-selo">
            <span className="v2-nova-selo-icon v2-nova-selo-icon--security">
              <img
                src="/sales-pages/provedor-v2/selo-security.png"
                alt=""
                loading="lazy"
              />
            </span>
            <p className="v2-nova-selo-text">
              {content.selos.segura.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>

          <div className="v2-nova-selo">
            <span className="v2-nova-selo-icon v2-nova-selo-icon--guaranteed">
              <img
                src="/sales-pages/provedor-v2/selo-guaranteed.png"
                alt=""
                loading="lazy"
              />
            </span>
            <p className="v2-nova-selo-text">
              {content.selos.garantia.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>

          <div className="v2-nova-selo">
            <span className="v2-nova-selo-icon v2-nova-selo-icon--lock">
              <img
                src="/sales-pages/provedor-v2/selo-lock.png"
                alt=""
                loading="lazy"
              />
            </span>
            <p className="v2-nova-selo-text">
              {content.selos.privacidade.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
