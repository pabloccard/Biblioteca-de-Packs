import React from 'react'

interface LinkButtonProps {
  href: string
  label: string
  icon?: React.ReactNode
  locked?: boolean
}

export default function LinkButton({ href, label, icon, locked }: LinkButtonProps) {
  let cleanLabel = label

  let colorMatch = cleanLabel.match(/"#([a-fA-F0-9]{3,6})"/)
  if (colorMatch) cleanLabel = cleanLabel.replace(colorMatch[0], '')

  let tagMatch = cleanLabel.match(/\[(.*?)\]/)
  let tag = tagMatch ? tagMatch[1] : null
  if (tagMatch) cleanLabel = cleanLabel.replace(tagMatch[0], '')

  cleanLabel = cleanLabel.trim()

  const isCanva = tag?.toLowerCase() === 'canva' || cleanLabel.toLowerCase().includes('canva')
  const isPS = tag?.toLowerCase() === 'psd' || tag?.toLowerCase() === 'photoshop' || cleanLabel.toLowerCase().includes('psd')

  return (
    <a
      href={locked ? undefined : href}
      target={locked ? undefined : '_blank'}
      rel={locked ? undefined : 'noopener noreferrer'}
      className={`link-item ${locked ? 'locked' : ''}`}
      onClick={locked ? (e) => e.preventDefault() : undefined}
    >
      <div className="link-icon-area">
        {isCanva ? (
          <img src="/canva.png" alt="Canva" className="link-icon-img" />
        ) : isPS ? (
          <img src="/photoshop.png" alt="Photoshop" className="link-icon-img" />
        ) : icon ? (
          <div className="link-icon-generic">{icon}</div>
        ) : (
          <div className="link-icon-generic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
          </div>
        )}
      </div>
      <div className="link-text-area">
        <span className="link-title">{cleanLabel}</span>
      </div>
    </a>
  )
}
