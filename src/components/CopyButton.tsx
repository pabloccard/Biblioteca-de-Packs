'use client'

import { useState } from 'react'

interface CopyButtonProps {
  text: string
  className?: string
  label?: string
  copiedLabel?: string
}

export default function CopyButton({ text, className, label, copiedLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const btnClass = className || `copy-btn ${copied ? 'copied' : ''}`

  return (
    <button
      className={btnClass}
      onClick={handleCopy}
      type="button"
      title={copied ? (copiedLabel || 'Copiado!') : (label || 'Copiar legenda')}
    >
      {copied ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {label && <span>{copiedLabel || 'Copiado!'}</span>}
        </>
      ) : (
        <>
          <img src="/copy-icon.svg" alt="" width={18} height={18} className="copy-icon-img" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  )
}
