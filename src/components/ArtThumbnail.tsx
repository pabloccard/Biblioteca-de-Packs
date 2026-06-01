import CopyButton from './CopyButton'

interface ArtThumbnailProps {
  imageUrl: string
  caption: string
}

export default function ArtThumbnail({ imageUrl, caption }: ArtThumbnailProps) {
  return (
    <div className="legend-card">
      <div className="legend-card-image">
        <img src={imageUrl} alt="Arte do pack" loading="lazy" />
      </div>
      <div className="legend-card-content">
        <p className="legend-card-caption">{caption || 'Sem legenda'}</p>
      </div>
      <div className="legend-card-action">
        <CopyButton text={caption || ''} />
      </div>
    </div>
  )
}
