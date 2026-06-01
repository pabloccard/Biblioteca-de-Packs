"use client"

import { deletePackAction } from './actions'

interface DeletePackFormProps {
  packId: string
  packName: string
}

export default function DeletePackForm({ packId, packName }: DeletePackFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const userInput = prompt(`Para excluir este pack, digite o nome exato dele para confirmar:\n"${packName}"`)
    
    if (userInput !== packName) {
      e.preventDefault() // Cancela o envio do formulário
      if (userInput !== null) {
        alert("Nome incorreto. O pack não foi excluído.")
      }
    }
  }

  return (
    <form action={deletePackAction} onSubmit={handleSubmit}>
      <input type="hidden" name="pack_id" value={packId} />
      <button type="submit" className="btn-admin-action btn-delete">Excluir</button>
    </form>
  )
}
