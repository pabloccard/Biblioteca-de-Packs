'use client'

import { useState } from 'react'
import SuggestionModal from '@/components/SuggestionModal'

export default function SuggestionButton({ lang = 'pt' }: { lang?: string }) {
  const [open, setOpen] = useState(false)

  const text = lang === 'en' 
    ? 'Send feedback'
    : lang === 'es' 
      ? 'Enviar sugerencia' 
      : 'Enviar sugestão'

  return (
    <>
      <button className="btn-suggest" onClick={() => setOpen(true)}>
        {text}
      </button>
      <SuggestionModal isOpen={open} onClose={() => setOpen(false)} lang={lang} />
    </>
  )
}
