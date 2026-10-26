'use client'

import { useState, useEffect } from 'react'

interface ModalProgressiveImageProps {
  lowResSrc?: string
  highResSrc: string
  fallbackSrc?: string
  lowResFallbackSrc?: string
  alt: string
  className?: string
}

export default function ModalProgressiveImage({
  lowResSrc,
  highResSrc,
  fallbackSrc,
  lowResFallbackSrc,
  alt,
  className = '',
}: ModalProgressiveImageProps) {
  const [hdLoaded, setHdLoaded] = useState(false)

  // Reset state when the high-resolution source changes (user switches art)
  useEffect(() => {
    setHdLoaded(false)
  }, [highResSrc])

  return (
    <>
      {/* Camada 1: Miniatura imediata em cache (exibição instantânea 0ms) */}
      {lowResSrc && (
        <img
          src={lowResSrc}
          alt=""
          aria-hidden="true"
          className={`custom-art-modal-img custom-art-modal-img-thumb ${className}`}
          onError={(e) => {
            if (lowResFallbackSrc && e.currentTarget.src !== lowResFallbackSrc) {
              e.currentTarget.src = lowResFallbackSrc
            }
          }}
        />
      )}

      {/* Camada 2: Imagem em alta resolução (1600px) com fade-in suave */}
      <img
        src={highResSrc}
        alt={alt}
        className={`custom-art-modal-img custom-art-modal-img-hd ${hdLoaded ? 'loaded' : ''} ${className}`}
        onLoad={() => setHdLoaded(true)}
        onError={(e) => {
          if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
            e.currentTarget.src = fallbackSrc
          }
        }}
        ref={(img) => {
          if (img && img.complete && img.naturalWidth > 0 && !hdLoaded) {
            setHdLoaded(true)
          }
        }}
      />
    </>
  )
}
