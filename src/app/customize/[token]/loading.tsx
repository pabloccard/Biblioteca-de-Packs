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
          <div className="skeleton-title" style={{ width: '200px', height: '24px', marginTop: '4px' }} />
          <div className="skeleton-subtitle" style={{ width: '290px', height: '14px', marginTop: '6px' }} />
        </div>

        {/* 3. Dica da Grade */}
        <div className="cust-grid-hint" style={{ marginTop: 'var(--pack-header-gap, 28px)' }}>
          <div className="skeleton-shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0 }} />
          <div className="skeleton-subtitle" style={{ width: '190px', height: '12px' }} />
        </div>

        {/* 4. Grade de Artes (3 Colunas) */}
        <div className="cust-arts-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-art-card" />
          ))}
        </div>

        {/* 5. Botão de Envio */}
        <div className="cust-submit-section" style={{ width: '100%', padding: '32px 32px 80px' }}>
          <div className="skeleton-btn-pill" style={{ height: '52px' }} />
        </div>
      </div>
    </div>
  )
}
