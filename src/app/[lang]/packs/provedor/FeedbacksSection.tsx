'use client'

import { FEEDBACK_CARDS } from './cardsConfig'
import { usePacksContext } from './PacksContext'

export default function FeedbacksSection() {
  const context = usePacksContext()
  const content = context.content.feedbacks
  const cards = context.feedbackCards || FEEDBACK_CARDS
  const duplicated = [...cards, ...cards]

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
                  alt={`Feedback de cliente ${(i % cards.length) + 1}`}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.currentTarget.src.includes('/provedor-v2-es/feedbacks/feedback-') && e.currentTarget.src.includes('.webp')) {
                      e.currentTarget.src = e.currentTarget.src.replace('.webp', '.png')
                    } else if (!e.currentTarget.src.includes('/provedor-v2/feedback-')) {
                      e.currentTarget.src = '/sales-pages/provedor-v2/feedback-1.webp'
                    }
                  }}
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
