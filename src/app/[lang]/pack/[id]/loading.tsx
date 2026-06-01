export default function PackLoading() {
  return (
    <div className="page-wrapper">
      <div className="container pack-page">
        <header className="pack-page-header">
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
          <div className="skeleton skeleton-title" style={{ width: '240px' }} />
          <div className="skeleton" style={{ width: '140px', height: '40px', borderRadius: '100px' }} />
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', margin: '32px 0' }}>
          <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '8px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '100%', height: '72px', borderRadius: '16px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
