import { FEEDBACK_CARDS } from './cardsConfig'

export default function FeedbacksSection() {
  /* Duplicate images enough times for seamless infinite loop */
  const duplicated = [
    ...FEEDBACK_CARDS,
    ...FEEDBACK_CARDS,
  ]

  return (
    <section className="v2-feedbacks">
      <div className="v2-feedbacks-content">
        {/* Título */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">Quem comprou, aprovou</span>
          </div>
          <h2 className="v2-section-title">
            O que dizem os <br />
            provedores que já <br />
            usam o pack
          </h2>
        </div>

        {/* Carrossel infinito de feedbacks — auto-scroll, sem drag */}
        <div className="v2-feedback-carousel-container">
          <div className="v2-feedback-carousel-track">
            {duplicated.map((src, i) => (
              <div key={i} className="v2-feedback-card">
                <img
                  src={src}
                  alt={`Feedback de cliente ${(i % FEEDBACK_CARDS.length) + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <p className="v2-section-desc">
          Quem já usa nossos pacotes no dia a dia sabe que na prática não tem
          segredo nem perda de tempo: você recebe o acesso na hora, coloca os
          dados do seu provedor em poucos cliques e já bota as artes para rodar.
        </p>
      </div>
    </section>
  )
}
