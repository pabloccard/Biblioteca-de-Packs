'use client'

import { useState } from 'react'
import { uploadIconAction } from './actions'

export default function UploadIconForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await uploadIconAction(formData)
    if (result?.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <form className="admin-form-grid" action={handleSubmit}>
      <div className="input-group">
        <label>Nome do Ícone *</label>
        <input type="text" name="name" className="input-field" placeholder="Ex: Photoshop" required />
      </div>
      <div className="input-group">
        <label>Imagem do Ícone (.webp, .png) *</label>
        <input type="file" name="image" className="input-field input-file" accept="image/*" required />
      </div>
      <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
        <button type="submit" className="btn-primary" style={{ height: '42px', width: '100%' }} disabled={loading}>
          {loading ? 'Fazendo Upload...' : 'Fazer Upload'}
        </button>
      </div>
      {error && <div style={{ color: 'red', gridColumn: '1 / -1' }}>{error}</div>}
    </form>
  )
}
