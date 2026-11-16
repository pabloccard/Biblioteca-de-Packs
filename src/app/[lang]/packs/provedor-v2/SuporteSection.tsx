import BgCards from './BgCards'

export default function SuporteSection() {
  return (
    <section className="v2-suporte">
      <BgCards section="suporte" />

      <div className="v2-suporte-content">
        {/* Título com Badge */}
        <div className="v2-section-title-block v2-reveal">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue" />
            <span className="v2-badge-text">Precisa de ajuda?</span>
          </div>
          <h2 className="v2-section-title">
            Suporte direto <br />
            pelo WhatsApp
          </h2>
        </div>

        {/* Banner WhatsApp */}
        <div className="v2-suporte-banner-wrapper v2-reveal-scale v2-delay-1">
          <img
            src="/sales-pages/provedor-v2/suporte-banner.webp"
            alt="Suporte pelo WhatsApp"
            className="v2-suporte-banner"
          />
        </div>

        {/* Descrição */}
        <p className="v2-section-desc v2-reveal v2-delay-2">
          Nada de robôs ou e-mails sem resposta. Tanto para tirar dúvidas rápidas
          na opção <strong>Eu mesmo quero editar</strong> quanto para alinhar os
          dados do seu provedor na opção <strong>Quero pronto para postar</strong>
          , você fala diretamente com a gente no WhatsApp.
        </p>
      </div>
    </section>
  )
}
