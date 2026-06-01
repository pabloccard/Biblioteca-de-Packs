'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategoryAction } from '../actions'

export default function CategoryForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const res = await createCategoryAction(formData)
    
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.refresh()
      setLoading(false)
      // Limpar o formulário
      const form = document.getElementById('category-form') as HTMLFormElement
      if (form) form.reset()
    }
  }

  return (
    <form id="category-form" action={handleSubmit} className="admin-form-grid" style={{ maxWidth: '600px' }}>
      {error && <div className="admin-error-message">{error}</div>}
      
      <div className="input-group">
        <label>Nome da Categoria *</label>
        <input name="name" type="text" className="input-field" required placeholder="Ex: Social Media" />
      </div>
      
      <div className="input-group">
        <label>Tag Interna *</label>
        <input name="tag" type="text" className="input-field" required placeholder="Ex: social-media" />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Identificador único sem espaços ou acentos.</p>
      </div>
      
      <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
        <button type="submit" className="btn-admin-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Salvando...' : '+ Criar Categoria'}
        </button>
      </div>
    </form>
  )
}
