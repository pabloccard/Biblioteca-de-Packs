'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import ModalProgressiveImage from '@/components/ModalProgressiveImage'

export interface CustomFileItem {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  size?: string
}

interface CustomContentProps {
  pack: {
    id: string
    name: string
    version: string
    coverImageUrl: string | null
  }
  complement: {
    id: string
    buyLink: string
    price: number | null
  }
  status: 'not_purchased' | 'pending' | 'waiting' | 'in_progress' | 'delivered' | string
  deliveryLinks: {
    feed_url?: string
    stories_url?: string
    canva_feed_url?: string
    canva_stories_url?: string
    canva_url?: string
    client_folder_url?: string
    feed_folder_id?: string
    stories_folder_id?: string
  } | null
  feedFolderId?: string | null
  storiesFolderId?: string | null
  initialFeedFiles?: CustomFileItem[]
  initialStoriesFiles?: CustomFileItem[]
  whatsappNumber: string
  lang: string
  dict: any
  artCaptions?: Record<string, string>
}

const heroVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const listVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0.04, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
}

type DeliveryTab = 'ready' | 'canva'

interface SelectedArt {
  feedFile: CustomFileItem
  storyFile: CustomFileItem | null
  caption: string
}

function findMatchingStory(
  feedFile: CustomFileItem,
  storiesList: CustomFileItem[],
  feedIndex: number
): CustomFileItem | null {
  if (!storiesList || storiesList.length === 0) return null

  const cleanFeedName = feedFile.name.replace(/\.[^.]+$/, '').toLowerCase().trim()

  // 1. Match exato de nome sem extensão
  const exactMatch = storiesList.find(
    s => s.name.replace(/\.[^.]+$/, '').toLowerCase().trim() === cleanFeedName
  )
  if (exactMatch) return exactMatch

  // 2. Match por número contido no nome (ex: "01", "1", "25")
  const feedNumMatch = cleanFeedName.match(/\d+/)
  if (feedNumMatch) {
    const feedNum = parseInt(feedNumMatch[0], 10)
    const numberMatch = storiesList.find(s => {
      const sNum = s.name.match(/\d+/)
      return sNum && parseInt(sNum[0], 10) === feedNum
    })
    if (numberMatch) return numberMatch
  }

  // 3. Match por posição na lista
  if (feedIndex >= 0 && feedIndex < storiesList.length) {
    return storiesList[feedIndex]
  }

  return null
}

