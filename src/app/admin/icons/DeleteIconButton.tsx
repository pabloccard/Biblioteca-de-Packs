'use client'

import { useState } from 'react'
import { deleteIconAction } from './actions'

interface Props {
  iconId: string
  imageUrl: string
}

export default function DeleteIconButton({ iconId, imageUrl }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja deletar este ícone?')) return
    setLoading(true)
    await deleteIconAction({ id: iconId, image_url: imageUrl } as any)
    setLoading(false)
  }

  return (
    <button onClick={handleDelete} className="btn-admin-action btn-delete" style={{ width: '100%', fontSize: '0.7rem' }} disabled={loading}>
      {loading ? 'Deletando...' : 'Deletar'}
    </button>
  )
}
