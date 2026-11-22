'use client'

import React, { createContext, useContext } from 'react'
import {
  CARROSSEL_ARTES_IDS,
  CARROSSEL_ARTES,
  SECTION_COVER_IDS,
  SECTION_BG_CARDS,
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
  carrosselArtes?: string[]
  sectionBgCards?: Record<SectionBgName, string[]>
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
  carrosselArtes: CARROSSEL_ARTES,
  sectionBgCards: SECTION_BG_CARDS,
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
  cacheBust = true,
}: {
  children: React.ReactNode
  lang?: string
  artesFolder?: string
  theme?: string
  mockupSrc?: string
  facilEdicaoScreenshot?: string
  suporteBanner?: string
  cacheBust?: boolean
}) {
  const isEs = lang === 'es'
  const resolvedArtesFolder =
    artesFolder || (isEs ? '/sales-pages/provedor-v2-es/artes' : '/sales-pages/provedor-v2/artes')
  const content = getProvedorContent(lang)

  // Query param para garantir que novas imagens nunca fiquem presas em cache do navegador
  const query = cacheBust ? `?v=${theme}-${lang}` : ''

  const defaultMockup = isEs
    ? '/sales-pages/provedor-v2-es/mockup.webp'
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
  const resolvedFacilEdicao = `${
    facilEdicaoScreenshot ||
    (isEs
      ? '/sales-pages/provedor-v2-es/facil-edicao-screenshot.webp'
      : '/sales-pages/provedor-v2/facil-edicao-screenshot.webp')
  }${query}`
  const resolvedSuporte = `${
    suporteBanner ||
    (isEs
      ? '/sales-pages/provedor-v2-es/suporte-banner.webp'
      : '/sales-pages/provedor-v2/suporte-banner.webp')
  }${query}`

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
        carrosselArtes,
        sectionBgCards,
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
