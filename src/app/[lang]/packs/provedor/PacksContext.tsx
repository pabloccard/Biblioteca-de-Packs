'use client'

import React, { createContext, useContext } from 'react'
import {
  CARROSSEL_ARTES_IDS,
  CARROSSEL_ARTES,
  SECTION_COVER_IDS,
  SECTION_BG_CARDS,
  VERSOES_COVERS,
  FEEDBACK_CARDS,
  SectionBgName,
} from './cardsConfig'
import { ProvedorContent, getProvedorContent } from './i18n'

interface PacksThemeConfig {
  theme?: string
  lang?: string
  artesFolder?: string
  mockupSrc?: string
  facilEdicaoScreenshot?: string
  suporteBanner?: string
  autoralBg?: string
  carrosselArtes?: string[]
  sectionBgCards?: Record<SectionBgName, string[]>
  versoesCovers?: string[]
  feedbackCards?: string[]
  content: ProvedorContent
}

const defaultContent = getProvedorContent('pt')

const PacksContext = createContext<PacksThemeConfig>({
  theme: 'green',
  lang: 'pt',
  artesFolder: '/sales-pages/provedor-v2/artes',
  mockupSrc: '/sales-pages/provedor-v2/mockup.webp',
  facilEdicaoScreenshot: '/sales-pages/provedor-v2/facil-edicao-screenshot.webp',
  suporteBanner: '/sales-pages/provedor-v2/suporte-banner.webp',
  autoralBg: '/sales-pages/provedor-v2/autoral-bg.webp',
  carrosselArtes: CARROSSEL_ARTES,
  sectionBgCards: SECTION_BG_CARDS,
  versoesCovers: VERSOES_COVERS,
  feedbackCards: FEEDBACK_CARDS,
  content: defaultContent,
})

