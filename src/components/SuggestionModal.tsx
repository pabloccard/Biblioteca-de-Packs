'use client'

import { useState, useEffect, useCallback } from 'react'
import { submitSuggestionAction } from '@/app/[lang]/suggestions/actions'

interface Props {
  isOpen: boolean
  onClose: () => void
  lang?: string
}

export default function SuggestionModal({ isOpen, onClose, lang = 'pt' }: Props) {
  const [niche, setNiche] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setNiche('')
      setMessage('')
      setSent(false)
      setError(null)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) {
      setError(lang === 'en' ? 'Write your suggestion before sending.' : lang === 'es' ? 'Escribe tu sugerencia antes de enviar.' : 'Escreva sua sugestão antes de enviar.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await submitSuggestionAction({ niche, message })
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }, [niche, message])

  if (!isOpen) return null

  const t = lang === 'en' ? {
    emptyError: 'Write your suggestion before sending.',
    successTitle: 'Feedback sent!',
    successDesc: 'Thank you for your feedback. We will gladly analyze your suggestion. 💙',
    close: 'Close',
    title: 'Send feedback',
    desc: 'Suggest a new template pack, a specific template, or any improvement.',
    nicheLabel: 'Niche / Category',
    optional: '(optional)',
    nichePlaceholder: 'e.g. Barbershop, Beauty, Fitness...',
    suggestionLabel: 'Your suggestion *',
    suggestionPlaceholder: 'Tell us what you’d like to see. A new template pack? A specific template? An improvement?',
    sending: 'Sending...',
    sendBtn: 'Send feedback'
  } : lang === 'es' ? {
    emptyError: 'Escribe tu sugerencia antes de enviar.',
    successTitle: '¡Sugerencia enviada!',
    successDesc: 'Gracias por tus comentarios. Analizaremos tu sugerencia con mucho gusto. 💙',
    close: 'Cerrar',
    title: 'Enviar Sugerencia',
    desc: 'Sugiere un nuevo pack, un diseño específico o cualquier mejora.',
    nicheLabel: 'Nicho / Categoría',
    optional: '(opcional)',
    nichePlaceholder: 'Ej: Barbería, Estética, Fitness...',
    suggestionLabel: 'Tu sugerencia *',
    suggestionPlaceholder: 'Describe lo que te gustaría ver... ¿Un nuevo pack? ¿Un diseño específico? ¿Una mejora?',
    sending: 'Enviando...',
    sendBtn: 'Enviar Sugerencia'
  } : {
    emptyError: 'Escreva sua sugestão antes de enviar.',
    successTitle: 'Sugestão enviada!',
    successDesc: 'Obrigado pelo feedback. Vamos analisar sua sugestão com carinho! 💙',
    close: 'Fechar',
    title: 'Enviar Sugestão',
    desc: 'Sugira um novo pack, uma arte específica ou qualquer melhoria.',
    nicheLabel: 'Nicho / Categoria',
    optional: '(opcional)',
    nichePlaceholder: 'Ex: Barbearia, Estética, Fitness...',
    suggestionLabel: 'Sua sugestão *',
    suggestionPlaceholder: 'Descreva o que você gostaria de ver... Um novo pack? Uma arte específica? Uma melhoria?',
    sending: 'Enviando...',
    sendBtn: 'Enviar Sugestão'
  }

  return (
    <div className="suggestion-overlay" onClick={onClose}>
      <div className="suggestion-modal" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="suggestion-close" onClick={onClose} aria-label="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {sent ? (
          <div className="suggestion-success">
            <div className="suggestion-success-icon">✓</div>
            <h3>{t.successTitle}</h3>
            <p>{t.successDesc}</p>
            <button className="btn-suggest-send" onClick={onClose}>{t.close}</button>
          </div>
        ) : (
          <>
            <div className="suggestion-header">
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>

            <div className="suggestion-body">
              <div className="suggestion-field">
                <label>{t.nicheLabel} <span className="suggestion-optional">{t.optional}</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={t.nichePlaceholder}
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                />
              </div>

              <div className="suggestion-field">
                <label>{t.suggestionLabel}</label>
                <textarea
                  className="input-field input-textarea"
                  placeholder={t.suggestionPlaceholder}
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              {error && <p className="suggestion-error">{error}</p>}

              <button
                className="btn-suggest-send"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? t.sending : t.sendBtn}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
