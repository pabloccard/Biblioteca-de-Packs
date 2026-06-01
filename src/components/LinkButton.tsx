interface LinkButtonProps {
  href: string
  label: string
  icon?: React.ReactNode
  locked?: boolean
}

export default function LinkButton({ href, label, icon, locked }: LinkButtonProps) {
  return (
    <a
      href={locked ? undefined : href}
      target={locked ? undefined : '_blank'}
      rel={locked ? undefined : 'noopener noreferrer'}
      className={`link-btn ${locked ? 'link-btn-locked' : ''}`}
      onClick={locked ? (e) => e.preventDefault() : undefined}
      style={locked ? { cursor: 'default', opacity: 0.6 } : undefined}
    >
      {icon && <span className="link-btn-icon">{icon}</span>}
      <span>{label}</span>
      {locked ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="link-btn-arrow">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : (
        <span className="link-btn-arrow">→</span>
      )}
    </a>
  )
}
