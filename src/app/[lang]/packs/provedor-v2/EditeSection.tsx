export default function EditeSection() {
  return (
    <section className="v2-edite">
      <div className="v2-edite-content">
        {/* Título */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">Edite onde quiser</span>
          </div>
          <h2 className="v2-section-title">
            Arquivos prontos para{' '}
            <span className="v2-highlight">Canva e Photoshop.</span>
          </h2>
        </div>

        {/* Mockup único */}
        <img
          src="/sales-pages/provedor-v2/mockup.webp"
          alt="Mockup de edição em Canva e Photoshop"
          className="v2-edite-mockup"
          loading="lazy"
        />

        {/* Descrição */}
        <p className="v2-section-desc">
          Não precisa ser designer profissional nem ter programas pesados. Os
          arquivos já vêm 100% organizados para você alterar as informações em
          poucos cliques, seja na praticidade do Canva ou no controle avançado
          do Photoshop.
        </p>
      </div>
    </section>
  )
}
