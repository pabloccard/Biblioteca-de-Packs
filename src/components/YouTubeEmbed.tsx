interface YouTubeEmbedProps {
  url: string
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export default function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url)

  if (!videoId) {
    return (
      <div className="youtube-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Vídeo não disponível</p>
      </div>
    )
  }

  return (
    <div className="youtube-wrapper">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="Tutorial do Pack"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
