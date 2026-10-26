export default function DashboardLoading() {
  return (
    <div className="dashboard-page" aria-busy="true" aria-label="Carregando biblioteca">
      <div className="dashboard-container">
        {/* Header Skeleton */}
        <header className="dashboard-header">
          <div className="dashboard-header-top">
            <div className="dashboard-header-text">
              <div className="skeleton-title skeleton-shimmer" />
              <div className="skeleton-subtitle skeleton-shimmer" style={{ marginTop: '8px' }} />
            </div>

            <div className="dashboard-header-actions">
              <div className="skeleton-logout skeleton-shimmer" />
            </div>
          </div>
        </header>

        {/* Cards Grid Skeleton */}
        <main className="packs-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="dashboard-skeleton-card skeleton-shimmer">
              <div className="dashboard-skeleton-card-footer">
                <div className="dashboard-skeleton-card-title" />
                <div className="dashboard-skeleton-card-pill" />
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}
