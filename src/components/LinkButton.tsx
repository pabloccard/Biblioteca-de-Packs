interface LinkButtonProps {
  href: string
  label: string
  icon?: React.ReactNode
  locked?: boolean
}

export default function LinkButton({ href, label, icon, locked }: LinkButtonProps) {
  // Parse label: extracts "#COLOR" (ignored now) and [tag]
  let cleanLabel = label

  // Remove color markers (no longer used visually)
  let colorMatch = cleanLabel.match(/"#([a-fA-F0-9]{3,6})"/)
  if (colorMatch) {
    cleanLabel = cleanLabel.replace(colorMatch[0], '')
  }

  // Extract tag e.g. [Canva]
  let tagMatch = cleanLabel.match(/\[(.*?)\]/)
  let tag = tagMatch ? tagMatch[1] : null
  if (tagMatch) {
    cleanLabel = cleanLabel.replace(tagMatch[0], '')
  }

  cleanLabel = cleanLabel.trim()

  return (
    <a
      href={locked ? undefined : href}
      target={locked ? undefined : '_blank'}
      rel={locked ? undefined : 'noopener noreferrer'}
      className={`link-btn ${locked ? 'link-btn-locked' : ''}`}
      onClick={locked ? (e) => e.preventDefault() : undefined}
      style={locked ? { cursor: 'default', opacity: 0.5 } : {}}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        {icon && <span className="link-btn-icon">{icon}</span>}

        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflow: 'hidden',
          flex: 1
        }}>
          {tag && (
            <span style={{
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '2px 7px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}>
              {tag}
            </span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cleanLabel}</span>
        </span>
      </div>
      {locked ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="link-btn-arrow" style={{ flexShrink: 0 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : (
        <span className="link-btn-arrow" style={{ flexShrink: 0 }}>→</span>
      )}
    </a>
  )
}
