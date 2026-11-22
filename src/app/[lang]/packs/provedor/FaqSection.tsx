'use client'

import { useState } from 'react'
import BgCards from './BgCards'
import { usePacksContext } from './PacksContext'

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const context = usePacksContext()
  const content = context.content.faq

  const toggleQuestion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section className="v2-faq">
      <BgCards section="faq" />
      <div className="v2-faq-content">
        {/* Título com Badge */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">{content.badge}</span>
          </div>
          <h2 className="v2-section-title">{content.title}</h2>
        </div>

        {/* Lista de perguntas */}
        <div className="v2-faq-list">
          {content.items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className="v2-faq-item-wrapper">
                {i > 0 && <div className="v2-faq-divider" />}
                <div
                  className="v2-faq-item"
                  onClick={() => toggleQuestion(i)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="v2-faq-header">
                    <h3 className="v2-faq-question">{item.question}</h3>
                    <span
                      className={`v2-faq-chevron ${
                        isOpen ? 'v2-faq-chevron--open' : ''
                      }`}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="#F1F2EC"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>

                  <div
                    className={`v2-faq-answer-wrapper ${
                      isOpen ? 'v2-faq-answer-wrapper--open' : ''
                    }`}
                  >
                    <p className="v2-faq-answer">{item.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
