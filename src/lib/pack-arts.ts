import fs from 'fs'
import path from 'path'
import { listDriveFiles, DriveFile } from './google-drive'
import { unstable_cache } from 'next/cache'

export interface PackArt {
  id: string
  number: number
  imageUrl: string
  caption: string
  name: string
}

export interface LocalArt {
  number: number
  imageUrl: string
  caption: string
}

export interface PackArtsSource {
  drive_arts_folder_id?: string | null
  arts_folder?: string | null
  art_captions?: Record<string, string> | null
}

/**
 * Busca em cache os arquivos de imagem de uma pasta do Google Drive
 */
export const getCachedDriveFiles = unstable_cache(
  async (folderId: string): Promise<DriveFile[]> => {
    try {
      const files = await listDriveFiles(folderId)
      return files
        .filter(f => f.mimeType.startsWith('image/') || f.name.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i))
        .sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10)
          const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10)
          if (numA && numB) return numA - numB
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        })
    } catch (e) {
      console.error(`Erro ao carregar arquivos da pasta do Drive (${folderId}):`, e)
      return []
    }
  },
  ['drive-pack-arts-files'],
  { revalidate: 300, tags: ['drive-arts'] }
)

/**
 * Retorna as artes de um pack (prioriza Google Drive com fallback para pasta local e legendas do banco).
 */
export async function getPackArts(pack: PackArtsSource | null | undefined): Promise<PackArt[]> {
  if (!pack) return []

  // 1. Google Drive se a pasta estiver configurada
  if (pack.drive_arts_folder_id) {
    const driveFiles = await getCachedDriveFiles(pack.drive_arts_folder_id)
    const localCount = getLocalArtCount(pack.arts_folder || null)

    // Se o Drive tiver arquivos e for pelo menos tão completo quanto a pasta local
    if (driveFiles.length > 0 && (driveFiles.length >= localCount || !pack.arts_folder)) {
      const captions = pack.art_captions || {}
      return driveFiles.map((file, idx) => {
        const numMatch = file.name.match(/^(\d+)/) || file.name.match(/(\d+)/)
        const fileNum = numMatch ? parseInt(numMatch[1], 10) : idx + 1
        const imageUrl = file.thumbnailLink
          ? file.thumbnailLink.replace(/=s\d+$/, '=s800')
          : `/api/drive/proxy-thumbnail?fileId=${file.id}`

        const cleanBaseName = file.name.replace(/\.[^.]+$/, '')
        const caption =
          captions[String(fileNum)] ||
          captions[cleanBaseName] ||
          captions[file.name] ||
          captions[String(idx + 1)] ||
          ''

        return {
          id: file.id,
          number: fileNum,
          name: file.name,
          imageUrl,
          caption,
        }
      })
    }
  }

  // 2. Fallback: Pasta local legada em public/
  if (pack.arts_folder) {
    const local = getLocalArts(pack.arts_folder, pack.art_captions || null)
    if (local.length > 0) {
      return local.map(a => ({
        id: String(a.number),
        number: a.number,
        name: `${a.number}.webp`,
        imageUrl: a.imageUrl,
        caption: a.caption,
      }))
    }
  }

  // 3. Fallback: Se não tem arquivos físicos carregados mas tem art_captions no banco
  if (pack.art_captions && Object.keys(pack.art_captions).length > 0) {
    const nums = Object.keys(pack.art_captions)
      .map(k => parseInt(k, 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b)

    if (nums.length > 0) {
      return nums.map(num => ({
        id: String(num),
        number: num,
        name: `${num}.webp`,
        imageUrl: pack.arts_folder ? `/${pack.arts_folder}/${num}.webp` : '',
        caption: pack.art_captions![String(num)] || '',
      }))
    }
  }

  return []
}

/**
 * Retorna a quantidade de artes de um pack (Drive ou local)
 */
export async function getPackArtCount(pack: PackArtsSource | null | undefined): Promise<number> {
  if (!pack) return 0
  const arts = await getPackArts(pack)
  return arts.length
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
