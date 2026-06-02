interface LinkButtonProps {
  href: string
  label: string
  icon?: React.ReactNode
  locked?: boolean
}

export default function LinkButton({ href, label, icon, locked }: LinkButtonProps) {
  // Parsing "gambiarra" style: extracts "#COLOR" and [tag]
  let cleanLabel = label
  
  // Extract color e.g. "#FF0000" or "#f00"
  let colorMatch = cleanLabel.match(/"#([a-fA-F0-9]{3,6})"/)
  let color = colorMatch ? `#${colorMatch[1]}` : null
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
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...(locked ? { cursor: 'default', opacity: 0.6 } : {})
      }}
    >
      {color && (
        <div 
          style={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}`
          }} 
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        {icon && <span className="link-btn-icon">{icon}</span>}
        
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          flex: 1
        }}>
          {tag && (
            <span style={{ 
              fontSize: '0.65rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: 'var(--text-muted)',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
              transform: 'scale(0.8)',
              transformOrigin: 'center'
            }}>
              {tag}
            </span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cleanLabel}</span>
        </span>
      </div>
      {locked ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="link-btn-arrow" style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : (
        <span className="link-btn-arrow" style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>→</span>
      )}
    </a>
  )
}
