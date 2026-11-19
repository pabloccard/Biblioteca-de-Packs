/**
 * =======================================================================
 * CONFIGURAÇÃO CENTRAL DE ARTES E COVERS (Página de Vendas Provedor V2)
 * =======================================================================
 *
 * Todas as 24 artes do pack ficam salvas em:
 * `/public/sales-pages/provedor-v2/artes/1.webp`, `2.webp`, ..., `24.webp`
 *
 * Para configurar os 6 cards de fundo (cover) de qualquer seção, basta
 * alterar os números na lista SECTION_COVER_IDS abaixo!
 *
 * Exemplo:
 * hero: [1, 5, 6, 8, 2, 2]
 */

export type SectionBgName =
  | 'hero'
  | 'carrossel'
  | 'personalize'
  | 'ofertas'
  | 'suporte'
  | 'garantia'
  | 'edite'
  | 'faq'

/**
 * 🎨 SEGMENTAÇÃO DE ARTES DOS COVERS POR SEÇÃO:
 * Cada seção de fundo recebe 6 artes (grid de 3 colunas x 2 linhas).
 * Basta colocar os números das artes desejadas (1 a 24).
 */
export const SECTION_COVER_IDS: Record<SectionBgName, number[]> = {
  // 1. Topo (Hero)
  hero: [2, 1, 3, 4, 5, 6],

  // 2. Seção "Conheça as artes"
  carrossel: [11, 8, 13, 16, 9, 20],

  // 5. Seção "Se preferir, nós personalizamos"
  personalize: [9, 20, 17, 10, 21, 22],

  // 7. Seção "Escolha como prefere receber" (Oferta)
  ofertas: [5, 1, 16, 4, 9, 3],

  // 8. Seção "Suporte direto pelo WhatsApp"
  suporte: [2, 23, 8, 10, 21, 1],

  // Seção de garantia (se utilizada)
  garantia: [2, 4, 6, 8, 10, 12],

  // Seção "Edite onde quiser"
  edite: [9, 20, 17, 10, 21, 22],

  // Seção FAQ
  faq: [3, 6, 14, 17, 20, 22],
}

/**
 * Utilitário que converte o ID da arte (número ou string) no caminho webp correto.
 */
export function resolveArtPath(idOrPath: number | string): string {
  if (typeof idOrPath === 'number') {
    return `/sales-pages/provedor-v2/artes/${idOrPath}.webp`
  }
  if (/^\d+$/.test(idOrPath)) {
    return `/sales-pages/provedor-v2/artes/${idOrPath}.webp`
  }
  return idOrPath
}

/**
 * Mapeamento final de URLs para os fundos de cada seção.
 */
export const SECTION_BG_CARDS: Record<SectionBgName, string[]> = Object.fromEntries(
  Object.entries(SECTION_COVER_IDS).map(([section, ids]) => [
    section,
    ids.map(resolveArtPath),
  ])
) as Record<SectionBgName, string[]>

/**
 * 🎡 ARTES DO CARROSSEL INFINITO (Seção 2 - "Conheça as artes"):
 * Todas as 24 artes do pack na pasta /artes/
 */
export const CARROSSEL_ARTES_IDS: number[] = Array.from(
  { length: 24 },
  (_, i) => i + 1
)

export const CARROSSEL_ARTES: string[] = CARROSSEL_ARTES_IDS.map(resolveArtPath)

/**
 * 🌈 Capas das 12 versões de cores (Seção 3):
 */
export const VERSOES_COVERS: string[] = [
  '/sales-pages/provedor-v2/versao-cover-1.webp',
  '/sales-pages/provedor-v2/versao-cover-2.webp',
  '/sales-pages/provedor-v2/versao-cover-3.webp',
  '/sales-pages/provedor-v2/versao-cover-4.webp',
  '/sales-pages/provedor-v2/versao-cover-5.webp',
  '/sales-pages/provedor-v2/versao-cover-6.webp',
  '/sales-pages/provedor-v2/versao-cover-7.webp',
  '/sales-pages/provedor-v2/versao-cover-8.webp',
  '/sales-pages/provedor-v2/versao-cover-9.webp',
  '/sales-pages/provedor-v2/versao-cover-10.webp',
  '/sales-pages/provedor-v2/versao-cover-11.webp',
  '/sales-pages/provedor-v2/versao-cover-12.webp',
]

/**
 * 💬 Feedbacks reais de clientes (Seção 6 - 6 imagens):
 */
export const FEEDBACK_CARDS: string[] = [
  '/sales-pages/provedor-v2/feedback-1.webp',
  '/sales-pages/provedor-v2/feedback-2.webp',
  '/sales-pages/provedor-v2/feedback-3.webp',
  '/sales-pages/provedor-v2/feedback-4.webp',
  '/sales-pages/provedor-v2/feedback-5.webp',
  '/sales-pages/provedor-v2/feedback-6.webp',
]
