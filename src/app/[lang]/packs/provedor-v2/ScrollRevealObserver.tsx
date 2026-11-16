'use client'

import { useEffect } from 'react'

export default function ScrollRevealObserver() {
  useEffect(() => {
    const targets = document.querySelectorAll('.v2-reveal, .v2-reveal-scale')
    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('v2-revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -25px 0px',
      }
    )

    targets.forEach((target) => {
      const rect = target.getBoundingClientRect()
      // If element is already in or above initial viewport, reveal immediately
      if (rect.top < window.innerHeight - 20) {
        target.classList.add('v2-revealed')
      } else {
        observer.observe(target)
      }
    })

    return () => observer.disconnect()
  }, [])

  return null
}
