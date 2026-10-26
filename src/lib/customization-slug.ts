/**
 * Utility functions for humanized customization order URLs.
 * Format: [client-slug]-[6-char-token] (e.g., pablo-silva-5e9f3a)
 */

export function generateCustomizeSlug(
  clientName?: string | null,
  accessToken?: string | null
): string {
  if (!accessToken) return ''

  // Pegamos os primeiros 6 caracteres hexadecimais do access_token
  const cleanToken = accessToken.replace(/-/g, '').toLowerCase()
  const shortToken = cleanToken.slice(0, 6)

  // Geramos o slug do nome (sem acentos, minúsculo, hífens)
  const clientSlug = (clientName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return clientSlug ? `${clientSlug}-${shortToken}` : shortToken
}

export function parseCustomizeParam(param: string): {
  isUuid: boolean
  uuid?: string
  shortToken?: string
  raw: string
} {
  const raw = decodeURIComponent(param || '').trim()

  // 1. Caso seja o UUID completo (36 chars com hífen)
  const uuidMatch = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
  if (uuidMatch) {
    return { isUuid: true, uuid: uuidMatch[0].toLowerCase(), raw }
  }

  // 2. Extrai os 6 dígitos hexadecimais do final (ex: "pablo-silva-5e9f3a" -> "5e9f3a")
  const parts = raw.split('-')
  const lastPart = parts[parts.length - 1]
  if (/^[0-9a-f]{6,8}$/i.test(lastPart)) {
    return { isUuid: false, shortToken: lastPart.toLowerCase(), raw }
  }

  return { isUuid: false, raw }
}