export default function CustomContent({
  pack,
  complement,
  status,
  deliveryLinks,
  feedFolderId,
  storiesFolderId,
  initialFeedFiles = [],
  initialStoriesFiles = [],
  whatsappNumber,
  lang,
  artCaptions = {},
}: CustomContentProps) {
  const [activeTab, setActiveTab] = useState<DeliveryTab>('ready')
  const [feedFiles, setFeedFiles] = useState<CustomFileItem[]>(initialFeedFiles)
  const [storiesFiles, setStoriesFiles] = useState<CustomFileItem[]>(initialStoriesFiles)
  const [loadingFiles, setLoadingFiles] = useState<boolean>(
    status === 'delivered' && initialFeedFiles.length === 0 && !!feedFolderId
  )

  const [downloadingAll, setDownloadingAll] = useState(false)
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null)
  const [selectedArt, setSelectedArt] = useState<SelectedArt | null>(null)
  const [copiedCaption, setCopiedCaption] = useState(false)

  // Garante que a página inicie no topo, sem scroll para o meio
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  // Close modal on Escape key press & prevent background scroll
  useEffect(() => {
    if (!selectedArt) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedArt(null)
        setCopiedCaption(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedArt])

  const cleanName = pack.name.includes('|') ? pack.name.split('|')[0].trim() : pack.name
  const coverImage = pack.coverImageUrl || '/herocover.png'

  const whatsappMsg =
    lang === 'en'
      ? `Hello! I'd like to request customization of the ${cleanName} pack.`
      : lang === 'es'
        ? `Hola! Me gustaría solicitar la personalización del pack ${cleanName}.`
        : `Olá! Gostaria de solicitar a personalização das artes do pack ${cleanName}.`

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`

  // Client-side fallback to load files if SSR did not populate them
  useEffect(() => {
    if (status !== 'delivered') return
    if (feedFiles.length > 0) return
    if (!feedFolderId) return

    let isMounted = true
    async function fetchFiles() {
      setLoadingFiles(true)
      try {
        const feedPromise = fetch(`/api/drive/list-files?folderId=${encodeURIComponent(feedFolderId!)}`)
          .then(r => r.json())
          .catch(() => ({ files: [] }))

        const storiesPromise = storiesFolderId
          ? fetch(`/api/drive/list-files?folderId=${encodeURIComponent(storiesFolderId)}`)
              .then(r => r.json())
              .catch(() => ({ files: [] }))
          : Promise.resolve({ files: [] })

        const [feedData, storiesData] = await Promise.all([feedPromise, storiesPromise])

        if (isMounted) {
          if (feedData.files) setFeedFiles(feedData.files)
          if (storiesData.files) setStoriesFiles(storiesData.files)
        }
      } catch (err) {
        console.error('Failed to load drive files client-side:', err)
      } finally {
        if (isMounted) setLoadingFiles(false)
      }
    }

    fetchFiles()

    return () => {
      isMounted = false
    }
  }, [status, feedFolderId, storiesFolderId, feedFiles.length])

  // Download all files as ZIP
  async function handleDownloadAll() {
    if (downloadingAll) return
    setDownloadingAll(true)

    try {
      const params = new URLSearchParams()
      params.set('zip', 'true')
      params.set('packName', cleanName)

      if (feedFolderId) params.set('feedFolderId', feedFolderId)
      if (storiesFolderId) params.set('storiesFolderId', storiesFolderId)

      // Fallback: If neither specific folder ID is present, use generic client folder
      if (!feedFolderId && !storiesFolderId && deliveryLinks?.feed_url) {
        params.set('folderId', feedFolderId || '')
      }

      const response = await fetch(`/api/drive/download?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Falha ao gerar o arquivo ZIP')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cleanName.toLowerCase().replace(/\s+/g, '-')}-artes.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(
        lang === 'en'
          ? 'Error downloading all files. Please try again.'
          : 'Erro ao baixar todos os arquivos. Por favor, tente novamente.'
      )
    } finally {
      setDownloadingAll(false)
    }
  }

  // Single file download
  async function handleDownloadSingle(file: CustomFileItem, typeKey: 'feed' | 'story') {
    const itemKey = `${typeKey}-${file.id}`
    setDownloadingItem(itemKey)

    try {
      const response = await fetch(`/api/drive/download?fileId=${file.id}`)
      if (!response.ok) {
        throw new Error('Erro ao baixar arquivo')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert(
        lang === 'en'
          ? 'Error downloading file. Please try again.'
          : 'Erro ao baixar o arquivo. Tente novamente.'
      )
    } finally {
      setDownloadingItem(null)
    }
  }

  function handleOpenArtModal(file: CustomFileItem, idx: number) {
    const matchingStory = findMatchingStory(file, storiesFiles, idx)
    
    // Resolve caption from artCaptions
    let caption = ''
    if (artCaptions && Object.keys(artCaptions).length > 0) {
      const cleanName = file.name.replace(/\.[^.]+$/, '').trim()
      const numMatch = cleanName.match(/\d+/)
      const numStr = numMatch ? String(parseInt(numMatch[0], 10)) : String(idx + 1)
      caption =
        artCaptions[numStr] ||
        artCaptions[String(idx + 1)] ||
        artCaptions[cleanName] ||
        artCaptions[file.name] ||
        ''
    }

    setCopiedCaption(false)
    setSelectedArt({
      feedFile: file,
      storyFile: matchingStory,
      caption,
    })
  }

  function handleCloseModal() {
    setSelectedArt(null)
    setCopiedCaption(false)
  }

  async function handleCopyCaption() {
    if (!selectedArt?.caption) return
    try {
      await navigator.clipboard.writeText(selectedArt.caption)
      setCopiedCaption(true)
      setTimeout(() => setCopiedCaption(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = selectedArt.caption
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedCaption(true)
      setTimeout(() => setCopiedCaption(false), 2000)
    }
  }

  // ========================
  // STATE 1: Not purchased
  // ========================
  if (status === 'not_purchased') {
    const priceFormatted = complement.price
      ? new Intl.NumberFormat(lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR', {
          style: 'currency',
          currency: lang === 'en' ? 'USD' : 'BRL',
        }).format(complement.price)
      : 'R$ 59,90'

    return (
      <div className="pack-detail-wrapper">
        <div className="pack-detail-container">
          {/* Botão Voltar */}
          <Link href={`/${lang}/pack/${pack.id}`} className="pack-detail-back-btn" aria-label="Voltar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* 1. Backdrop de Capa e Sombra */}
          <div className="pack-hero-backdrop">
            <img src={coverImage} alt={cleanName} className="pack-cover-img" />
            <img src="/sombra-cover.webp" alt="" className="pack-cover-shadow" aria-hidden="true" />
          </div>

          {/* 2. Header (Começa rigorosamente no mesmo pixel Y) */}
          <div className="pack-header-section">
            <div className="pack-cover-header">
              <img src="/premium.webp" alt="" className="pack-crown-icon" />
              <h1 className="pack-cover-title pack-cover-title-custom">
                {lang === 'en' ? 'Custom' : 'Personalizado'}
              </h1>
            </div>
            <p className="pack-header-description">
              {lang === 'en'
                ? 'Your ready-to-post arts with your identity'
                : lang === 'es'
                  ? 'Tus artes listas con tu identidad de marca'
                  : 'Suas artes prontas com a sua identidade visual'}
            </p>
          </div>

          {/* 3. Conteúdo direto (sem abas e sem espaçador vazio) */}
          <motion.div className="custom-body" initial="hidden" animate="visible" variants={contentVariants}>
            <h3 className="custom-section-title">
              {lang === 'en' ? 'Get all the arts with your identity:' : lang === 'es' ? 'Recibe todas las artes con tu identidad:' : 'Receba todas as artes com a sua identidade:'}
            </h3>
            <ul className="custom-features-list">
              <li><span className="custom-check">✓</span> {lang === 'en' ? 'Your company logo' : lang === 'es' ? 'Logo de tu empresa' : 'Logo da sua empresa'}</li>
              <li><span className="custom-check">✓</span> {lang === 'en' ? 'Color palette' : lang === 'es' ? 'Paleta de colores' : 'Paleta de cores'}</li>
              <li><span className="custom-check">✓</span> {lang === 'en' ? 'Contact and address' : lang === 'es' ? 'Contacto y dirección' : 'Contato e endereço'}</li>
              <li><span className="custom-check">✓</span> {lang === 'en' ? 'Plans (speed and price)' : lang === 'es' ? 'Planes (velocidad y precio)' : 'Planos (velocidade e preço)'}</li>
            </ul>

            <div className="custom-price-section">
              <span className="custom-price-label">{lang === 'en' ? 'For only' : lang === 'es' ? 'Por apenas' : 'Por apenas'}</span>
              <span className="custom-price-value">{priceFormatted}</span>
            </div>

            <div className="custom-cta-section">
              <a href={complement.buyLink || whatsappUrl} target="_blank" rel="noopener noreferrer" className="custom-cta-primary">
                {lang === 'en' ? 'Hire service' : lang === 'es' ? 'Contratar servicio' : 'Contratar serviço'}
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="custom-cta-secondary">
                {lang === 'en' ? 'Ask on WhatsApp' : lang === 'es' ? 'Preguntar en WhatsApp' : 'Tirar dúvida no WhatsApp'}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ========================
  // STATE 2: Pending / Waiting / In Progress
  // ========================
  if (status !== 'delivered') {
    return (
      <div className="pack-detail-wrapper">
        <div className="pack-detail-container">
          {/* Botão Voltar */}
          <Link href={`/${lang}/pack/${pack.id}`} className="pack-detail-back-btn" aria-label="Voltar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* 1. Backdrop de Capa e Sombra */}
          <div className="pack-hero-backdrop">
            <img src={coverImage} alt={cleanName} className="pack-cover-img" />
            <img src="/sombra-cover.webp" alt="" className="pack-cover-shadow" aria-hidden="true" />
          </div>

          {/* 2. Header (Começa rigorosamente no mesmo pixel Y) */}
          <div className="pack-header-section">
            <div className="pack-cover-header">
              <img src="/premium.webp" alt="" className="pack-crown-icon" />
              <h1 className="pack-cover-title pack-cover-title-custom">
                {lang === 'en' ? 'Custom' : 'Personalizado'}
              </h1>
            </div>
            <p className="pack-header-description">
              {lang === 'es'
                ? '¡Tus diseños personalizados están en producción! Si aún no nos hemos puesto en contacto contigo para solicitar tus datos, utiliza el botón de abajo para comunicarte con nosotros.'
                : lang === 'en'
                  ? "Your custom arts are in production! If we haven't contacted you yet to request your information, use the button below to reach out."
                  : 'Suas artes personalizadas estão em produção! Se ainda não entramos em contato para solicitar suas informações, utilize o botão abaixo para falar conosco.'}
            </p>
          </div>

          {/* 3. Conteúdo direto (sem abas e sem espaçador vazio) */}
          <motion.div className="custom-body custom-body-centered" initial="hidden" animate="visible" variants={contentVariants}>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="custom-cta-secondary" style={{ maxWidth: '360px', margin: '0 auto' }}>
              {lang === 'es' ? 'Comunicarte con nosotros' : lang === 'en' ? 'Contact us' : 'Falar conosco'}
            </a>
          </motion.div>
        </div>
      </div>
    )
  }

  // ========================
  // STATE 3: Delivered
  // ========================
  const canvaFeedLink =
    deliveryLinks?.canva_feed_url || (!deliveryLinks?.canva_stories_url ? deliveryLinks?.canva_url : null)
  const canvaStoriesLink = deliveryLinks?.canva_stories_url
  const hasCanva = !!(canvaFeedLink || canvaStoriesLink)

  return (
    <div className="pack-detail-wrapper">
      <div className={`pack-detail-container ${selectedArt ? 'custom-modal-backdrop-blur' : ''}`}>
        {/* Botão Voltar */}
        <Link href={`/${lang}/pack/${pack.id}`} className="pack-detail-back-btn" aria-label="Voltar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* 1. Backdrop de Capa e Sombra */}
        <div className="pack-hero-backdrop">
          <img src={coverImage} alt={cleanName} className="pack-cover-img" />
          <img src="/sombra-cover.webp" alt="" className="pack-cover-shadow" aria-hidden="true" />
        </div>

        {/* 2. Header (Começa rigorosamente no mesmo pixel Y) */}
        <div className="pack-header-section">
          <div className="pack-cover-header">
            <img src="/premium.webp" alt="" className="pack-crown-icon" />
            <h1 className="pack-cover-title pack-cover-title-custom">
              {lang === 'en' ? 'Custom' : 'Personalizado'}
            </h1>
          </div>
          <p className="pack-header-description">
            {lang === 'es'
              ? 'Tus diseños personalizados están listos. Haz clic en un diseño para verlo y descargarlo.'
              : lang === 'en'
                ? 'Your custom arts are ready. Click on an art to view and download.'
                : 'Suas artes personalizadas estão prontas. Clique em uma arte para ver e baixar.'}
          </p>
        </div>

        {/* 3. Seção de Abas de Entrega (Artes prontas / Canva - Barra com Bolha Animada) */}
        {hasCanva && (
          <div className="pack-tabs-section">
            <div className="pack-tabs-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'ready'}
                className={`pack-tab-item ${activeTab === 'ready' ? 'active' : ''}`}
                onClick={() => setActiveTab('ready')}
              >
                {activeTab === 'ready' && (
                  <motion.div
                    layoutId="customTabsBubble"
                    className="pack-tab-bubble"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="pack-tab-label">
                  {lang === 'en' ? 'Ready arts' : lang === 'es' ? 'Artes listas' : 'Artes prontas'}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'canva'}
                className={`pack-tab-item ${activeTab === 'canva' ? 'active' : ''}`}
                onClick={() => setActiveTab('canva')}
              >
                {activeTab === 'canva' && (
                  <motion.div
                    layoutId="customTabsBubble"
                    className="pack-tab-bubble"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="pack-tab-label">Canva</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="custom-content-view">
          <AnimatePresence mode="wait">
            {/* TAB 1: ARTES PRONTAS */}
            {activeTab === 'ready' && (
              <motion.div
                key="tab-ready"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={listVariants}
                className="custom-ready-container"
              >
              {/* Top Action Bar: Baixar Tudo */}
              <div className="custom-download-all-bar">
                <motion.button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={downloadingAll || (feedFiles.length === 0 && !loadingFiles)}
                  className="custom-download-all-btn"
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="custom-download-icon-wrap">
                    {downloadingAll ? (
                      <span className="custom-button-spinner" />
                    ) : (
                      <img
                        src="/download-icon.svg"
                        alt=""
                        className="custom-download-all-icon"
                        width={22}
                        height={22}
                      />
                    )}
                  </span>
                  <span className="custom-download-all-title">
                    {downloadingAll
                      ? (lang === 'en' ? 'Compressing files (ZIP)...' : lang === 'es' ? 'Comprimiendo archivos (ZIP)...' : 'Compactando arquivos (ZIP)...')
                      : (lang === 'en' ? 'Download all' : lang === 'es' ? 'Descargar todo' : 'Baixar tudo')}
                  </span>
                </motion.button>
              </div>

              {/* Loading Skeleton */}
              {loadingFiles && (
                <div className="custom-arts-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="custom-art-card-skeleton" />
                  ))}
                </div>
              )}

              {/* Arts Grid (3 Columns) */}
              {!loadingFiles && feedFiles.length > 0 && (
                <motion.div className="custom-arts-grid" variants={listVariants}>
                  {feedFiles.map((file, idx) => {
                    const directThumb = file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+$/, '=s600') : null
                    const proxyThumb = `/api/drive/proxy-thumbnail?fileId=${file.id}`
                    const initialThumb = directThumb || proxyThumb

                    return (
                      <motion.div
                        key={file.id}
                        className="custom-art-card"
                        variants={rowVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleOpenArtModal(file, idx)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Arte ${idx + 1}`}
                      >
                        <div className="custom-art-img-wrapper">
                          <img
                            src={initialThumb}
                            alt={file.name}
                            loading="lazy"
                            className="custom-art-img"
                            onError={(e) => {
                              if (e.currentTarget.src !== proxyThumb && !e.currentTarget.src.endsWith(proxyThumb)) {
                                e.currentTarget.src = proxyThumb
                              }
                            }}
                          />
                          <div className="custom-art-overlay">
                            <span className="custom-art-download-icon">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* Empty State */}
              {!loadingFiles && feedFiles.length === 0 && (
                <div className="custom-empty-state">
                  <p>
                    {lang === 'en'
                      ? 'No arts found in the folder yet.'
                      : 'Nenhuma arte pronta encontrada na pasta ainda.'}
                  </p>
                  {deliveryLinks?.feed_url && (
                    <a
                      href={deliveryLinks.feed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="custom-cta-secondary"
                      style={{ marginTop: '16px', display: 'inline-block' }}
                    >
                      Abrir pasta no Google Drive
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: CANVA TEMPLATES */}
          {activeTab === 'canva' && (
            <motion.main
              className="pack-files-list"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={listVariants}
              key="tab-canva"
            >
              {canvaFeedLink && (
                <motion.a
                  href={canvaFeedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pack-file-row"
                  variants={rowVariants}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="version-format-icon">
                    <img src="/canva.png" alt="Canva" style={{ width: '28px', height: '28px' }} />
                  </div>
                  <div className="pack-file-info">
                    <h4 className="pack-file-title">
                      {lang === 'en' ? 'Canva Template (Feed)' : 'Template no Canva (Feed)'}
                    </h4>
                    <p className="pack-file-desc">2160×2880</p>
                  </div>
                </motion.a>
              )}

              {canvaStoriesLink && (
                <motion.a
                  href={canvaStoriesLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pack-file-row"
                  variants={rowVariants}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="version-format-icon version-format-stories">
                    <img src="/canva.png" alt="Canva" style={{ width: '28px', height: '28px' }} />
                  </div>
                  <div className="pack-file-info">
                    <h4 className="pack-file-title">
                      {lang === 'en' ? 'Canva Template (Stories)' : 'Template no Canva (Stories)'}
                    </h4>
                    <p className="pack-file-desc">2160×3840</p>
                  </div>
                </motion.a>
              )}
            </motion.main>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Art Detail Modal (Novo visual correspondente ao design) */}
      <AnimatePresence>
        {selectedArt && (
          <motion.div
            key="custom-art-modal-overlay"
            className="custom-art-modal-overlay"
            onClick={handleCloseModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <motion.div
              key="custom-art-modal-container"
              className="custom-art-modal-container"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.88, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{
                type: 'spring',
                damping: 26,
                stiffness: 320,
                mass: 0.8,
              }}
            >
              {/* Art Image com botão voltar sobre ela */}
              <div className="custom-art-modal-img-wrap">
                <button
                  type="button"
                  className="custom-art-modal-back-btn"
                  onClick={handleCloseModal}
                  aria-label={lang === 'en' ? 'Back' : 'Voltar'}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <ModalProgressiveImage
                  lowResSrc={
                    selectedArt.feedFile.thumbnailLink
                      ? selectedArt.feedFile.thumbnailLink.replace(/=s\d+$/, '=s600')
                      : `/api/drive/proxy-thumbnail?fileId=${selectedArt.feedFile.id}`
                  }
                  highResSrc={
                    selectedArt.feedFile.thumbnailLink
                      ? selectedArt.feedFile.thumbnailLink.replace(/=s\d+$/, '=s1600')
                      : `/api/drive/proxy-thumbnail?fileId=${selectedArt.feedFile.id}&size=1600`
                  }
                  fallbackSrc={`/api/drive/proxy-thumbnail?fileId=${selectedArt.feedFile.id}&size=1600`}
                  lowResFallbackSrc={`/api/drive/proxy-thumbnail?fileId=${selectedArt.feedFile.id}`}
                  alt={selectedArt.feedFile.name}
                />
              </div>

              {/* Painel lateral de ações e legenda (desktop à direita, mobile abaixo) */}
              <div className="custom-art-modal-sidebar">
                <div className="custom-art-modal-sidebar-top">
                  {/* Caption (Legenda padrão do pack) */}
                  {selectedArt.caption && (
                    <div className="custom-art-modal-caption">
                      <p>{selectedArt.caption.replace(/\s+/g, ' ').trim()}</p>
                    </div>
                  )}
                </div>

                <div className="custom-art-modal-actions-wrap">
                  {/* Action Buttons: Feed & Stories */}
                  <div className="custom-art-modal-btn-row">
                    <motion.button
                      type="button"
                      className="custom-art-modal-btn-download"
                      onClick={() => handleDownloadSingle(selectedArt.feedFile, 'feed')}
                      disabled={downloadingItem === `feed-${selectedArt.feedFile.id}`}
                      whileTap={{ scale: 0.97 }}
                    >
                      {downloadingItem === `feed-${selectedArt.feedFile.id}` ? (
                        <span className="custom-button-spinner custom-button-spinner-dark" />
                      ) : (
                        <img
                          src="/download-icon.svg"
                          alt=""
                          className="custom-art-modal-icon-download"
                          width={18}
                          height={18}
                        />
                      )}
                      <span>Feed</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      className={`custom-art-modal-btn-download ${!selectedArt.storyFile ? 'disabled' : ''}`}
                      onClick={() => {
                        if (selectedArt.storyFile) {
                          handleDownloadSingle(selectedArt.storyFile, 'story')
                        } else {
                          alert(
                            lang === 'en'
                              ? 'Stories format not available for this art'
                              : 'Formato Stories não disponível para esta arte'
                          )
                        }
                      }}
                      disabled={!selectedArt.storyFile || downloadingItem === `story-${selectedArt.storyFile?.id}`}
                      whileTap={selectedArt.storyFile ? { scale: 0.97 } : undefined}
                    >
                      {downloadingItem === `story-${selectedArt.storyFile?.id}` ? (
                        <span className="custom-button-spinner custom-button-spinner-dark" />
                      ) : (
                        <img
                          src="/download-icon.svg"
                          alt=""
                          className="custom-art-modal-icon-download"
                          width={18}
                          height={18}
                        />
                      )}
                      <span>Stories</span>
                    </motion.button>
                  </div>

                  {/* Copiar Legenda Button */}
                  {selectedArt.caption && (
                    <motion.button
                      type="button"
                      className={`custom-art-modal-btn-copy ${copiedCaption ? 'copied' : ''}`}
                      onClick={handleCopyCaption}
                      whileTap={{ scale: 0.98 }}
                    >
                      {copiedCaption ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{lang === 'en' ? 'Caption copied!' : lang === 'es' ? '¡Texto copiado!' : 'Legenda copiada!'}</span>
                        </>
                      ) : (
                        <>
                          <img src="/copy-icon.svg" alt="" width={18} height={18} className="copy-icon-img copy-icon-white" />
                          <span>{lang === 'en' ? 'Copy caption' : lang === 'es' ? 'Copiar texto' : 'Copiar legenda'}</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
