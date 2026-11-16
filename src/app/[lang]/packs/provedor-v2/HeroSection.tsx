import BgCards from './BgCards'

export default function HeroSection() {
  return (
    <section className="v2-hero">
      <BgCards section="hero" />

      <div className="v2-hero-content">
        {/* Badge / Chapéu — cor verde #D4FF5E */}
        <div className="v2-badge v2-hero-enter v2-hero-enter-1">
          <span className="v2-badge-icon v2-badge-icon--green">
            <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
          </span>
          <span className="v2-badge-text v2-badge-text--semibold">
            Provedor de Internet
          </span>
        </div>

        {/* Título principal */}
        <h1 className="v2-hero-title v2-hero-enter v2-hero-enter-2">
          O próximo <span className="v2-highlight">post</span>
          <br />
          do seu provedor
          <br />
          está aqui.
        </h1>

        {/* Subtítulo */}
        <p className="v2-hero-subtitle v2-hero-enter v2-hero-enter-3">
          <span className="v2-highlight">Um pack</span>{' '}
          <span>
            completo de criativos para destacar seus planos de internet nas
            redes sociais. Escolha você mesmo personalizar ou receber tudo
            pronto para postar
          </span>
        </p>

        {/* Bloco "Duas opções" */}
        <div className="v2-hero-options v2-hero-enter v2-hero-enter-4">
          <div className="v2-hero-options-header">
            <span>Duas opções</span>
          </div>

          <div className="v2-hero-modalidades">
            {/* Opção 01 */}
            <div className="v2-hero-option-row">
              <span className="v2-hero-option-num">01</span>
              <div className="v2-hero-option-body">
                <h3 className="v2-hero-option-title">
                  Você mesmo faz a edição
                </h3>
                <p className="v2-hero-option-desc">
                  Receba os arquivos para você mesmo editar no Canva ou
                  Photoshop.
                </p>
              </div>
            </div>

            {/* Divisor "ou" */}
            <div className="v2-hero-divider">
              <div className="v2-hero-divider-line" />
              <span className="v2-hero-divider-text">ou</span>
              <div className="v2-hero-divider-line" />
            </div>

            {/* Opção 02 */}
            <div className="v2-hero-option-row">
              <span className="v2-hero-option-num">02</span>
              <div className="v2-hero-option-body">
                <h3 className="v2-hero-option-title">
                  Receba pronto para postar
                </h3>
                <p className="v2-hero-option-desc">
                  Nós personalizamos para você com seus planos valores e
                  informações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
