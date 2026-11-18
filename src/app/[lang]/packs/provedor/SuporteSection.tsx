import BgCards from './BgCards'

export default function SuporteSection() {
  return (
    <section className="v2-suporte">
      <BgCards section="suporte" />

      <div className="v2-suporte-content">
        {/* Título com Badge */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">Precisa de ajuda?</span>
          </div>
          <h2 className="v2-section-title">
            Suporte direto <br />
            pelo WhatsApp
          </h2>
        </div>

        {/* Banner WhatsApp */}
        <div className="v2-suporte-banner-wrapper">
          <img
            src="/sales-pages/provedor-v2/suporte-banner.webp"
            alt="Suporte pelo WhatsApp"
            className="v2-suporte-banner"
            loading="lazy"
          />
        </div>

        {/* Descrição */}
        <p className="v2-section-desc">
          Nada de robôs ou e-mails sem resposta. Se surgir qualquer dúvida para
          acessar as artes, inserir a sua logo ou editar suas informações, você
          fala diretamente com a gente no WhatsApp para resolver na hora.
        </p>
      </div>
    </section>
  )
}
