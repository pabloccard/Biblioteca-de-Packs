export default function LoginLoading() {
  return (
    <div className="login-page" aria-busy="true" aria-label="Carregando login">
      <div className="login-card">
        {/* Title & Subtitle */}
        <div className="skeleton-title" style={{ width: '180px', height: '24px', margin: '0 auto 12px' }} />
        <div className="skeleton-subtitle" style={{ width: '240px', height: '14px', margin: '0 auto 32px' }} />

        {/* Input & Button */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="skeleton-input-pill" />
          <div className="skeleton-btn-pill" />
        </div>

        {/* Support note */}
        <div className="skeleton-subtitle" style={{ width: '150px', height: '12px', margin: '24px auto 0' }} />
      </div>
    </div>
  )
}
