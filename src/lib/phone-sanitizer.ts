/**
 * Phone Sanitizer & Normalizer for WhatsApp CRM
 * Specifically crafted for Hotmart export quirks (leading apostrophes, '(nome)', missing DDIs, international buyers)
 */

/**
 * Detect niche from pack name and categories
 */
export function detectPackNiche(packName: string, categoryTag?: string | null): string {
  const norm = (packName || '').toLowerCase()
  const cat = (categoryTag || '').toLowerCase()

  if (cat.includes('hamburg') || norm.includes('hamburg') || norm.includes('burger')) {
    return 'hamburgueria'
  }
  if (
    cat.includes('provedor') ||
    cat.includes('proveedor') ||
    norm.includes('provedor') ||
    norm.includes('proveedor') ||
    norm.includes('internet') ||
    norm.includes('fibra') ||
    /\bisp\b/.test(norm)
  ) {
    return 'provedor'
  }
  return 'geral'
}

/**
 * Format first name with Title Case for WhatsApp messages
 * e.g. "CARLOS SILVA" -> "Carlos", "joão" -> "João", "MARIA" -> "Maria"
 */
export function formatFirstName(fullName?: string | null): string {
  if (!fullName) return 'amigo(a)'
  const clean = fullName.trim()
  if (!clean) return 'amigo(a)'

  // Pega apenas a primeira palavra
  const firstWord = clean.split(/\s+/)[0]
  if (!firstWord) return 'amigo(a)'

  // Primeira letra em maiúscula, restante em minúscula
  return firstWord.charAt(0).toLocaleUpperCase('pt-BR') + firstWord.slice(1).toLocaleLowerCase('pt-BR')
}

const COUNTRY_DDI_MAP: Record<string, string> = {
  // Brasil
  brasil: '55',
  brazil: '55',
  br: '55',

  // América Latina
  mexico: '52',
  méxico: '52',
  mx: '52',
  colombia: '57',
  colômbia: '57',
  co: '57',
  argentina: '54',
  ar: '54',
  chile: '56',
  cl: '56',
  peru: '51',
  pe: '51',
  uruguai: '598',
  uruguay: '598',
  uy: '598',
  paraguai: '595',
  paraguay: '595',
  py: '595',
  bolivia: '591',
  bolívia: '591',
  bo: '591',
  equador: '593',
  ecuador: '593',
  ec: '593',
  venezuela: '58',
  ve: '58',
  panama: '507',
  panamá: '507',
  pa: '507',
  costa_rica: '506',
  'costa rica': '506',
  cr: '506',
  guatemala: '502',
  gt: '502',
  honduras: '504',
  hn: '504',
  el_salvador: '503',
  'el salvador': '503',
  sv: '503',
  nicaragua: '505',
  ni: '505',
  republica_dominicana: '1809',
  'republica dominicana': '1809',
  'república dominicana': '1809',
  'dominican republic': '1809',
  do: '1809',
  'puerto rico': '1',
  'porto rico': '1',
  pr: '1',
  cuba: '53',
  cu: '53',

  // Europa & África & Outros
  espanha: '34',
  espana: '34',
  españa: '34',
  spain: '34',
  es: '34',
  portugal: '351',
  pt: '351',
  franca: '33',
  frança: '33',
  france: '33',
  fr: '33',
  italia: '39',
  itália: '39',
  italy: '39',
  it: '39',
  alemanha: '49',
  germany: '49',
  de: '49',
  reino_unido: '44',
  'reino unido': '44',
  'united kingdom': '44',
  uk: '44',
  gb: '44',
  suica: '41',
  suiça: '41',
  suiza: '41',
  switzerland: '41',
  ch: '41',
  belgica: '32',
  bélgica: '32',
  belgium: '32',
  be: '32',
  holanda: '31',
  'paises baixos': '31',
  netherlands: '31',
  nl: '31',
  irlanda: '353',
  ireland: '353',
  ie: '353',
  angola: '244',
  ao: '244',
  mocambique: '258',
  moçambique: '258',
  mozambique: '258',
  mz: '258',
  australia: '61',
  austrália: '61',
  au: '61',

  // América do Norte
  'estados unidos': '1',
  'united states': '1',
  usa: '1',
  us: '1',
  canada: '1',
  canadá: '1',
  ca: '1',
}

