'use client'

// Todas as 24 imagens do carrossel
const CARROSSEL_IMAGES = Array.from(
  { length: 24 },
  (_, i) => `/sales-pages/provedor/carrossel-${i + 1}.webp`
)

export default function ArtesSection() {
  // Duplicamos as 24 fotos para criar um loop infinito contínuo e sem saltos
  const displayImages = [...CARROSSEL_IMAGES, ...CARROSSEL_IMAGES]

  return (
    <section className="artes-section">
      {/* Bloco de Texto Superior */}
      <div className="artes-text-container">
        {/* #CHAPÉU: ÍCONE 38, TEXTO SEMIBOLD 42, GAP 50 */}
        <div className="artes-badge">
          <span className="artes-badge-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
                fill="#2563EB"
              />
              <path
                d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
                fill="#2563EB"
              />
              <path
                d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>Conheça as artes</span>
        </div>

        {/* #TÍTULO: SEMIBOLD 94, LINE HEIGHT 112%, GAP 90 */}
        <h2 className="artes-title">
          Padrão de grande
          <br />
          agência, pronto para
          <br />
          o seu provedor usar.
        </h2>
      </div>

      {/* #CARROSSEL AUTOMÁTICO INFINITO:
          Usa animação de GPU contínua com touch-action: pan-y para NUNCA travar o scroll vertical da página */}
      <div className="artes-carousel-container">
        <div className="artes-carousel-track">
          {displayImages.map((src, index) => (
            <div key={index} className="artes-carousel-card">
              <img
                src={src}
                alt={`Arte de Provedor de Internet ${(index % 24) + 1}`}
                loading={index < 4 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bloco de Texto Inferior */}
      <div className="artes-text-container">
        {/* #TEXTO DE APOIO: REGULAR 40 */}
        <p className="artes-subtitle">
          A parte mais pesada do design já foi
          <br />
          resolvida para você. Toda a direção
          <br />
          visual, equilíbrio de cores e organização
          <br />
          de informações já estão prontos: basta
          <br />
          aplicar sua marca ou pedir finalizado.
        </p>
      </div>
    </section>
  )
}
