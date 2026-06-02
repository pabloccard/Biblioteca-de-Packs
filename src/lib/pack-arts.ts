import fs from 'fs'
import path from 'path'

export interface LocalArt {
  number: number
  imageUrl: string
  caption: string
}

/**
 * Escaneia a pasta local e retorna as artes encontradas com suas legendas.
 * @param artsFolder - Caminho relativo a public/ (ex: "packs/meu-pack")
 * @param artCaptions - Objeto com legendas por número (ex: {"1": "Legenda 1", "2": "Legenda 2"})
 */
export function getLocalArts(artsFolder: string | null, artCaptions: Record<string, string> | null): LocalArt[] {
  if (!artsFolder) return []

  const fullPath = path.join(process.cwd(), 'public', artsFolder)
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) return []

  const files = fs.readdirSync(fullPath)
  const arts: LocalArt[] = []
  const captions = artCaptions || {}

  for (const file of files) {
    const match = file.toLowerCase().match(/^(\d+)\.webp$/)
    if (match) {
      const num = parseInt(match[1], 10)
      arts.push({
        number: num,
        imageUrl: `/${artsFolder}/${num}.webp`,
        caption: captions[String(num)] || '',
      })
    }
  }

  return arts.sort((a, b) => a.number - b.number)
}

/**
 * Retorna a quantidade de artes na pasta local.
 */
export function getLocalArtCount(artsFolder: string | null): number {
  if (!artsFolder) return 0
  return getLocalArts(artsFolder, null).length
}

/**
 * Verifica se a capa existe na pasta local.
 */
export function hasLocalCover(artsFolder: string | null): boolean {
  if (!artsFolder) return false
  const capaPath = path.join(process.cwd(), 'public', artsFolder, 'card.webp')
  return fs.existsSync(capaPath)
}
