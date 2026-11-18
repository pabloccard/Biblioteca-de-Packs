'use client'

import {
  SECTION_BG_CARDS,
  resolveArtPath,
  type SectionBgName,
} from './cardsConfig'
import { usePacksContext } from './PacksContext'

interface BgCardsProps {
  section?: SectionBgName
  cards?: (number | string)[]
}

const DEFAULT_CARDS = [1, 2, 3, 4, 5, 6].map(resolveArtPath)

export default function BgCards({ section, cards }: BgCardsProps) {
  const context = usePacksContext()
  const sourceMap = context?.sectionBgCards || SECTION_BG_CARDS

  const cardList = cards
    ? cards.map((c) =>
        typeof c === 'number' && context?.artesFolder
          ? `${context.artesFolder}/${c}.webp`
          : resolveArtPath(c)
      )
    : (section && sourceMap[section]) || DEFAULT_CARDS

  return (
    <div className="v2-bg-wrapper">
      <div className="v2-bg-cards-container">
        <div className="v2-bg-cards-rotated">
          <div className="v2-bg-cards-grid">
            {cardList.map((src, i) => (
              <div key={i} className={`v2-bg-card v2-bg-card-${i + 1}`}>
                <img src={src} alt="" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="v2-bg-shadow v2-bg-shadow-1" />
      <div className="v2-bg-shadow v2-bg-shadow-2" />
    </div>
  )
}
