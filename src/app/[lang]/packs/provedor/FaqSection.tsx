'use client'

import { useState } from 'react'

const FAQ_ITEMS = [
  {
    question: 'Como funciona a entrega na opção "Quero pronto para postar"?',
    answer:
      'Após o pagamento, entramos em contato com você pelo WhatsApp (ou você já pode nos chamar direto pelo botão da área de membros). Você envia sua logo, escolhe a versão de cor do pack que prefere, e coletamos as informações que você quer em cada arte. Em até 2 dias úteis, entregamos as 24 artes finalizadas em alta definição (prontas para baixar e publicar) e enviamos também os arquivos editáveis no Canva da cor que você escolheu, para você alterar preços ou planos futuros sempre que precisar.',
  },
  {
    question:
      'Preciso pagar o Canva Pro ou saber usar Photoshop na opção "Eu mesmo quero editar"?',
    answer:
      'Não. No Canva, você consegue editar textos, preços e logo usando a conta gratuita, tanto pelo computador quanto pelo celular. E se você ou sua equipe preferirem usar o Adobe Photoshop, todos os arquivos também vão em formato PSD com camadas 100% abertas e organizadas.',
  },
  {
    question:
      'Como funcionam as 10 versões de cores? Consigo mudar para qualquer cor?',
    answer:
      'Depende do programa que você for usar: no Photoshop, as cores são 100% editáveis, você tem acesso total às camadas para personalizar com qualquer cor que desejar. Já no Canva, como a iluminação de fundo é avançada, não é possível trocar a cor da arte sem perder qualidade; por isso já entregamos o pack pronto nas 10 versões de cores mais utilizadas pelos provedores, bastando abrir a pasta da sua cor preferida e editar os textos e a logo.',
  },
  {
    question: 'Quais informações eu consigo alterar nas artes?',
    answer:
      'Você pode personalizar todas as informações, todos os textos são editáveis, inclusive informações comerciais.',
  },
  {
    question: 'Em quanto tempo recebo o material após o pagamento?',
    answer:
      'Na opção Eu mesmo quero editar, pagando via PIX ou Cartão de Crédito, a liberação dos arquivos (Canva e Photoshop) é imediata e chega no seu e-mail na mesma hora. Já na opção Quero pronto para postar, o alinhamento no WhatsApp começa logo após a compra e, em até 2 dias úteis, você recebe as 24 artes finalizadas (prontas para postar), além de todos os arquivos editáveis.',
  },
  {
    question: 'O pagamento é único ou tem alguma mensalidade?',
    answer:
      'O pagamento é único (R$ 37,90 na opção Eu mesmo quero editar ou R$ 97,90 na opção Quero pronto para postar). Não há mensalidades nem taxas extras, e o seu acesso aos arquivos é vitalício para usar e atualizar seus preços sempre que precisar.',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleQuestion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section className="v2-faq">
      <div className="v2-faq-content">
        {/* Título com Badge */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue" />
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
