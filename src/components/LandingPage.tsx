'use client'

import { useState } from 'react'
import Image from 'next/image'

// ===== TYPES =====
export interface LPData {
  packName: string
  headline: string
  subheadline: string
  heroImages: string[]
  colorSection: {
    title: string
    description: string
    mockImage: string
  }
  previewImages: string[]
  features: { icon: string; text: string }[]
  testimonials: { image: string }[]
  pricing: {
    originalPrice: string
    salePriceMain: string
    salePriceCents: string
    features: string[]
    ctaLink: string
    ctaText: string
  }
  whatsappLink: string
  whatsappText: string
  guarantee: {
    title: string
    description: string
  }
  faqs: { question: string; answer: string }[]
}

// ===== FAQ ACCORDION =====
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`lp-faq-item ${open ? 'lp-faq-open' : ''}`}>
      <button className="lp-faq-question" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <svg className="lp-faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="lp-faq-answer">{answer}</div>}
    </div>
  )
}

// ===== MAIN COMPONENT =====
export default function LandingPage({ data }: { data: LPData }) {
  return (
    <div className="lp-page">

      {/* ===== HERO NETFLIX ===== */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-hero-grid">
            {[...data.heroImages, ...data.heroImages, ...data.heroImages].map((img, i) => (
              <div key={i} className="lp-hero-grid-item">
                <Image src={img} alt="" width={260} height={390} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
            ))}
          </div>
        </div>
        <div className="lp-hero-overlay" />
        <div className="lp-hero-content">
          <span className="lp-hero-badge">✨ Pack Premium</span>
          <h1 className="lp-hero-title">{data.headline}</h1>
          <p className="lp-hero-subtitle">{data.subheadline}</p>
          <a href={data.pricing.ctaLink} className="lp-btn-cta">
            {data.pricing.ctaText}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </section>

      {/* ===== PALETA DE CORES ===== */}
      <section className="lp-section">
        <div className="lp-container">
          <h2 className="lp-section-title">{data.colorSection.title}</h2>
          <p className="lp-section-subtitle">{data.colorSection.description}</p>
          <div className="lp-color-mock">
            <Image src={data.colorSection.mockImage} alt="Paleta de cores" width={900} height={500} style={{ objectFit: 'contain', width: '100%', height: 'auto', borderRadius: '16px' }} />
          </div>
        </div>
      </section>

      {/* ===== PRÉVIA DE ARTES ===== */}
      <section className="lp-section">
        <div className="lp-container">
          <h2 className="lp-section-title">Confira uma prévia de algumas artes do pack</h2>
          <div className="lp-preview-grid">
            {data.previewImages.map((img, i) => (
              <div key={i} className="lp-preview-item">
                <Image src={img} alt={`Arte ${i + 1}`} width={400} height={500} style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '12px' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== O QUE VOCÊ RECEBE ===== */}
      <section className="lp-section lp-section-features">
        <div className="lp-container">
          <h2 className="lp-section-title">Tudo o que você vai receber:</h2>
          <div className="lp-features-grid">
            {data.features.map((feat, i) => (
              <div key={i} className="lp-feature-card">
                <span className="lp-feature-icon">{feat.icon}</span>
                <span className="lp-feature-text">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEEDBACKS ===== */}
      {data.testimonials.length > 0 && (
        <section className="lp-section">
          <div className="lp-container">
            <h2 className="lp-section-title">O que nossos clientes dizem</h2>
            <div className="lp-testimonials-grid">
              {data.testimonials.map((t, i) => (
                <div key={i} className="lp-testimonial-item">
                  <Image src={t.image} alt={`Feedback ${i + 1}`} width={400} height={700} style={{ objectFit: 'cover', width: '100%', height: 'auto', borderRadius: '12px' }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== OFERTA ESPECIAL ===== */}
      <section className="lp-section lp-section-pricing" id="oferta">
        <div className="lp-container">
          <div className="lp-pricing-card">
            <div className="lp-pricing-header">
              <span className="lp-pricing-badge">🔥 Oferta especial por tempo limitado</span>
            </div>
            <div className="lp-pricing-features">
              {data.pricing.features.map((feat, i) => (
                <div key={i} className="lp-pricing-feature">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <div className="lp-pricing-divider" />
            <p className="lp-pricing-lead">Leve o pack completo com desconto exclusivo e acesso imediato.</p>
            <div className="lp-pricing-price">
              <span className="lp-pricing-original">de R$ {data.pricing.originalPrice} por apenas</span>
              <div className="lp-pricing-sale">
                <span className="lp-pricing-currency">R$</span>
                <span className="lp-pricing-main">{data.pricing.salePriceMain}</span>
                <span className="lp-pricing-cents">,{data.pricing.salePriceCents}</span>
              </div>
              <span className="lp-pricing-type">Pagamento único</span>
            </div>
            <a href={data.pricing.ctaLink} className="lp-btn-cta lp-btn-cta-large">
              Garantir Desconto
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== SUPORTE WHATSAPP ===== */}
      <section className="lp-section">
        <div className="lp-container lp-whatsapp-section">
          <div className="lp-whatsapp-icon">💬</div>
          <h2 className="lp-section-title">Suporte via WhatsApp</h2>
          <p className="lp-section-subtitle">{data.whatsappText}</p>
          <a href={data.whatsappLink} target="_blank" rel="noopener noreferrer" className="lp-btn-whatsapp">
            Falar no WhatsApp
          </a>
        </div>
      </section>

      {/* ===== GARANTIA ===== */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-guarantee-card">
            <div className="lp-guarantee-badge">🛡️</div>
            <h2 className="lp-guarantee-title">{data.guarantee.title}</h2>
            <p className="lp-guarantee-text">{data.guarantee.description}</p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="lp-section">
        <div className="lp-container">
          <h2 className="lp-section-title">Perguntas Frequentes</h2>
          <div className="lp-faq-list">
            {data.faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="lp-footer">
        <p>© {new Date().getFullYear()} — Todos os direitos reservados</p>
      </footer>
    </div>
  )
}
