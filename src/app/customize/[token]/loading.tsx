export default function CustomizeLoading() {
  return (
    <div className="cust-flow-wrapper" aria-busy="true" aria-label="Carregando formulário de personalização">
      <div className="cust-flow-container">
        {/* 1. Backdrop de Capa e Sombra */}
        <div className="skeleton-hero-backdrop">
          <img src="/sombra-cover.webp" alt="" className="pack-cover-shadow" aria-hidden="true" />
        </div>

        {/* 2. Header */}
        <div className="pack-header-section">
          <div className="pack-cover-header">
            <div className="skeleton-subtitle" style={{ width: '120px', height: '12px' }} />
          </div>
          <div className="skeleton-title" style={{ width: '220px', height: '28px', marginTop: '4px' }} />
          <div className="skeleton-subtitle" style={{ width: '320px', height: '14px', marginTop: '8px' }} />
        </div>

        {/* 3. Dica da Grade */}
        <div className="cust-grid-hint">
          <div className="skeleton-shimmer" style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0 }} />
          <div className="skeleton-subtitle" style={{ width: '220px', height: '13px' }} />
        </div>

        {/* 4. Grade de Artes (12 cards para preencher as linhas em todas as telas) */}
        <div className="cust-arts-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton-art-card" />
          ))}
        </div>

        {/* 5. Botão de Envio */}
        <div className="cust-submit-section">
          <div className="skeleton-btn-pill" style={{ height: '52px', maxWidth: '440px' }} />
        </div>
      </div>
    </div>
  )
}
