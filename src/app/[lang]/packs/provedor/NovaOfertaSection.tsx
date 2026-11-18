import BgCards from './BgCards'

const BENEFITS = [
  '24 artes prontas para editar',
  '24 legendas prontas inclusas',
  '10 versões de cores inclusas',
  'Use no Canva ou Photoshop',
  'Suporte direto no WhatsApp',
  'Acesso imediato e vitalício',
  '7 dias de garantia total',
]

export default function NovaOfertaSection() {
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
            <span className="v2-badge-text">Oferta Black Friday</span>
          </div>
          <h2 className="v2-section-title">
            Garanta o pack <br />
            <span className="v2-highlight">
              com desconto <br />
              de Black Friday
            </span>
          </h2>
        </div>

        {/* Benefits list */}
        <div className="v2-nova-oferta-benefits">
          {BENEFITS.map((text, i) => (
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
          <p className="v2-nova-oferta-price-old">
            de <s>R$ 46,00</s> por
          </p>
          <p className="v2-nova-oferta-price-current">R$ 29,90</p>
          <p className="v2-nova-oferta-price-unique">pagamento único</p>
        </div>

        {/* CTA button */}
        <a
          href="https://pay.hotmart.com/L108519462J?checkoutMode=10"
          className="v2-nova-oferta-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          Quero meu pack agora
        </a>

        {/* Trust badges */}
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