export function PacksProvider({
  children,
  lang = 'pt',
  artesFolder,
  theme = 'green',
  mockupSrc,
  facilEdicaoScreenshot,
  suporteBanner,
  autoralBg,
  cacheBust = true,
}: {
  children: React.ReactNode
  lang?: string
  artesFolder?: string
  theme?: string
  mockupSrc?: string
  facilEdicaoScreenshot?: string
  suporteBanner?: string
  autoralBg?: string
  cacheBust?: boolean
}) {
  const isEs = lang === 'es'
  const defaultArtesFolder = isEs
    ? (theme && theme !== 'green'
        ? `/sales-pages/provedor-v2-es/artes-${theme}`
        : '/sales-pages/provedor-v2-es/artes')
    : (theme && theme !== 'green' && theme !== 'verde'
        ? `/sales-pages/provedor-v2/artes-${theme}`
        : '/sales-pages/provedor-v2/artes')
  const resolvedArtesFolder = artesFolder || defaultArtesFolder
  const content = getProvedorContent(lang)

  // Query param para garantir que novas imagens nunca fiquem presas em cache do navegador
  const query = cacheBust ? `?v=${theme}-${lang}` : ''

  // 1. Mockup principal (.webp)
  const defaultMockup = isEs
    ? (theme === 'vermelho'
        ? '/sales-pages/provedor-v2-es/mockup-vermelho.webp'
        : theme === 'laranja'
          ? '/sales-pages/provedor-v2-es/mockup-laranja.webp'
          : theme === 'roxo'
            ? '/sales-pages/provedor-v2-es/mockup-roxo.webp'
            : theme === 'azul'
              ? '/sales-pages/provedor-v2-es/mockup-azul.webp'
              : theme === 'amarelo'
                ? '/sales-pages/provedor-v2-es/mockup-amarelo.webp'
                : theme === 'verde'
                  ? '/sales-pages/provedor-v2-es/mockup-verde.webp'
                  : theme === 'azul-laranja'
                    ? '/sales-pages/provedor-v2-es/mockup-azul-laranja.webp'
                    : '/sales-pages/provedor-v2-es/mockup.webp')
    : theme === 'vermelho'
      ? '/sales-pages/provedor-v2/mockup-vermelho.webp'
      : theme === 'laranja'
        ? '/sales-pages/provedor-v2/mockup-laranja.webp'
        : theme === 'roxo'
          ? '/sales-pages/provedor-v2/mockup-roxo.webp'
          : theme === 'azul'
            ? '/sales-pages/provedor-v2/mockup-azul.webp'
            : theme === 'amarelo'
              ? '/sales-pages/provedor-v2/mockup-amarelo.webp'
              : theme === 'verde'
                ? '/sales-pages/provedor-v2/mockup-verde.webp'
                : theme === 'azul-laranja'
                  ? '/sales-pages/provedor-v2/mockup-azul-laranja.webp'
                  : '/sales-pages/provedor-v2/mockup.webp'

  const resolvedMockup = `${mockupSrc || defaultMockup}${query}`

  // 2. Fácil Edição Screenshot (.webp)
  const resolvedFacilEdicao = `${
    facilEdicaoScreenshot ||
    (isEs
      ? '/sales-pages/provedor-v2-es/facil-edicao-screenshot.webp'
      : '/sales-pages/provedor-v2/facil-edicao-screenshot.webp')
  }${query}`

  // 3. Suporte Banner (.webp)
  const resolvedSuporte = `${
    suporteBanner ||
    (isEs
      ? '/sales-pages/provedor-v2-es/suporte-banner.webp'
      : '/sales-pages/provedor-v2/suporte-banner.webp')
  }${query}`

  // 4. Autoral (Fundo/Rosto do Pablo) (.webp)
  const resolvedAutoralBg = `${
    autoralBg ||
    (isEs
      ? '/sales-pages/provedor-v2-es/autoral-bg.webp'
      : '/sales-pages/provedor-v2/autoral-bg.webp')
  }${query}`

  // 5. Capas das versões de cores (13 versões no ES, 12 versões no PT)
  const versoesCovers = isEs
    ? Array.from({ length: 13 }, (_, i) => `/sales-pages/provedor-v2-es/versao-cover-${i + 1}.webp${query}`)
    : VERSOES_COVERS.map((src) => `${src}${query}`)

  // 6. Feedbacks (5 feedbacks no ES, 6 feedbacks no PT)
  const feedbackCards = isEs
    ? Array.from({ length: 5 }, (_, i) => `/sales-pages/provedor-v2-es/feedbacks/feedback-${i + 1}.webp${query}`)
    : FEEDBACK_CARDS.map((src) => `${src}${query}`)

  // Carrossel de 24 artes respeitando o CARROSSEL_ARTES_IDS de cardsConfig.ts
  const carrosselArtes = CARROSSEL_ARTES_IDS.map(
    (id) => `${resolvedArtesFolder}/${id}.webp${query}`
  )

  // Mapeia os mesmos IDs configurados no SECTION_COVER_IDS do cardsConfig.ts
  const sectionBgCards: Record<SectionBgName, string[]> = Object.fromEntries(
    Object.entries(SECTION_COVER_IDS).map(([section, ids]) => [
      section,
      ids.map((id) => `${resolvedArtesFolder}/${id}.webp${query}`),
    ])
  ) as Record<SectionBgName, string[]>

  return (
    <PacksContext.Provider
      value={{
        theme,
        lang,
        artesFolder: resolvedArtesFolder,
        mockupSrc: resolvedMockup,
        facilEdicaoScreenshot: resolvedFacilEdicao,
        suporteBanner: resolvedSuporte,
        autoralBg: resolvedAutoralBg,
        carrosselArtes,
        sectionBgCards,
        versoesCovers,
        feedbackCards,
        content,
      }}
    >
      {children}
    </PacksContext.Provider>
  )
}

export function usePacksContext() {
  return useContext(PacksContext)
}
