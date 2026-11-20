'use client'

import React, { createContext, useContext } from 'react'
import {
  CARROSSEL_ARTES_IDS,
  CARROSSEL_ARTES,
  SECTION_COVER_IDS,
  SECTION_BG_CARDS,
  SectionBgName,
} from './cardsConfig'

interface PacksThemeConfig {
  theme?: string
  artesFolder?: string
  mockupSrc?: string
  carrosselArtes?: string[]
  sectionBgCards?: Record<SectionBgName, string[]>
}

const PacksContext = createContext<PacksThemeConfig>({
  theme: 'green',
  artesFolder: '/sales-pages/provedor-v2/artes',
  mockupSrc: '/sales-pages/provedor-v2/mockup.webp',
  carrosselArtes: CARROSSEL_ARTES,
  sectionBgCards: SECTION_BG_CARDS,
})

export function PacksProvider({
  children,
  artesFolder = '/sales-pages/provedor-v2/artes',
  theme = 'green',
  mockupSrc,
  cacheBust = true,
}: {
  children: React.ReactNode
  artesFolder?: string
  theme?: string
  mockupSrc?: string
  cacheBust?: boolean
}) {
  // Query param para garantir que novas imagens nunca fiquem presas em cache do navegador
  const query = cacheBust ? `?v=${theme}` : ''

  const defaultMockup =
    theme === 'vermelho'
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

  // Carrossel de 24 artes respeitando o CARROSSEL_ARTES_IDS de cardsConfig.ts
  const carrosselArtes = CARROSSEL_ARTES_IDS.map(
    (id) => `${artesFolder}/${id}.webp${query}`
  )

  // Mapeia os mesmos IDs configurados no SECTION_COVER_IDS do cardsConfig.ts
  // para a pasta de artes correspondente (verde, vermelho, laranja, etc.)
  const sectionBgCards: Record<SectionBgName, string[]> = Object.fromEntries(
    Object.entries(SECTION_COVER_IDS).map(([section, ids]) => [
      section,
      ids.map((id) => `${artesFolder}/${id}.webp${query}`),
    ])
  ) as Record<SectionBgName, string[]>

  return (
    <PacksContext.Provider
      value={{
        theme,
        artesFolder,
        mockupSrc: resolvedMockup,
        carrosselArtes,
        sectionBgCards,
      }}
    >
      {children}
    </PacksContext.Provider>
  )
}

export function usePacksContext() {
  return useContext(PacksContext)
}
