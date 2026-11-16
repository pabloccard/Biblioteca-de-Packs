'use client'

import { useState } from 'react'
import BgCards from './BgCards'

type OfferOption = 'editavel' | 'pronto'

type BenefitItem = {
  text: string
  highlight?: boolean
}

const BENEFITS_EDITAVEL: BenefitItem[] = [
  { text: '24 artes profissionais prontas para personalizar' },
  { text: '15 versões de cores inclusas' },
  { text: 'Arquivos para Canva (edite no PC ou celular)' },
  { text: 'Arquivos para Photoshop' },
  { text: 'Acesso imediato e uso vitalício sem mensalidades' },
  { text: 'Suporte via WhatsApp' },
]

const BENEFITS_PRONTO: BenefitItem[] = [
  { text: 'Tudo da opção Editável', highlight: true },
  { text: '24 artes finalizadas com os dados do seu provedor' },
  { text: 'Imagens fechadas em alta definição (é só baixar e postar)' },
  { text: 'Suporte via WhatsApp' },
  { text: 'Zero trabalho de edição para você ou sua equipe' },
  { text: 'Entrega rápida (2 dias uteis)' },
]

const CTA_DATA = {
  editavel: 'Quero o pack editável',
  pronto: 'Quero pronto para postar',
}

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <div className="v2-nova-offer-radio">
      <svg
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="19" cy="19" r="18.5" stroke="#F1F2EC" />
        <circle
          cx="19"
          cy="19"
          r="12.6667"
          fill="#D4FF5E"
          className="v2-nova-radio-dot"
          style={{ opacity: selected ? 1 : 0, transform: selected ? 'scale(1)' : 'scale(0)' }}
        />
      </svg>
    </div>
  )
}

export default function OfertasSection() {
  const [selected, setSelected] = useState<OfferOption>('pronto')

  const benefits = selected === 'editavel' ? BENEFITS_EDITAVEL : BENEFITS_PRONTO
  const isEditavelSelected = selected === 'editavel'
  const isProntoSelected = selected === 'pronto'

  return (
    <section className="v2-ofertas">
      <BgCards section="ofertas" />

      <div className="v2-ofertas-content">
        {/* Título com Chapéu */}
        <div className="v2-ofertas-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--green">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">Comece agora</span>
          </div>
          <h2 className="v2-ofertas-title">
            Escolha como
            <br />
            prefere receber
          </h2>
        </div>

        {/* Wrapper centralizado */}
        <div className="v2-nova-oferta-wrapper">
          {/* Opções de Oferta */}
          <div className="v2-nova-offer-items">
            {/* Opção 1: Eu mesmo quero editar */}
            <div
              className={`v2-nova-offer-card ${isEditavelSelected
                ? 'v2-nova-offer-card--selected'
                : 'v2-nova-offer-card--unselected'
                }`}
              onClick={() => setSelected('editavel')}
              role="button"
              tabIndex={0}
            >
              <RadioCircle selected={isEditavelSelected} />

              <div className="v2-nova-offer-body">
                <div className="v2-nova-offer-texts">
                  <h3 className="v2-nova-offer-name">
                    Eu mesmo quero editar
                  </h3>
                  <p className="v2-nova-offer-desc">
                    Pra você ou sua equipe personalizar
                  </p>
                </div>

                <div className="v2-nova-offer-price-col">
                  <div className="v2-nova-offer-price-header">
                    <p className="v2-nova-offer-price-old">
                      de R$ <s>67,90</s> por
                    </p>
                    <p className="v2-nova-offer-price-current">
                      R$ 37,90
                    </p>
                  </div>
                  <p className="v2-nova-offer-price-sub">Pagamento único</p>
                </div>
              </div>
            </div>

            {/* Opção 2: Quero pronto para postar (BLACK FRIDAY) */}
            <div
              className={`v2-nova-offer-card ${isProntoSelected
                ? 'v2-nova-offer-card--selected'
                : 'v2-nova-offer-card--unselected'
                }`}
              onClick={() => setSelected('pronto')}
              role="button"
              tabIndex={0}
            >
              <span className="v2-nova-offer-tag">BLACK FRIDAY</span>

              <RadioCircle selected={isProntoSelected} />

              <div className="v2-nova-offer-body">
                <div className="v2-nova-offer-texts">
                  <h3 className="v2-nova-offer-name">
                    Quero pronto para postar
                  </h3>
                  <p className="v2-nova-offer-desc">
                    Nós entregamos personalizado para você
                  </p>
                </div>

                <div className="v2-nova-offer-price-col">
                  <div className="v2-nova-offer-price-header">
                    <p className="v2-nova-offer-price-old">
                      de R$ <s>297,90</s> por
                    </p>
                    <p className="v2-nova-offer-price-current">
                      R$ 97,90
                    </p>
                  </div>
                  <p className="v2-nova-offer-price-sub">Pagamento único</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Benefícios */}
          <div className="v2-nova-benefits-list" key={selected}>
            {benefits.map((item, i) => (
              <div
                key={`${selected}-${i}`}
                className="v2-nova-benefit-item v2-benefit-fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span className="v2-nova-benefit-check">
                  <img
                    src="/sales-pages/provedor-v2/icon-check-green.png"
                    alt=""
                  />
                </span>
                <p
                  className={`v2-nova-benefit-text${item.highlight ? ' v2-nova-benefit-text--highlight' : ''
                    }`}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Botão CTA */}
          <a href="#" className="v2-nova-cta-btn">
            <span className="v2-nova-cta-btn-text v2-cta-text-fade" key={`cta-${selected}`}>
              {CTA_DATA[selected]}
            </span>
          </a>
        </div>

        {/* Selos de Confiança */}
        <div className="v2-nova-selos">
          <div className="v2-nova-selo">
            <span className="v2-nova-selo-icon v2-nova-selo-icon--security">
              <img src="/sales-pages/provedor-v2/selo-security.png" alt="" loading="lazy" />
            </span>
            <p className="v2-nova-selo-text">
              Compra
              <br />
              Segura
            </p>
          </div>

          <div className="v2-nova-selo">
            <span className="v2-nova-selo-icon v2-nova-selo-icon--guaranteed">
              <img src="/sales-pages/provedor-v2/selo-guaranteed.png" alt="" loading="lazy" />
            </span>
            <p className="v2-nova-selo-text">
              Satisfação
              <br />
              Garantida
            </p>
          </div>

          <div className="v2-nova-selo">
            <span className="v2-nova-selo-icon v2-nova-selo-icon--lock">
              <img src="/sales-pages/provedor-v2/selo-lock.png" alt="" loading="lazy" />
            </span>
            <p className="v2-nova-selo-text">
              Privacidade
              <br />
              Protegida
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
