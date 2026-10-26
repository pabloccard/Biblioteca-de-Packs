'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

interface VersionLink {
  id: string
  platform: string
  format: string
  url: string
  labelPt: string
  labelEs: string
  labelEn: string
}

interface VersionContentProps {
  pack: {
    id: string
    name: string
    version: string
    coverImageUrl: string | null
  }
  version: {
    id: string
    name: string
    coverImageUrl: string | null
  }
  feedLinks: VersionLink[]
  storiesLinks: VersionLink[]
  hasStories: boolean
  storiesBuyLink: string
  lang: string
  dict: any
}

const heroVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const headerInfoVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const tabsVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const listVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.16, ease: 'easeIn' as const },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
}

type PlatformTab = 'canva' | 'photoshop'

export default function VersionContent({
  pack,
  version,
  feedLinks,
  storiesLinks,
  hasStories,
  storiesBuyLink,
  lang,
}: VersionContentProps) {
  const [activePlatform, setActivePlatform] = useState<PlatformTab>('canva')

  // Garante que a página sempre inicie no topo, sem scroll para o meio
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const cleanName = pack.name.includes('|') ? pack.name.split('|')[0].trim() : pack.name
  const coverImage = version.coverImageUrl || pack.coverImageUrl || '/herocover.png'

  // Title and subtitle
  const versionTitle = version.name || 'Vol. 01'
  const versionSubtitle = lang === 'en'
    ? 'Choose the platform and format you want to access'
    : lang === 'es'
      ? 'Elige la plataforma y el formato que deseas acceder'
      : 'Escolha a plataforma e o formato que deseja acessar'

  // Filter links by active platform
  const currentFeedLinks = feedLinks.filter(l => l.platform === activePlatform)
  const currentStoriesLinks = storiesLinks.filter(l => l.platform === activePlatform)

  // Check if photoshop links exist
  const hasPhotoshop = feedLinks.some(l => l.platform === 'photoshop') ||
    storiesLinks.some(l => l.platform === 'photoshop')

  // Labels
  const feedLabel = lang === 'en' ? 'Feed format' : lang === 'es' ? 'Formato para feed' : 'Formato para feed'
  const storiesLabel = lang === 'en' ? 'Stories format' : lang === 'es' ? 'Formato para stories' : 'Formato para stories'
  const feedSize = '2160×2880'
  const storiesSize = '2160×3840'
  const psdNote = lang === 'en'
    ? 'Note: For ease of editing in Photoshop, PSD files are delivered only in the default color palette.'
    : lang === 'es'
      ? 'Atención: Por la facilidad de edición en Photoshop, los archivos PSD son entregados apenas en la paleta de color padrón del pack.'
      : 'Atenção: Pela facilidade de edição no photoshop, os arquivos PSD são entregues apenas na paleta de cor padrão do pack.'

  const isFeedLast = currentStoriesLinks.length === 0

  return (
    <div className="pack-detail-wrapper">
      <div className="pack-detail-container">

        {/* Botão Voltar */}
        <Link
          href={`/${lang}/pack/${pack.id}`}
          className="pack-detail-back-btn"
          aria-label="Voltar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* 1. Backdrop de Capa e Sombra */}
        <div className="pack-hero-backdrop">
          <img src={coverImage} alt={cleanName} className="pack-cover-img" />
          <img src="/sombra-cover.webp" alt="" className="pack-cover-shadow" aria-hidden="true" />
        </div>

        {/* 2. Header (Começa rigorosamente no mesmo pixel Y) */}
        <motion.div
          className="pack-header-section"
          initial="hidden"
          animate="visible"
          variants={headerInfoVariants}
        >
          <div className="pack-cover-header">
            <h1 className="pack-cover-title">{versionTitle}</h1>
          </div>
          <p className="pack-header-description">
            {versionSubtitle}
          </p>
        </motion.div>

        {/* 3. Seção de Abas de Plataforma (Canva / Photoshop - Barra com Bolha Animada) */}
        {hasPhotoshop && (
          <motion.div
            className="pack-tabs-section"
            initial="hidden"
            animate="visible"
            variants={tabsVariants}
          >
            <div className="pack-tabs-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activePlatform === 'canva'}
                className={`pack-tab-item ${activePlatform === 'canva' ? 'active' : ''}`}
                onClick={() => setActivePlatform('canva')}
              >
                {activePlatform === 'canva' && (
                  <motion.div
                    layoutId="versionTabsBubble"
                    className="pack-tab-bubble"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="pack-tab-label">Canva</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activePlatform === 'photoshop'}
                className={`pack-tab-item ${activePlatform === 'photoshop' ? 'active' : ''}`}
                onClick={() => setActivePlatform('photoshop')}
              >
                {activePlatform === 'photoshop' && (
                  <motion.div
                    layoutId="versionTabsBubble"
                    className="pack-tab-bubble"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="pack-tab-label">Photoshop</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Format Links */}
        <AnimatePresence mode="wait">
          <motion.main
            className="pack-files-list version-links-list"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={listVariants}
            key={activePlatform}
          >
          {/* Feed format */}
          {currentFeedLinks.length > 0 && currentFeedLinks.map((link) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`pack-file-row ${activePlatform === 'photoshop' && isFeedLast ? 'no-bottom-border' : ''}`}
              variants={rowVariants}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="version-format-icon">
                <span className="version-format-ratio">4:5</span>
              </div>
              <div className="pack-file-info">
                <h4 className="pack-file-title">{feedLabel}</h4>
                <p className="pack-file-desc">{feedSize}</p>
              </div>
            </motion.a>
          ))}

          {/* Stories format (unlocked) */}
          {currentStoriesLinks.length > 0 && hasStories && currentStoriesLinks.map((link) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`pack-file-row ${activePlatform === 'photoshop' ? 'no-bottom-border' : ''}`}
              variants={rowVariants}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="version-format-icon version-format-stories">
                <span className="version-format-ratio">9:16</span>
              </div>
              <div className="pack-file-info">
                <h4 className="pack-file-title">{storiesLabel}</h4>
                <p className="pack-file-desc">{storiesSize}</p>
              </div>
            </motion.a>
          ))}

          {/* Stories format (locked - cadeado ao lado do nome) */}
          {currentStoriesLinks.length > 0 && !hasStories && (
            <motion.a
              href={storiesBuyLink || '#'}
              target={storiesBuyLink ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`pack-file-row version-locked-row ${activePlatform === 'photoshop' ? 'no-bottom-border' : ''}`}
              variants={rowVariants}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="version-format-icon version-format-stories">
                <span className="version-format-ratio">9:16</span>
              </div>
              <div className="pack-file-info">
                <div className="pack-file-title-row">
                  <h4 className="pack-file-title" style={{ opacity: 0.6 }}>{storiesLabel}</h4>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="version-format-lock-icon">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2a5 5 0 0 0-5 5v3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3h-1V7a5 5 0 0 0-5-5zm3 8V7a3 3 0 0 0-6 0v3h6zm-3 4a1.5 1.5 0 0 0-1 2.618V18a1 1 0 1 0 2 0v-1.382A1.5 1.5 0 0 0 12 14z" />
                  </svg>
                </div>
                <p className="pack-file-desc">{storiesSize}</p>
              </div>
            </motion.a>
          )}

          {/* Photoshop note (aviso normal sem caixinha e sem linha divisória acima) */}
          {activePlatform === 'photoshop' && (
            <motion.div
              className="version-psd-note"
              variants={rowVariants}
            >
              <p>
                <strong>{lang === 'en' ? 'Note:' : lang === 'es' ? 'Atención:' : 'Atenção:'}</strong>{' '}
                {psdNote.replace(/^(Atenção|Atención|Note):?\s*/i, '')}
              </p>
            </motion.div>
          )}

          {/* No links available */}
          {currentFeedLinks.length === 0 && currentStoriesLinks.length === 0 && (
            <motion.div
              variants={rowVariants}
              style={{ textAlign: 'center', padding: '48px 20px', color: '#71717A' }}
            >
              <p>
                {lang === 'en'
                  ? 'No files available for this platform.'
                  : lang === 'es'
                    ? 'No hay archivos disponibles para esta plataforma.'
                    : 'Nenhum arquivo disponível para esta plataforma.'}
              </p>
            </motion.div>
          )}
        </motion.main>
        </AnimatePresence>

      </div>
    </div>
  )
}
