export default function FacilEdicaoSection() {
  return (
    <section className="v2-facil-edicao">
      <div className="v2-facil-edicao-content">
        {/* Title */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--green">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">Fácil edição</span>
          </div>
          <h2 className="v2-section-title">
            Tudo organizado <br />
            <span className="v2-highlight">
              e pronto para <br />
              você alterar.
            </span>
          </h2>
        </div>

        {/* Screenshot image with gradient shadow */}
        <div className="v2-facil-edicao-img-wrapper">
          <img
            src="/sales-pages/provedor-v2/facil-edicao-screenshot.webp"
            alt="Screenshot de edição no Canva com camadas organizadas"
            loading="lazy"
          />
          <div className="v2-facil-edicao-img-shadow" />
        </div>

        {/* Description */}
        <p className="v2-section-desc">
          Você não precisa perder tempo procurando onde clicar. Como todas as
          camadas já estão organizadas, basta selecionar o que você quer editar,
          substituir pelas informações do seu provedor e salvar a arte.
        </p>
      </div>
    </section>
  )
}
