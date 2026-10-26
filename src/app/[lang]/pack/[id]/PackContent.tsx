'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import CopyButton from '@/components/CopyButton'

interface Pack {
  id: string
  name: string
  version: string
  cover_image_url?: string | null
  arts_folder?: string | null
}

interface PackLink {
  id: string
  category: string
  url: string
  label_pt: string
  label_es?: string
  label_en?: string
  subsection_id: string | null
}

interface PackArt {
  id: string
  image_url: string
  caption: string | null
}

interface PackSubsection {
  id: string
  name_pt: string
  name_es: string
  name_en?: string
  icon: string
  display_order: number
}

interface StoryPackData {
  id: string
  buyLink: string
  isUnlocked: boolean
  subsections: PackSubsection[]
  links: PackLink[]
}

interface FullProps {
  pack: Pack
  links: PackLink[]
  arts: PackArt[]
  subsections: PackSubsection[]
  sectionOrder: string[]
  storyPack: StoryPackData | null
  isParentUnlocked: boolean
  parentBuyLink: string
  memberEmail: string
  lang: string
  dict: any
}

type TabType = 'files' | 'legends'

// Hero entrance animations
const heroVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const headerInfoVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: 0.08,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const tabsVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.16,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

// Staggered list animations for files tab
const fileListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
}

const fileRowVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

// Staggered animations for captions tab
const legendsGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

const legendCardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export default function PackContent({
  pack,
  links,
  arts,
  lang,
}: FullProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('files')

  // Prevent background page from scrolling or showing through bounce scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    const originalOverscroll = document.body.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.overscrollBehavior = originalOverscroll
    }
  }, [])

  // Clean name
  const cleanName = pack.name.includes('|') ? pack.name.split('|')[0].trim() : pack.name

  // Version badge
  function formatVersionBadge(ver?: string | null): string {
    if (!ver) return 'VOL 1.0'
    const trimmed = ver.trim()
    if (/^vol\.?\s*/i.test(trimmed)) {
      const rest = trimmed.replace(/^vol\.?\s*/i, '').trim()
      return `VOL ${rest.toUpperCase()}`
    }
    return `VOL ${trimmed.toUpperCase()}`
  }
  const displayVersion = formatVersionBadge(pack.version)

  // Cover image
  const coverImage = pack.cover_image_url || (pack.arts_folder ? `/${pack.arts_folder}/card.webp` : '/herocover.png')

  // WhatsApp link for custom orders
  const whatsappUrl = `https://wa.me/5564993237320?text=${encodeURIComponent(
    `Olá! Gostaria de solicitar a personalização das artes do pack ${cleanName}.`
  )}`

  // Process links into clean rows
  const fileItems = useMemo(() => {
    return links.map((link) => {
        const rawLabel = (lang === 'en' ? link.label_en : lang === 'es' ? link.label_es : link.label_pt) || link.label_pt || ''
        const hexMatch = rawLabel.match(/["'](#?[A-Fa-f0-9]{6})["']/)
        const hexColor = hexMatch ? hexMatch[1] : null

        const cleanLabel = rawLabel
          .replace(/^Pack\s+/i, '')
          .replace(/\[.*?\]/g, '')
          .replace(/".*?"/g, '')
          .trim()

        return {
          id: link.id,
          title: cleanLabel || rawLabel,
          url: link.url,
          hexColor,
        }
      })
  }, [links, lang])

  const tabFilesText = lang === 'en' ? 'Files' : lang === 'es' ? 'Archivos' : 'Arquivos'
  const tabLegendsText = lang === 'en' ? 'Captions' : lang === 'es' ? 'Textos' : 'Legendas'

  return (
    <div className="pack-detail-wrapper">
      <div className="pack-detail-container">

        {/* Cover & Hero Section with motion */}
        <motion.div
          className="pack-cover-hero"
          initial="hidden"
          animate="visible"
          variants={heroVariants}
        >
          {/* Back Button */}
          <motion.button
            type="button"
            onClick={() => router.back()}
            className="pack-detail-back-btn"
            aria-label="Voltar"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Cover image */}
          <img src={coverImage} alt={cleanName} className="pack-cover-img" />

          {/* Sombra overlay do cover */}
          <img
            src="/sombra-cover.webp"
            alt=""
            className="pack-cover-shadow"
            onError={(e) => {
              e.currentTarget.src = '/sombra-card.webp'
            }}
            aria-hidden="true"
          />

          {/* Title, Version and Segmented Control */}
          <div className="pack-cover-overlay">
            <motion.div
              className="pack-cover-header"
              variants={headerInfoVariants}
            >
              <h1 className="pack-cover-title">{cleanName}</h1>
              {displayVersion && (
                <span className="pack-card-version pack-cover-version">{displayVersion}</span>
              )}
            </motion.div>

            {/* Separate Pill Tabs */}
            <motion.div
              className="pack-tabs-row"
              role="tablist"
              variants={tabsVariants}
            >
              <motion.button
                type="button"
                role="tab"
                aria-selected={activeTab === 'files'}
                className={`pack-tab-pill ${activeTab === 'files' ? 'active' : 'inactive'}`}
                onClick={() => setActiveTab('files')}
                whileTap={{ scale: 0.97 }}
              >
                {tabFilesText}
              </motion.button>
              <motion.button
                type="button"
                role="tab"
                aria-selected={activeTab === 'legends'}
                className={`pack-tab-pill ${activeTab === 'legends' ? 'active' : 'inactive'}`}
                onClick={() => setActiveTab('legends')}
                whileTap={{ scale: 0.97 }}
              >
                {tabLegendsText}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* TAB CONTENT: ARQUIVOS */}
        {activeTab === 'files' && (
          <motion.main
            key="files"
            className="pack-files-list"
            initial="hidden"
            animate="visible"
            variants={fileListVariants}
          >
            {/* Customization item */}
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pack-file-row pack-file-row-custom"
              variants={fileRowVariants}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="pack-file-thumb pack-file-thumb-locked">
                <img src={coverImage} alt="" className="pack-file-thumb-img" />
                <div className="pack-file-lock-badge">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    className="pack-file-lock-svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2a5 5 0 0 0-5 5v3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3h-1V7a5 5 0 0 0-5-5zm3 8V7a3 3 0 0 0-6 0v3h6zm-3 4a1.5 1.5 0 0 0-1 2.618V18a1 1 0 1 0 2 0v-1.382A1.5 1.5 0 0 0 12 14z"
                    />
                  </svg>
                </div>
              </div>
              <div className="pack-file-info">
                <div className="pack-file-title-row">
                  <img
                    src="/premium.webp"
                    alt=""
                    className="pack-crown-icon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'inline-block'
                    }}
                  />
                  <span className="pack-crown-fallback" style={{ display: 'none' }}>👑</span>
                  <h4 className="pack-file-title">Personalizado</h4>
                </div>
                <p className="pack-file-desc">
                  Sem tempo para editar?<br />
                  Eu edito para você, basta clicar e solicitar.
                </p>
              </div>
            </motion.a>

            {/* Variation items - clean without tint */}
            {fileItems.map((item) => (
              <motion.a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pack-file-row"
                variants={fileRowVariants}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="pack-file-thumb">
                  <img src={coverImage} alt={item.title} className="pack-file-thumb-img" />
                </div>
                <div className="pack-file-info pack-file-info-centered">
                  <h4 className="pack-file-title">{item.title}</h4>
                </div>
              </motion.a>
            ))}
          </motion.main>
        )}

        {/* TAB CONTENT: LEGENDAS */}
        {activeTab === 'legends' && (
          <motion.main
            key="legends"
            className="pack-legends-view"
            initial="hidden"
            animate="visible"
            variants={legendsGridVariants}
          >
            {arts.length > 0 ? (
              arts.map((art) => (
                <motion.div
                  key={art.id}
                  className="pack-legend-card"
                  variants={legendCardVariants}
                >
                  <div className="pack-legend-img-wrap">
                    <img src={art.image_url} alt="Arte" loading="lazy" />
                  </div>
                  <div className="pack-legend-body">
                    <p className="pack-legend-caption">
                      {art.caption || 'Sem legenda disponível'}
                    </p>
                    {art.caption && (
                      <CopyButton text={art.caption} />
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', color: '#71717A' }}>
                <p>Nenhuma legenda disponível para este pack.</p>
              </div>
            )}
          </motion.main>
        )}

      </div>
    </div>
  )
}
