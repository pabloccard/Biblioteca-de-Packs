import Link from 'next/link'
import Image from 'next/image'

interface PackArt {
  id: string
  image_url: string
}

interface PackCardProps {
  id: string
  name: string
  coverImageUrl: string | null
  artCount: number
  isUnlocked: boolean
  arts: PackArt[]
  buyLink: string
  version?: string
  lang: string
  priority?: boolean
}

export default function PackCard({
  id,
  name,
  coverImageUrl,
  artCount,
  isUnlocked,
  arts,
  buyLink,
  version = '1.0',
  lang,
  priority = false,
}: PackCardProps) {
  // Clean name (strip "| Vol.XX" if present in the pack name string)
  const cleanName = name.includes('|') ? name.split('|')[0].trim() : name

  // Format version badge (e.g. "vol.01" -> "VOL 0.1", "Vol.03" -> "VOL 0.3", "0.4" -> "VOL 0.4")
  function formatVersionBadge(ver?: string | null): string {
    if (!ver) return 'VOL 1.0'
    const trimmed = ver.trim()
    if (/^vol\.?\s*/i.test(trimmed)) {
      const rest = trimmed.replace(/^vol\.?\s*/i, '').trim()
      return `VOL ${rest.toUpperCase()}`
    }
    return `VOL ${trimmed.toUpperCase()}`
  }

  const displayVersion = formatVersionBadge(version)

  const cardContent = (
    <div className={`pack-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
      <div className="pack-card-media">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={cleanName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="pack-card-img"
            priority={priority}
          />
        ) : (
          <div className="pack-card-placeholder">
            <span>📦</span>
          </div>
        )}

        {/* Sombra oficial do Figma */}
        <img
          src="/sombra-card.webp"
          alt=""
          className="pack-card-shadow-img"
          aria-hidden="true"
        />

        {/* Center lock icon for locked pack */}
        {!isUnlocked && (
          <div className="pack-card-lock-center" aria-hidden="true">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              className="pack-lock-svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2a5 5 0 0 0-5 5v3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3h-1V7a5 5 0 0 0-5-5zm3 8V7a3 3 0 0 0-6 0v3h6zm-3 4a1.5 1.5 0 0 0-1 2.618V18a1 1 0 1 0 2 0v-1.382A1.5 1.5 0 0 0 12 14z"
              />
            </svg>
          </div>
        )}

        {/* Bottom card footer with Title and Version pill */}
        <div className="pack-card-footer">
          <h3 className="pack-card-title">{cleanName}</h3>
          {displayVersion && (
            <span className="pack-card-version">{displayVersion}</span>
          )}
        </div>
      </div>
    </div>
  )

  if (isUnlocked) {
    return (
      <Link href={`/${lang}/pack/${id}`} scroll={true} className="pack-card-link">
        {cardContent}
      </Link>
    )
  }

  return (
    <div className="pack-card-wrapper-locked" aria-disabled="true">
      {cardContent}
    </div>
  )
}
