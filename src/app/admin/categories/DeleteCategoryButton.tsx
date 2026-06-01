'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCategoryAction } from '../actions'

interface Props {
  categoryId: string
  categoryName: string
}

export default function DeleteCategoryButton({ categoryId, categoryName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"? Todos os packs com essa categoria ficarão com a categoria vazia.`)) {
      return
    }

    setLoading(true)
    
    const formData = new FormData()
    formData.append('category_id', categoryId)
    
    await deleteCategoryAction(formData)
    router.refresh()
    setLoading(false)
  }

  return (
    <button 
      onClick={handleDelete} 
      className="btn-admin-action btn-delete"
      disabled={loading}
      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
    >
      {loading ? 'Excluindo...' : 'Excluir'}
    </button>
  )
}
