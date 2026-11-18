export default function AutoralSection() {
  return (
    <section className="v2-autoral">
      {/* Background image with gradient shadows */}
      <div className="v2-autoral-bg">
        <img
          src="/sales-pages/provedor-v2/autoral-bg.webp"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="v2-autoral-shadow" />
      <div className="v2-autoral-shadow2" />

      <div className="v2-autoral-content">
        {/* Title */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">Criação 100% autoral</span>
          </div>
          <h2 className="v2-section-title">
            Feito do zero <br />
            por um designer <br />
            <span className="v2-highlight">especialista em provedores.</span>
          </h2>
        </div>

        {/* Description with mixed styling */}
        <p className="v2-autoral-desc">
          <span className="white">Prazer, meu nome é </span>
          <span className="white-bold">Pablo </span>
          e sou o designer por trás de todas as artes desta página. Aqui você
          não está comprando um pacote genérico de revenda com artes catadas da
          internet: cada peça deste pack foi desenhada do zero por mim, pensando
          especificamente no que faz um provedor de internet chamar atenção e
          vender planos na sua cidade, desde a iluminação e o destaque dos planos
          até a organização limpa das camadas para facilitar a sua edição.
        </p>
      </div>
    </section>
  )
}
