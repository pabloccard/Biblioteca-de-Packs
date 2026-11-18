'use client'

import { useState } from 'react'
import BgCards from './BgCards'

const FAQ_ITEMS = [
  {
    question: 'Preciso pagar o Canva Pro para conseguir editar as artes?',
    answer:
      'Não. Você consegue abrir as imagens, alterar textos, velocidades, preços e inserir a sua logo e etc usando a conta gratuita do Canva, tanto pelo computador quanto pelo celular.',
  },
  {
    question:
      'Como funcionam as 10 versões de cores? Consigo mudar para qualquer cor?',
    answer:
      'Depende do programa que você for usar: no Photoshop, as cores são 100% editáveis, você tem acesso total às camadas de luzes, brilhos e fundos para personalizar com qualquer cor que desejar. Já no Canva, como a iluminação de fundo é avançada, não é possível trocar a cor; por isso já entregamos o pack pronto nas 10 versões de cores mais utilizadas pelos provedores, bastando abrir a pasta da sua cor preferida e editar os textos e a logo.',
  },
  {
    question: 'Quais informações eu consigo alterar nas artes?',
    answer:
      'Você consegue alterar qualquer informação nas artes: headlines, velocidades, valores mensais, textos de apoio, logomarca, número de WhatsApp, etc.',
  },
  {
    question: 'Como funcionam as 24 legendas prontas?',
    answer:
      'Cada arte do pacote já acompanha uma legenda estruturada para o tema daquele post. Basta copiar o texto, preencher com os dados do seu provedor e colar na hora de publicar.',
  },
  {
    question: 'Em quanto tempo recebo o material após o pagamento?',
    answer:
      'Pagando via PIX ou Cartão de Crédito, a liberação é imediata. Assim que o pagamento é confirmado, você recebe no seu e-mail o acesso a área de membros onde contem todo o material (Canva, Photoshop e legendas).',
  },
  {
    question: 'O pagamento é único ou tem alguma mensalidade?',
    answer:
      'O pagamento de R$ 37,90 é único. Não há mensalidades nem taxas extras, e o seu acesso aos arquivos é vitalício para usar e atualizar seus preços sempre que precisar.',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
            <span className="v2-badge-text">Tire suas dúvidas</span>
          </div>
          <h2 className="v2-section-title">Perguntas Frequentes</h2>
        </div>

        {/* Lista de perguntas */}
        <div className="v2-faq-list">
          {FAQ_ITEMS.map((item, i) => {
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
                    <span className={`v2-faq-chevron ${isOpen ? 'v2-faq-chevron--open' : ''}`}>
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

                  <div className={`v2-faq-answer-wrapper ${isOpen ? 'v2-faq-answer-wrapper--open' : ''}`}>
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
