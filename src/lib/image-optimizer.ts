/**
 * Utilitário para otimização de imagens de amostra de packs no navegador (client-side)
 * antes do upload para o Google Drive.
 */

export interface OptimizedArt {
  file: File
  originalName: string
  originalSize: number
  optimizedSize: number
  width: number
  height: number
}

/**
 * Redimensiona a imagem preservando a escala original (1.0 = 100% da resolução original)
 * e compacta para WebP com a qualidade especificada (padrão 0.5 = 50%).
 */
export async function optimizePackArt(
  file: File,
  scale: number = 1.0,
  quality: number = 0.5
): Promise<OptimizedArt> {
  // Se não for imagem suportada, retorna o arquivo original
  if (!file.type.startsWith('image/')) {
    return {
      file,
      originalName: file.name,
      originalSize: file.size,
      optimizedSize: file.size,
      width: 0,
      height: 0,
    }
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      try {
        const targetWidth = Math.max(1, Math.round(img.naturalWidth * scale))
        const targetHeight = Math.max(1, Math.round(img.naturalHeight * scale))

        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          // Fallback se não conseguir contexto 2D
          resolve({
            file,
            originalName: file.name,
            originalSize: file.size,
            optimizedSize: file.size,
            width: img.naturalWidth,
            height: img.naturalHeight,
          })
          return
        }

        // Suavização em alta qualidade para downscaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                originalName: file.name,
                originalSize: file.size,
                optimizedSize: file.size,
                width: targetWidth,
                height: targetHeight,
              })
              return
            }

            // Altera a extensão para .webp mantendo o nome base
            const baseName = file.name.replace(/\.[^.]+$/, '')
            const newName = `${baseName}.webp`
            const optimizedFile = new File([blob], newName, {
              type: 'image/webp',
              lastModified: Date.now(),
            })

            resolve({
              file: optimizedFile,
              originalName: file.name,
              originalSize: file.size,
              optimizedSize: optimizedFile.size,
              width: targetWidth,
              height: targetHeight,
            })
          },
          'image/webp',
          quality
        )
      } catch (err) {
        console.warn('Erro ao processar imagem no Canvas:', err)
        resolve({
          file,
          originalName: file.name,
          originalSize: file.size,
          optimizedSize: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      // Se falhar ao carregar no Image, devolve o arquivo original
      resolve({
        file,
        originalName: file.name,
        originalSize: file.size,
        optimizedSize: file.size,
        width: 0,
        height: 0,
      })
    }

    img.src = objectUrl
  })
}

/**
 * Ordena os arquivos numericamente pelo nome (1.png, 2.png, ..., 40.png)
 */
export function sortFilesNaturally<T extends { name: string }>(files: T[]): T[] {
  return [...files].sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10)
    const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10)
    if (numA && numB && numA !== numB) return numA - numB
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  })
}
