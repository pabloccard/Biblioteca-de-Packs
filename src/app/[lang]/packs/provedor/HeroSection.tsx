'use client'

export default function HeroSection() {
  return (
    <section className="hero-section">
      {/* Imagem de Fundo / Capa colada no topo */}
      <img
        src="/sales-pages/provedor/hero.webp"
        alt="Pack de Artes para Provedor de Internet"
        className="hero-bg-img"
        fetchPriority="high"
      />

      {/* Conteúdo do Hero posicionado rigorosamente com as medidas do Figma */}
      <div className="hero-content">
        {/* #CHAPÉU: ÍCONE 38, TEXTO SEMIBOLD 42, GAP 50 */}
        <div className="hero-badge">
          <span className="hero-badge-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
                fill="#D4FF5E"
              />
              <path
                d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
                fill="#D4FF5E"
              />
              <path
                d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
                stroke="#D4FF5E"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
                stroke="#D4FF5E"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>Provedor de Internet</span>
        </div>

        {/* #TÍTULO: SEMIBOLD 94, LINE HEIGHT 112%, GAP 90 */}
        <h1 className="hero-title">
          O próximo <span className="hero-highlight">post</span>
          <br />
          do seu provedor
          <br />
          está aqui.
        </h1>

        {/* #TEXTO DE APOIO: REGULAR 40 (com quebras exatas do Figma) */}
        <p className="hero-subtitle">
          Um <span className="hero-subtitle-highlight">pack</span> completo de criativos para<br />
          destacar seus planos de internet nas redes<br />
          sociais. Escolha você mesmo personalizar<br />
          ou receber tudo pronto para postar
        </p>

        {/* Bloco de Duas Opções onde CADA elemento é alinhado ao centro individualmente */}
        <div className="hero-options-wrapper">
          {/* #DUAS OPÇÕES: 64 MEDIUM */}
          <div className="hero-options-header">
            <span className="hero-options-header-icon" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <rect
                  x="2"
                  y="5"
                  width="16"
                  height="20"
                  rx="3"
                  transform="rotate(-10 2 5)"
                  fill="#D4FF5E"
                  opacity="0.8"
                />
                <rect x="8" y="4" width="17" height="21" rx="3.5" fill="#D4FF5E" />
              </svg>
            </span>
            <span>Duas opções</span>
          </div>

          {/* Opção 01: Centralizada ao centro da tela */}
          <div className="hero-option-row">
            <span className="hero-option-num">01</span>
            <div className="hero-option-body">
              <h3 className="hero-option-title">Você mesmo faz a edição</h3>
              <p className="hero-option-desc">
                Receba os arquivos para você mesmo<br />
                editar no Canva ou Photoshop.
              </p>
            </div>
          </div>

          {/* #LINHAS DE SEPARAÇÃO: 264 DE LARGURA, #PALAVRA "OU": 40 (Centralizada ao centro da tela) */}
          <div className="hero-divider">
            <div className="hero-divider-line" />
            <span className="hero-divider-text">ou</span>
            <div className="hero-divider-line" />
          </div>

          {/* Opção 02: Centralizada ao centro da tela */}
          <div className="hero-option-row">
            <span className="hero-option-num">02</span>
            <div className="hero-option-body">
              <h3 className="hero-option-title">Receba pronto para postar</h3>
              <p className="hero-option-desc">
                Nós personalizamos para você com seus<br />
                planos valores e informações.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
