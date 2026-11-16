import {
  SECTION_BG_CARDS,
  resolveArtPath,
  type SectionBgName,
} from './cardsConfig'

interface BgCardsProps {
  section?: SectionBgName
  cards?: (number | string)[]
}

const DEFAULT_CARDS = [1, 2, 3, 4, 5, 6].map(resolveArtPath)

export default function BgCards({ section, cards }: BgCardsProps) {
  const cardList = cards
    ? cards.map(resolveArtPath)
    : (section && SECTION_BG_CARDS[section]) || DEFAULT_CARDS

  return (
    <div className="v2-bg-wrapper">
      <div className="v2-bg-cards-container">
        <div className="v2-bg-cards-rotated">
          <div className="v2-bg-cards-grid">
            {cardList.map((src, i) => (
              <div key={i} className={`v2-bg-card v2-bg-card-${i + 1}`}>
                <img src={src} alt="" loading="lazy" />
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
