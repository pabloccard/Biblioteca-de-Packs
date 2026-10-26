'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import CopyButton from '@/components/CopyButton'
import type { PackArt } from '@/lib/pack-arts'

interface Version {
  id: string
  name: string
  coverImageUrl: string | null
  displayOrder: number
}

interface Complement {
  id: string
  type: 'stories' | 'custom'
  buyLink: string
  price: number | null
  descriptionPt: string
  descriptionEs: string
  descriptionEn: string
  isPurchased: boolean
  customStatus: 'not_purchased' | 'pending' | 'delivered'
  customDeliveryLinks: any
  customCoverUrl?: string | null
}

interface PackOverviewProps {
  pack: {
    id: string
    name: string
    version: string
    coverImageUrl: string | null
  }
  versions: Version[]
  complements: Complement[]
  hasStories: boolean
  arts?: PackArt[]
  initialTab?: 'files' | 'legends'
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
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
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

const legendsGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.16, ease: 'easeIn' as const },
  },
}

const legendCardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export default function PackOverview({
  pack,
  versions,
  complements,
  hasStories,
  arts = [],
  initialTab = 'files',
  lang,
  dict,
}: PackOverviewProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'legends'>(initialTab)

  // Garante que a página sempre inicie no topo, sem scroll para o meio
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const cleanName = pack.name.includes('|') ? pack.name.split('|')[0].trim() : pack.name

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
  const coverImage = pack.coverImageUrl || '/herocover.png'

  const customComplement = complements.find(c => c.type === 'custom')

  const tabFilesText = dict?.tabFiles || (lang === 'en' ? 'Files' : lang === 'es' ? 'Archivos' : 'Arquivos')
  const tabLegendsText = dict?.tabLegends || (lang === 'en' ? 'Captions' : lang === 'es' ? 'Textos' : 'Legendas')

  return (
    <div className="pack-detail-wrapper">
      <div className="pack-detail-container">

        {/* Botão Voltar */}
        <Link
          href={`/${lang}/dashboard`}
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
            <h1 className="pack-cover-title">{cleanName}</h1>
            {displayVersion && (
              <span className="pack-card-version pack-cover-version">{displayVersion}</span>
            )}
          </div>
          <p className="pack-header-description">
            {activeTab === 'files'
              ? (dict?.filesHeaderDesc || (lang === 'es'
                  ? 'Elige la versión a la que deseas acceder o solicita la personalización de tus diseños.'
                  : lang === 'en'
                    ? 'Choose the version you want to access or request customization for your arts.'
                    : 'Escolha a versão que deseja acessar ou solicite a personalização das suas artes.'))
              : (dict?.legendsHeaderDesc || (lang === 'es'
                  ? 'Elige un diseño, copia el texto y adapta la información si es necesario.'
                  : lang === 'en'
                    ? 'Choose an art, copy the text and adapt the information if necessary.'
                    : 'Escolha uma arte, copie o texto e adapte as informações, se necessário.'))}
          </p>
        </motion.div>

        {/* 3. Seção de Abas (Arquivos / Legendas - Barra com Bolha Animada) */}
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
              aria-selected={activeTab === 'files'}
              className={`pack-tab-item ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              {activeTab === 'files' && (
                <motion.div
                  layoutId="packOverviewTabsBubble"
                  className="pack-tab-bubble"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span className="pack-tab-label">{tabFilesText}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'legends'}
              className={`pack-tab-item ${activeTab === 'legends' ? 'active' : ''}`}
              onClick={() => setActiveTab('legends')}
            >
              {activeTab === 'legends' && (
                <motion.div
                  layoutId="packOverviewTabsBubble"
                  className="pack-tab-bubble"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span className="pack-tab-label">{tabLegendsText}</span>
            </button>
          </div>
        </motion.div>

        {/* Content: Files Tab (Custom Complement + Color Versions) */}
        <AnimatePresence mode="wait">
          {activeTab === 'files' && (
            <motion.main
              key="files"
              className="pack-files-list pack-overview-files"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={listVariants}
            >
            {/* Custom Complement Card */}
            {customComplement && (() => {
              const isCustomPurchased = !!customComplement.isPurchased
              const customCover = customComplement.customCoverUrl || coverImage

              return (
                <motion.div variants={rowVariants} className="pack-overview-custom-item">
                  {/* Mobile version row (< 768px) */}
                  <Link
                    href={`/${lang}/pack/${pack.id}/custom`}
                    className="pack-file-row pack-file-row-custom pack-version-row-mobile"
                  >
                    <div className={isCustomPurchased ? 'pack-file-thumb' : 'pack-file-thumb pack-file-thumb-locked'}>
                      <img src={customCover} alt="" className="pack-file-thumb-img" />
                      {!isCustomPurchased && (
                        <div className="pack-file-lock-badge">
                          <svg width="26" height="26" viewBox="0 0 24 24" className="pack-file-lock-svg">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 2a5 5 0 0 0-5 5v3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3h-1V7a5 5 0 0 0-5-5zm3 8V7a3 3 0 0 0-6 0v3h6zm-3 4a1.5 1.5 0 0 0-1 2.618V18a1 1 0 1 0 2 0v-1.382A1.5 1.5 0 0 0 12 14z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="pack-file-info">
                      <div className="pack-file-title-row">
                        <img src="/premium.webp" alt="" className="pack-crown-icon" />
                        <h4 className="pack-file-title">
                          {dict?.customCardTitle || (lang === 'en' ? 'Custom' : 'Personalizado')}
                        </h4>
                      </div>
                      <p className="pack-file-desc">
                        {isCustomPurchased
                          ? customComplement.customStatus === 'delivered'
                            ? (lang === 'en'
                                ? 'Your customized arts are ready! Click to access.'
                                : lang === 'es'
                                  ? '¡Tus artes personalizadas están listas! Haz clic para acceder.'
                                  : 'Suas artes personalizadas estão prontas! Clique para acessar.')
                            : (lang === 'en'
                                ? 'Customization in production. Click to view status.'
                                : lang === 'es'
                                  ? 'Personalización en producción. Haz clic para ver el estado.'
                                  : 'Personalização em produção. Clique para acompanhar.')
                          : (dict?.customCardNotPurchasedDesc || (lang === 'en'
                              ? 'No time to edit? Receive ready-to-post designs with your brand, plans, and contact info.'
                              : lang === 'es'
                                ? '¿No tienes tiempo para editar? Recibe los diseños listos con tu marca, planes y datos de contacto.'
                                : 'Sem tempo para editar? Receba as artes prontas com sua marca, planos e contatos.'))}
                      </p>
                    </div>
                  </Link>

                  {/* Desktop version card (>= 768px) - Exact Dashboard PackCard */}
                  <Link
                    href={`/${lang}/pack/${pack.id}/custom`}
                    className="pack-card-link pack-version-card-desktop"
                  >
                    <div className={`pack-card ${isCustomPurchased ? 'unlocked' : 'locked'}`}>
                      <div className="pack-card-media">
                        <img
                          src={customCover}
                          alt={dict?.customCardTitle || (lang === 'en' ? 'Custom' : 'Personalizado')}
                          className="pack-card-img"
                        />
                        <img
                          src="/sombra-card.webp"
                          alt=""
                          className="pack-card-shadow-img"
                          aria-hidden="true"
                        />
                        {!isCustomPurchased && (
                          <div className="pack-card-lock-center" aria-hidden="true">
                            <svg width="44" height="44" viewBox="0 0 24 24" className="pack-lock-svg">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12 2a5 5 0 0 0-5 5v3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3h-1V7a5 5 0 0 0-5-5zm3 8V7a3 3 0 0 0-6 0v3h6zm-3 4a1.5 1.5 0 0 0-1 2.618V18a1 1 0 1 0 2 0v-1.382A1.5 1.5 0 0 0 12 14z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="pack-card-footer">
                          <div className="pack-file-title-row">
                            <img src="/premium.webp" alt="" className="pack-crown-icon" />
                            <h3 className="pack-card-title" style={{ color: '#FFB742' }}>
                              {dict?.customCardTitle || (lang === 'en' ? 'Custom' : 'Personalizado')}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })()}

            {/* Color Version Items */}
            {versions.map((version) => (
              <motion.div key={version.id} variants={rowVariants} className="pack-overview-version-item">
                {/* Mobile version row (< 768px) */}
                <Link
                  href={`/${lang}/pack/${pack.id}/version/${version.id}`}
                  className="pack-file-row pack-version-row-mobile"
                >
                  <div className="pack-file-thumb">
                    {version.coverImageUrl ? (
                      <img src={version.coverImageUrl} alt={version.name} className="pack-file-thumb-img" />
                    ) : (
                      <img src={coverImage} alt={version.name} className="pack-file-thumb-img" />
                    )}
                  </div>
                  <div className="pack-file-info pack-file-info-centered">
                    <h4 className="pack-file-title">{version.name}</h4>
                  </div>
                </Link>

                {/* Desktop version card (>= 768px) - Exact Dashboard PackCard Style */}
                <Link
                  href={`/${lang}/pack/${pack.id}/version/${version.id}`}
                  className="pack-card-link pack-version-card-desktop"
                >
                  <div className="pack-card unlocked">
                    <div className="pack-card-media">
                      <img
                        src={version.coverImageUrl || coverImage}
                        alt={version.name}
                        className="pack-card-img"
                      />
                      <img
                        src="/sombra-card.webp"
                        alt=""
                        className="pack-card-shadow-img"
                        aria-hidden="true"
                      />
                      <div className="pack-card-footer">
                        <h3 className="pack-card-title">{version.name}</h3>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.main>
        )}

        {/* Content: Legends Tab (Fiel à imagem de referência) */}
        {activeTab === 'legends' && (
          <motion.main
            key="legends"
            className="pack-legends-list"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={legendsGridVariants}
          >
            {arts && arts.length > 0 ? (
              arts.map((art) => (
                <motion.div
                  key={art.id || art.number}
                  className="pack-legend-row"
                  variants={legendCardVariants}
                >
                  <div className="pack-legend-thumb">
                    <img
                      src={art.imageUrl || (art.id ? `/api/drive/proxy-thumbnail?fileId=${art.id}` : '')}
                      alt={art.name || `Arte ${art.number}`}
                      className="pack-legend-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        if (art.id && !e.currentTarget.src.includes('/api/drive/proxy-thumbnail')) {
                          e.currentTarget.src = `/api/drive/proxy-thumbnail?fileId=${art.id}`
                        }
                      }}
                    />
                  </div>
                  <div className="pack-legend-content">
                    <p className="pack-legend-text">
                      {art.caption || (lang === 'es' ? 'Sin texto disponible' : lang === 'en' ? 'No caption available' : 'Sem legenda disponível')}
                    </p>
                    {art.caption && (
                      <CopyButton
                        text={art.caption}
                        className="pack-legend-copy-btn"
                        label={dict?.copyLegend || (lang === 'en' ? 'Copy caption' : lang === 'es' ? 'Copiar texto' : 'Copiar legenda')}
                        copiedLabel={dict?.legendCopied || (lang === 'en' ? 'Copied!' : lang === 'es' ? '¡Copiado!' : 'Copiado!')}
                      />
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#71717A' }}>
                <p>
                  {lang === 'en'
                    ? 'No captions available for this pack.'
                    : lang === 'es'
                      ? (dict?.noLegends || 'No hay textos disponibles para este pack.')
                      : 'Nenhuma legenda disponível para este pack.'}
                </p>
              </div>
            )}
          </motion.main>
        )}
        </AnimatePresence>

      </div>
    </div>
  )
}
