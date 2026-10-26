'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { submitCustomizationAction } from '@/app/admin/customization-actions'
import ModalProgressiveImage from '@/components/ModalProgressiveImage'

interface Art {
  id: string
  file_name: string
  drive_file_id: string
  thumbnail_url: string | null
  display_order: number
  client_instructions?: string | null
}

interface CustomizeFormProps {
  accessToken: string
  arts: Art[]
  packName: string
  coverImage: string
  clientFirstName: string
  alreadySubmitted?: boolean
  initialGeneralNotes?: string
  lang?: string
}

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.25, ease: 'easeInOut' as const },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const hintVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.12 },
  },
}

const artCardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const successVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: -14,
    transition: { duration: 0.25, ease: 'easeInOut' as const },
  },
}

function ArtGridCard({
  art,
  isFilled,
  onClick,
}: {
  art: Art
  isFilled: boolean
  onClick: () => void
}) {
  const [loaded, setLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const thumb = art.drive_file_id
    ? `/api/drive/proxy-thumbnail?fileId=${art.drive_file_id}`
    : (art.thumbnail_url || '')

  return (
    <motion.div
      className="cust-art-grid-item"
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={art.file_name}
    >
      <div className="cust-art-grid-img-wrap">
        {!loaded && !hasError && (
          <div className="skeleton-art-card cust-art-placeholder" />
        )}
        {hasError ? (
          <div className="cust-art-fallback">
            <span className="cust-art-fallback-icon">🎨</span>
            <span className="cust-art-fallback-label">
              {art.display_order || art.file_name.replace(/\.[^/.]+$/, '')}
            </span>
          </div>
        ) : (
          <img
            src={thumb}
            alt={art.file_name}
            width={400}
            height={500}
            className={`cust-art-grid-img ${isFilled ? 'filled' : ''} ${loaded ? 'loaded' : ''}`}
            loading={art.display_order <= 12 ? 'eager' : 'lazy'}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setHasError(true)
              setLoaded(true)
            }}
            ref={(img) => {
              if (img && img.complete && img.naturalWidth > 0 && !loaded) {
                setLoaded(true)
              }
            }}
          />
        )}
      </div>

      {/* Checkzinho no canto superior esquerdo com animação fluida de entrada e saída */}
      <AnimatePresence>
        {isFilled && (
          <motion.div
            className="cust-art-grid-check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function CustomizeForm({
  accessToken,
  arts,
  packName,
  coverImage,
  clientFirstName,
  alreadySubmitted = false,
  initialGeneralNotes = '',
  lang = 'pt',
}: CustomizeFormProps) {
  const isEs = lang === 'es'

  const texts = {
    badge: isEs ? 'PERSONALIZACIÓN' : 'PERSONALIZAÇÃO',
    greeting: clientFirstName
      ? (isEs ? `¡Bienvenido, ${clientFirstName}!` : `Bem-vindo, ${clientFirstName}!`)
      : (isEs ? '¡Bienvenido!' : 'Bem-vindo!'),
    description: isEs
      ? 'Completa los datos que deben reemplazar la información de cada diseño, como planes, precios y datos de contacto. Si algún diseño no necesita cambios, no es necesario completar sus datos.'
      : 'Preencha os dados que devem substituir as informações de cada arte, como planos, preços e contatos. Se alguma arte não precisar de alterações, não é necessário preenchê-la.',
    gridHint: isEs
      ? 'Haz clic en un diseño para completar la información.'
      : 'Clique em uma arte para preencher as informações.',
    emptyArts: isEs
      ? 'Los diseños de este pack están siendo preparados por nuestro equipo. ¡Pronto podrás completar los detalles aquí!'
      : 'As artes deste pack estão sendo preparadas pela nossa equipe. Em breve você poderá preencher os detalhes aqui!',
    notesTitle: isEs ? '¿Alguna observación?' : 'Alguma observação?',
    submitBtn: isEs ? 'Enviar información' : 'Enviar informações',
    submittingBtn: isEs ? 'Enviando información...' : 'Enviando informações...',
    modalPlaceholder: isEs ? '300 megas\n79,90' : '300 mega\n79,90',
    modalConclude: isEs ? 'Concluir' : 'Concluir',
    successTitle: isEs ? '¡Información enviada!' : 'Informações enviadas!',
    successDescPrefix: isEs
      ? 'Recibimos los datos de personalización de tu pack '
      : 'Recebemos os dados de personalização do seu pack ',
    successDescSuffix: isEs
      ? '. ¡Ya estamos preparando tus diseños y te avisaremos cuando estén listos!'
      : '. Já estamos preparando suas artes e avisaremos assim que estiverem prontas!',
    errorSubmit: isEs
      ? 'Error al enviar la información. Inténtalo de nuevo.'
      : 'Erro ao enviar informações. Tente novamente.',
  }

  // Inicializa as instruções das artes com dados vindos do banco
  const [instructions, setInstructions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const art of arts) {
      if (art.client_instructions) {
        initial[art.id] = art.client_instructions
      }
    }
    return initial
  })

  const [generalNotes, setGeneralNotes] = useState(initialGeneralNotes)
  const [editingArt, setEditingArt] = useState<Art | null>(null)
  const [tempText, setTempText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(alreadySubmitted)
  const [error, setError] = useState('')

  // 1. Persistência de Dados: Recupera rascunho salvo no navegador ao abrir
  useEffect(() => {
    if (typeof window === 'undefined' || !accessToken) return
    try {
      const saved = localStorage.getItem(`cust_draft_${accessToken}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.instructions && typeof parsed.instructions === 'object') {
          setInstructions(prev => ({
            ...prev,
            ...parsed.instructions,
          }))
        }
        if (typeof parsed.generalNotes === 'string' && parsed.generalNotes.trim().length > 0) {
          setGeneralNotes(parsed.generalNotes)
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar rascunho do localStorage:', err)
    }
  }, [accessToken])

  // 2. Persistência de Dados: Salva rascunho automaticamente a cada alteração
  useEffect(() => {
    if (typeof window === 'undefined' || !accessToken || submitted) return
    try {
      const dataToSave = {
        instructions,
        generalNotes,
      }
      localStorage.setItem(`cust_draft_${accessToken}`, JSON.stringify(dataToSave))
    } catch (err) {
      console.warn('Erro ao salvar rascunho no localStorage:', err)
    }
  }, [instructions, generalNotes, accessToken, submitted])

  // Controla overflow do body para manter o mesmo scroll ao fechar o modal
  useEffect(() => {
    if (!editingArt) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [editingArt])

  function handleOpenArtModal(art: Art) {
    setEditingArt(art)
    setTempText(instructions[art.id] || '')
  }

  function handleSaveAndCloseArtModal() {
    if (editingArt) {
      setInstructions(prev => ({
        ...prev,
        [editingArt.id]: tempText.trim(),
      }))
    }
    setEditingArt(null)
  }

  function handleCloseArtModal() {
    if (editingArt && tempText.trim() !== (instructions[editingArt.id] || '').trim()) {
      setInstructions(prev => ({
        ...prev,
        [editingArt.id]: tempText.trim(),
      }))
    }
    setEditingArt(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.append('access_token', accessToken)
    formData.append('general_notes', generalNotes.trim())
    formData.append(
      'arts_instructions',
      JSON.stringify(
        arts.map(art => ({
          art_id: art.id,
          instructions: (instructions[art.id] || '').trim(),
        }))
      )
    )

    try {
      const result = await submitCustomizationAction(formData)
      if (result?.error) {
        setError(result.error)
        setSubmitting(false)
        return
      }
      if (result?.success) {
        try {
          localStorage.removeItem(`cust_draft_${accessToken}`)
        } catch {}
        setSubmitted(true)
      }
    } catch {
      setError(texts.errorSubmit)
      setSubmitting(false)
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="customize-success"
            className="cust-flow-wrapper"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={successVariants}
          >
            <div className="cust-success-screen">
              <div className="cust-success-view">
                <div className="cust-success-icon-wrap">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="cust-success-title">{texts.successTitle}</h2>
                <p className="cust-success-desc">
                  {texts.successDescPrefix}<strong>{packName}</strong>{texts.successDescSuffix}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="customize-form"
            onSubmit={handleSubmit}
            className="cust-flow-container"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
          >
            {/* 1. Backdrop de Capa e Sombra (sem botão voltar no topo da página) */}
            <div className="pack-hero-backdrop">
              <img src={coverImage} alt={packName} className="pack-cover-img" />
              <img src="/sombra-cover.webp" alt="" className="pack-cover-shadow" aria-hidden="true" />
            </div>

            {/* 2. Header (Começa rigorosamente no mesmo pixel Y) */}
            <motion.div className="pack-header-section" variants={headerVariants}>
              <div className="pack-cover-header">
                <img src="/premium.webp" alt="" className="pack-crown-icon" />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', color: '#FFB742' }}>
                  {texts.badge}
                </span>
              </div>
              <h1 className="pack-cover-title" style={{ marginTop: '2px' }}>
                {texts.greeting}
              </h1>
              <p className="pack-header-description" style={{ marginTop: '8px' }}>
                {texts.description}
              </p>
            </motion.div>

            {/* 3. Dica com ícone (i) */}
            <div className="cust-grid-hint">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cust-grid-hint-icon">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="cust-grid-hint-text">
                {texts.gridHint}
              </span>
            </div>

            {/* 4. Grade com todas as artes (3 colunas) */}
            {arts.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#71717A' }}>
                <p>{texts.emptyArts}</p>
              </div>
            ) : (
              <div className="cust-arts-grid">
                {arts.map((art) => {
                  const isFilled = (instructions[art.id] || '').trim().length > 0
                  return (
                    <ArtGridCard
                      key={art.id}
                      art={art}
                      isFilled={isFilled}
                      onClick={() => handleOpenArtModal(art)}
                    />
                  )
                })}
              </div>
            )}

            {/* 5. Botão de Enviar Informações */}
            <div className="cust-submit-section">
              {error && (
                <div className="cust-error-banner">
                  ⚠️ {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={submitting}
                className="cust-main-submit-btn"
                whileHover={!submitting ? { scale: 1.015 } : undefined}
                whileTap={!submitting ? { scale: 0.98 } : undefined}
              >
                {submitting ? (
                  <>
                    <span className="custom-button-spinner custom-button-spinner-dark" />
                    <span>{texts.submittingBtn}</span>
                  </>
                ) : (
                  <span>{texts.submitBtn}</span>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 6. Modal de Expansão da Arte (com botão voltar para fechar) */}
      <AnimatePresence>
        {editingArt && (
          <motion.div
            key="custom-briefing-modal-overlay"
            className="custom-art-modal-overlay"
            onClick={handleCloseArtModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <motion.div
              key="custom-briefing-modal-container"
              className="custom-art-modal-container cust-briefing-modal-container"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.88, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 340,
                mass: 0.8,
              }}
            >
              {/* Arte expandida com botão voltar sobre ela */}
              <div className="custom-art-modal-img-wrap cust-briefing-modal-img-wrap">
                <motion.button
                  type="button"
                  className="custom-art-modal-back-btn"
                  onClick={handleCloseArtModal}
                  aria-label={isEs ? 'Volver' : 'Voltar'}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <ModalProgressiveImage
                  lowResSrc={
                    editingArt.drive_file_id
                      ? `/api/drive/proxy-thumbnail?fileId=${editingArt.drive_file_id}`
                      : (editingArt.thumbnail_url || '')
                  }
                  highResSrc={
                    editingArt.drive_file_id
                      ? `/api/drive/proxy-thumbnail?fileId=${editingArt.drive_file_id}&size=1600`
                      : (editingArt.thumbnail_url || '')
                  }
                  fallbackSrc={editingArt.thumbnail_url || undefined}
                  alt={editingArt.file_name}
                />
              </div>

              {/* Input abaixo da arte para as informações */}
              <div className="cust-modal-input-area">
                <textarea
                  value={tempText}
                  onChange={e => setTempText(e.target.value)}
                  placeholder={texts.modalPlaceholder}
                  className="cust-modal-textarea"
                  rows={3}
                />
              </div>

              {/* Botão branco 'Concluir' */}
              <motion.button
                type="button"
                className="cust-modal-conclude-btn"
                onClick={handleSaveAndCloseArtModal}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
              >
                {texts.modalConclude}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
