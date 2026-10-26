import { NextRequest, NextResponse } from 'next/server'
import { deleteDriveFile } from '@/lib/google-drive'

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: 'fileId é obrigatório' }, { status: 400 })
    }

    await deleteDriveFile(fileId)

    // Revalidar cache de artes
    try {
      const { revalidateTag } = await import('next/cache')
      revalidateTag('drive-arts', 'default')
    } catch (e) {
      // Ignora erro se não estiver em contexto de cache
    }

    return NextResponse.json({ success: true, message: 'Arquivo excluído do Google Drive com sucesso.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
