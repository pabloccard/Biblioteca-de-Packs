export default function VersionLoading() {
  return (
    <div className="pack-detail-wrapper" aria-busy="true" aria-label="Carregando versão">
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
            <div className="skeleton-title" style={{ width: '190px', height: '24px' }} />
          </div>
          <div className="skeleton-subtitle" style={{ width: '250px', height: '14px', marginTop: '4px' }} />
        </div>

        {/* 3. Seção de Abas */}
        <div className="pack-tabs-section">
          <div className="skeleton-pill-bar" />
        </div>

        {/* 4. Lista de conteúdo da versão */}
        <div className="pack-files-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-file-row">
              <div className="skeleton-file-thumb" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
                <div
                  className="skeleton-title"
                  style={{ width: i % 2 === 0 ? '140px' : '170px', height: '16px' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
