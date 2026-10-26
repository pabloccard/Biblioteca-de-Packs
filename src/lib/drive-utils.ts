/**
 * Client-safe utilities for Google Drive URLs and IDs
 */

export function extractDriveFolderId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId) return null
  const trimmed = urlOrId.trim()
  if (!trimmed) return null

  // If it's already an ID (no slashes, length >= 20)
  if (!trimmed.includes('/') && trimmed.length >= 20) {
    return trimmed
  }

  // If it's a URL like https://drive.google.com/drive/folders/1abc...
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  // If it's a URL like https://drive.google.com/open?id=1abc...
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) return idMatch[1]

  return null
}

export function formatFileSize(bytes: string | number | undefined): string {
  if (!bytes) return ''
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
  if (isNaN(num) || num <= 0) return ''
  if (num < 1024) return `${num} B`
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`
  return `${(num / (1024 * 1024)).toFixed(1)} MB`
}