export interface SanitizeResult {
  isValid: boolean
  cleanPhone: string | null
  formatted: string | null
  countryDdi: string | null
  reason?: string
}

/**
 * Normalizes country string to DDI
 */
export function getDdiFromCountry(countryRaw?: string | null): string | null {
  if (!countryRaw) return null
  const normalized = countryRaw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos

  return COUNTRY_DDI_MAP[normalized] || COUNTRY_DDI_MAP[countryRaw.trim().toLowerCase()] || null
}

/**
 * Sanitizes and standardizes a phone number for WhatsApp
 */
export function sanitizePhoneNumber(
  rawInput: string | number | null | undefined,
  countryRaw?: string | null
): SanitizeResult {
  if (rawInput === null || rawInput === undefined) {
    return { isValid: false, cleanPhone: null, formatted: null, countryDdi: null, reason: 'Vazio' }
  }

  let str = String(rawInput).trim()

  // Remove leading single quote from Excel (e.g. '33998334306)
  if (str.startsWith("'") || str.startsWith('"')) {
    str = str.replace(/^['"]+/, '').trim()
  }

  // Check if it's purely text/placeholder (no meaningful digits)
  if (/^[a-zA-Z\s()\-_]+$/.test(str) || str === '-' || str === '') {
    return { isValid: false, cleanPhone: null, formatted: null, countryDdi: null, reason: 'Contém apenas texto ou placeholder' }
  }

  // Strip all non-numeric digits
  const digits = str.replace(/\D/g, '')

  if (!digits || digits.length < 8) {
    return { isValid: false, cleanPhone: null, formatted: null, countryDdi: null, reason: 'Número muito curto (< 8 dígitos)' }
  }

  const detectedDdi = getDdiFromCountry(countryRaw)

  let cleanPhone = digits

  // BRAZIL LOGIC
  // If country is Brazil OR no country specified but looks like Brazilian phone (10 or 11 digits)
  const isBrazil = detectedDdi === '55' || (!detectedDdi && (digits.length === 10 || digits.length === 11))

  if (isBrazil) {
    // Strip leading trunk '0' from formats like 011999998888 (12 digits) or 01199998888 (11 digits)
    if (!cleanPhone.startsWith('55') && cleanPhone.startsWith('0') && (cleanPhone.length === 11 || cleanPhone.length === 12)) {
      cleanPhone = cleanPhone.slice(1)
    }

    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      // Missing country code 55 -> add 55
      cleanPhone = `55${cleanPhone}`
    }
  } else if (detectedDdi) {
    // International logic with detected country DDI
    if (!cleanPhone.startsWith(detectedDdi)) {
      // Remove leading zero if present in national format (e.g. 0X...)
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.slice(1)
      }
      cleanPhone = `${detectedDdi}${cleanPhone}`
    }
  }

  // Final length sanity check (E.164: 8 to 15 digits)
  if (cleanPhone.length < 9 || cleanPhone.length > 16) {
    return {
      isValid: false,
      cleanPhone,
      formatted: formatDisplayPhone(cleanPhone),
      countryDdi: detectedDdi,
      reason: `Tamanho inválido (${cleanPhone.length} dígitos)`,
    }
  }

  return {
    isValid: true,
    cleanPhone,
    formatted: formatDisplayPhone(cleanPhone),
    countryDdi: detectedDdi || (cleanPhone.startsWith('55') ? '55' : null),
  }
}

/**
 * Format clean phone for visual display (e.g. +55 (33) 99833-4306)
 */
export function formatDisplayPhone(phone: string): string {
  if (!phone) return ''

  // Brazil format: 55 + 2 DDD + 9 digits or 8 digits
  if (phone.startsWith('55') && (phone.length === 12 || phone.length === 13)) {
    const ddd = phone.slice(2, 4)
    const number = phone.slice(4)
    if (number.length === 9) {
      return `+55 (${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`
    }
    return `+55 (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`
  }

  return `+${phone}`
}
