export default function PackLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary, #0A0A0A)',
    }}>
      <div className="spinner" />
    </div>
  )
}
