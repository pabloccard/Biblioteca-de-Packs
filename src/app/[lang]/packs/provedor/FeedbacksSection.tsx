'use client'

import { FEEDBACK_CARDS } from './cardsConfig'
import { usePacksContext } from './PacksContext'

export default function FeedbacksSection() {
  const context = usePacksContext()
  const content = context.content.feedbacks
  const duplicated = [...FEEDBACK_CARDS, ...FEEDBACK_CARDS]

  return (
    <section className="v2-feedbacks">
      <div className="v2-feedbacks-content">
        {/* Título */}
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

        {/* Carrossel infinito de feedbacks */}
        <div className="v2-feedback-carousel-container">
          <div className="v2-feedback-carousel-track">
            {duplicated.map((src, i) => (
              <div key={i} className="v2-feedback-card">
                <img
                  src={src}
                  alt={`Feedback de cliente ${(i % FEEDBACK_CARDS.length) + 1}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <p className="v2-section-desc">
          {content.desc}
        </p>
      </div>
    </section>
  )
}
