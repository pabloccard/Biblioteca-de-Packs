export default function CustomLoading() {
  return (
    <div className="pack-detail-wrapper" aria-busy="true" aria-label="Carregando personalizado">
      <div className="pack-detail-container">
        {/* Botão voltar */}
        <div className="pack-detail-back-btn" aria-hidden="true" style={{ pointerEvents: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
        </div>

        {/* 1. Backdrop de Capa e Sombra */}
        <div className="skeleton-hero-backdrop">
          <img src="/sombra-cover.webp" alt="" className="pack-cover-shadow" aria-hidden="true" />
        </div>

        {/* 2. Header */}
        <div className="pack-header-section">
          <div className="pack-cover-header">
            <div className="skeleton-title" style={{ width: '180px', height: '24px' }} />
          </div>
          <div className="skeleton-subtitle" style={{ width: '270px', height: '14px', marginTop: '4px' }} />
        </div>

        {/* 3. Grade de artes personalizadas (3 Colunas) */}
        <div className="custom-content-view" style={{ marginTop: 'var(--pack-header-gap, 28px)' }}>
          <div className="custom-ready-container">
            {/* Ação de download */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="skeleton-shimmer" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
              <div className="skeleton-title" style={{ width: '130px', height: '16px' }} />
            </div>

            {/* Grid 3 colunas */}
            <div className="custom-arts-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-art-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
