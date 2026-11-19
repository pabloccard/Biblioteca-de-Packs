'use client'

import React, { createContext, useContext } from 'react'
import { CARROSSEL_ARTES, SECTION_BG_CARDS, SectionBgName } from './cardsConfig'

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
        : '/sales-pages/provedor-v2/mockup.webp'
  const resolvedMockup = `${mockupSrc || defaultMockup}${query}`

  const carrosselArtes = Array.from(
    { length: 24 },
    (_, i) => `${artesFolder}/${i + 1}.webp${query}`
  )

  const sectionBgCards: Record<SectionBgName, string[]> = {
    hero: [2, 1, 3, 4, 5, 6].map((id) => `${artesFolder}/${id}.webp${query}`),
    carrossel: [11, 8, 13, 16, 9, 20].map((id) => `${artesFolder}/${id}.webp${query}`),
    personalize: [9, 20, 17, 10, 21, 22].map((id) => `${artesFolder}/${id}.webp${query}`),
    ofertas: [19, 1, 16, 4, 9, 3].map((id) => `${artesFolder}/${id}.webp${query}`),
    suporte: [1, 3, 5, 7, 9, 11].map((id) => `${artesFolder}/${id}.webp${query}`),
    garantia: [2, 4, 6, 8, 10, 12].map((id) => `${artesFolder}/${id}.webp${query}`),
    edite: [7, 12, 15, 18, 23, 24].map((id) => `${artesFolder}/${id}.webp${query}`),
    faq: [3, 6, 14, 17, 20, 22].map((id) => `${artesFolder}/${id}.webp${query}`),
  }

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
