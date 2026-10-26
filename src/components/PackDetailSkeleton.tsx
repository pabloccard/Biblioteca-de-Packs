'use client'

export default function PackDetailSkeleton() {
  return (
    <div className="pack-detail-wrapper" aria-busy="true" aria-label="Carregando detalhes do pack">
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

        {/* 2. Header (Começa rigorosamente no mesmo pixel Y) */}
        <div className="pack-header-section">
          <div className="pack-cover-header">
            <div className="skeleton-title" style={{ width: '210px', height: '24px' }} />
          </div>
          <div className="skeleton-subtitle" style={{ width: '270px', height: '14px', marginTop: '4px' }} />
        </div>

        {/* 3. Lista de arquivos / formatos */}
        <div className="pack-files-list">
          {/* Card de Personalizado */}
          <div className="skeleton-file-row">
            <div className="skeleton-file-thumb" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div className="skeleton-title" style={{ width: '130px', height: '16px' }} />
              <div className="skeleton-subtitle" style={{ width: '230px', height: '12px' }} />
            </div>
          </div>

          {/* Formatos do Pack */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-file-row">
              <div className="skeleton-file-thumb" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
                <div
                  className="skeleton-title"
                  style={{ width: i === 1 ? '160px' : i === 2 ? '140px' : '175px', height: '16px' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
