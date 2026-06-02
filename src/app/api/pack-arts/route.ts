import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const folder = request.nextUrl.searchParams.get('folder')

  if (!folder) {
    return NextResponse.json({ error: 'Parâmetro "folder" é obrigatório.' }, { status: 400 })
  }

  // Segurança: impedir path traversal
  const normalized = path.normalize(folder).replace(/^(\.\.[/\\])+/, '')
  if (normalized.includes('..') || normalized.startsWith('/') || normalized.startsWith('\\')) {
    return NextResponse.json({ error: 'Caminho inválido.' }, { status: 400 })
  }

  const fullPath = path.join(process.cwd(), 'public', normalized)

  // Verificar se a pasta existe
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
    return NextResponse.json({ error: 'Pasta não encontrada.', path: fullPath }, { status: 404 })
  }

  try {
    const files = fs.readdirSync(fullPath)

    // Encontrar arquivos numerados .webp (1.webp, 2.webp, etc.)
    const artNumbers: number[] = []
    let hasCover = false

    for (const file of files) {
      const lower = file.toLowerCase()
      if (lower === 'card.webp' || lower === 'cover.webp') {
        hasCover = true
        continue
      }
      // Match numerados: 1.webp, 2.webp, 10.webp, etc.
      const match = lower.match(/^(\d+)\.webp$/)
      if (match) {
        artNumbers.push(parseInt(match[1], 10))
      }
    }

    // Ordenar numericamente
    artNumbers.sort((a, b) => a - b)

    return NextResponse.json({
      folder: normalized,
      hasCover,
      artNumbers,
      total: artNumbers.length,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao ler a pasta.' }, { status: 500 })
  }
}
