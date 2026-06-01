export default function DashboardLoading() {
  return (
    <div className="page-wrapper">
      <div className="container">
        <header className="dashboard-header">
          <div className="dashboard-header-top">
            <div>
              <div className="skeleton skeleton-title" style={{ width: '200px' }} />
              <div className="skeleton skeleton-text" style={{ width: '160px', marginTop: '8px' }} />
            </div>
          </div>
        </header>

        <section className="packs-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </section>
      </div>
    </div>
  )
}
