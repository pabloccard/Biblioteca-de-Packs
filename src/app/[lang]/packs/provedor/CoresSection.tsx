'use client'

// 15 versões de cores
const VERSOES_IMAGES = Array.from(
  { length: 15 },
  (_, i) => `/sales-pages/provedor/versao-${i + 1}.webp`
)

export default function CoresSection() {
  // Duplicamos as 15 versões para criar o loop contínuo e infinito sem interrupções
  const displayImages = [...VERSOES_IMAGES, ...VERSOES_IMAGES]

  return (
    <section className="cores-section">
      {/* Imagem de Fundo / Capa do Topo (mesmo esquema de cover do Hero) */}
      <img
        src="/sales-pages/provedor/cores-cover.webp"
        alt="Versões de Cores"
        className="cores-bg-img"
        fetchPriority="high"
      />

      <div className="cores-content">
        {/* Bloco de Texto Superior */}
        <div className="cores-text-container">
          {/* #CHAPÉU: ÍCONE 38, TEXTO SEMIBOLD 42, GAP 50 */}
          <div className="cores-badge">
            <span className="cores-badge-icon" aria-hidden="true">
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
            <span>Várias versões inclusas</span>
          </div>

          {/* #TÍTULO: SEMIBOLD 94, LINE HEIGHT 112%, GAP 90 */}
          <h2 className="cores-title">
            Receba o pack em
            <br />
            <span className="cores-highlight">15 versões</span> de cores.
          </h2>
        </div>

        {/* #CARROSSEL DE CORES: LARGURA 660px, ESPAÇO 20px (Figma Scale) */}
        <div className="cores-carousel-container">
          <div className="cores-carousel-track">
            {displayImages.map((src, index) => (
              <div key={index} className="cores-carousel-card">
                <img
                  src={src}
                  alt={`Versão de cor ${(index % 15) + 1}`}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bloco de Texto Inferior */}
        <div className="cores-text-container">
          {/* #TEXTO DE APOIO: REGULAR 40 */}
          <p className="cores-subtitle">
            Recolorir uma arte cheia de efeitos dá
            <br />
            trabalho. Por isso, já preparamos{' '}
            <span className="cores-highlight">15 versões</span>
            <br />
            com as principais cores do mercado para
            <br />
            você ter opções prontas de uso.
          </p>
        </div>
      </div>
    </section>
  )
}