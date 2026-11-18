'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  submitCustomizationAction,
  saveOrderChosenVersionAction,
} from '@/app/admin/customization-actions'
import ModalProgressiveImage from '@/components/ModalProgressiveImage'

export interface ArtCustomField {
  id: string
  label: string
  placeholder?: string
}

export interface VersionItem {
  id: string
  name: string
  cover_image_url: string | null
  display_order: number
}

interface Art {
  id: string
  file_name: string
  drive_file_id: string
  thumbnail_url: string | null
  display_order: number
  client_instructions?: string | null
  client_inputs?: Record<string, string> | null
}

interface CustomizeFormProps {
  accessToken: string
  arts: Art[]
  artCustomFields?: Record<string, ArtCustomField[]>
  packName: string
  coverImage: string
  clientFirstName: string
  alreadySubmitted?: boolean
  initialGeneralNotes?: string
  lang?: string
  versions?: VersionItem[]
  initialChosenVersionId?: string | null
  initialChosenVersionName?: string | null
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
  hasFields,
  onClick,
}: {
  art: Art
  isFilled: boolean
  hasFields: boolean
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
      style={{ position: 'relative' }}
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

      {/* Badge no canto inferior indicando que a arte é padrão (sem textos para alterar) */}
      {!hasFields && (
        <span
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#a1a1aa',
            fontSize: '0.66rem',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        >
          Padrão
        </span>
      )}

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
  artCustomFields = {},
  packName,
  coverImage,
  clientFirstName,
  alreadySubmitted = false,
  initialGeneralNotes = '',
  lang = 'pt',
  versions = [],
  initialChosenVersionId = null,
  initialChosenVersionName = '',
}: CustomizeFormProps) {
  const isEs = lang === 'es'
  const hasVersions = !!versions && versions.length > 0

  function getArtNumber(art: Art): number {
    const numMatch = art.file_name.match(/^(\d+)/) || art.file_name.match(/(\d+)/)
    return numMatch ? parseInt(numMatch[1], 10) : (art.display_order != null ? art.display_order + 1 : 1)
  }

  function getFieldsForArt(art: Art): ArtCustomField[] {
    if (!artCustomFields) return []
    const num = getArtNumber(art)
    return (
      artCustomFields[String(num)] ||
      artCustomFields[String(art.display_order + 1)] ||
      artCustomFields[String(art.display_order)] ||
      artCustomFields[art.file_name] ||
      artCustomFields[art.file_name.replace(/\.[^.]+$/, '')] ||
      []
    )
  }

  const texts = {
    badge: isEs ? 'PERSONALIZACIÓN' : 'PERSONALIZAÇÃO',
    step1Badge: isEs ? 'PASO 1 DE 2 • COLORES' : 'ETAPA 1 DE 2 • CORES',
    step1Title: isEs ? 'Elige la versión de colores' : 'Escolha a versão de cores',
    step1Desc: isEs
      ? 'Selecciona la combinación de colores que mejor combine con tu marca. En el siguiente paso podrás indicar las informaciones de cada diseño.'
      : 'Selecione a combinação de cores que melhor combina com o seu provedor. Na próxima etapa você poderá preencher as informações de cada arte.',
    step1Btn: isEs ? 'Continuar con esta versión' : 'Continuar com esta versão',
    step2Badge: isEs ? 'PASO 2 DE 2 • INFORMACIÓN' : 'ETAPA 2 DE 2 • INFORMAÇÕES',
    step2ChangeColor: isEs ? 'Cambiar color' : 'Trocar cor',
    greeting: clientFirstName
      ? (isEs ? `¡Bienvenido, ${clientFirstName}!` : `Bem-vindo, ${clientFirstName}!`)
      : (isEs ? '¡Bienvenido!' : 'Bem-vindo!'),
    description: isEs
      ? 'Completa los datos que deben reemplazar la información de cada diseño, como planes, precios y datos de contacto. Si algún diseño no necesita cambios, no es necesario completar sus datos.'
      : 'Preencha os dados que devem substituir as informações de cada arte, como planos, preços e contatos. Se alguma arte não precisar de alterações, não é necessário preenchê-la.',
    gridHint: hasVersions
      ? (isEs
          ? 'Haz clic en un diseño para completar la información. Los colores de estos diseños son solo ilustrativos para la recopilación de datos (tu pack final será entregado en la versión que elegiste).'
          : 'Clique em uma arte para preencher as informações. As cores destas artes são apenas ilustrativas para a coleta dos dados (seu pack final será entregue na versão que você escolheu).')
      : (isEs
          ? 'Haz clic en un diseño para completar la información.'
          : 'Clique em uma arte para preencher as informações.'),
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

  // Versão de cor escolhida e controle de etapa
  const [chosenVersionId, setChosenVersionId] = useState<string | null>(initialChosenVersionId || null)
  const [chosenVersionName, setChosenVersionName] = useState<string>(initialChosenVersionName || '')
  const [step, setStep] = useState<'color' | 'arts'>(() => {
    if (!hasVersions) return 'arts'
    return 'color'
  })

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

  // Valores estruturados dos inputs por arte: { [artId]: { [fieldId]: 'valor' } }
  const [artFieldValues, setArtFieldValues] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {}
    for (const art of arts) {
      if (art.client_inputs && typeof art.client_inputs === 'object') {
        initial[art.id] = { ...art.client_inputs }
      }
    }
    return initial
  })

  const [generalNotes, setGeneralNotes] = useState(initialGeneralNotes)
  const [editingArt, setEditingArt] = useState<Art | null>(null)
  const [previewingVersion, setPreviewingVersion] = useState<VersionItem | null>(null)
  const [tempFieldValues, setTempFieldValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(alreadySubmitted)
  const [error, setError] = useState('')

  const chosenVersionCover =
    versions.find(v => v.id === chosenVersionId)?.cover_image_url ||
    coverImage

  async function handleConfirmVersion(v: VersionItem) {
    setChosenVersionId(v.id)
    setChosenVersionName(v.name)
    saveOrderChosenVersionAction(accessToken, v.id, v.name).catch(console.error)
    setPreviewingVersion(null)
    setStep('arts')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function isArtFilled(art: Art): boolean {
    const fields = getFieldsForArt(art)
    if (fields.length === 0) return false
    const values = artFieldValues[art.id] || {}
    return fields.some(f => values[f.id] && values[f.id].trim().length > 0)
  }

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
        if (parsed.artFieldValues && typeof parsed.artFieldValues === 'object') {
          setArtFieldValues(prev => ({
            ...prev,
            ...parsed.artFieldValues,
          }))
        }
        if (typeof parsed.generalNotes === 'string' && parsed.generalNotes.trim().length > 0) {
          setGeneralNotes(parsed.generalNotes)
        }
        if (parsed.chosenVersionId && !initialChosenVersionId) {
          setChosenVersionId(parsed.chosenVersionId)
        }
        if (parsed.chosenVersionName && !initialChosenVersionName) {
          setChosenVersionName(parsed.chosenVersionName)
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar rascunho do localStorage:', err)
    }
  }, [accessToken, initialChosenVersionId, initialChosenVersionName])

  // 2. Persistência de Dados: Salva rascunho automaticamente a cada alteração
  useEffect(() => {
    if (typeof window === 'undefined' || !accessToken || submitted) return
    try {
      const dataToSave = {
        instructions,
        artFieldValues,
        generalNotes,
        chosenVersionId,
        chosenVersionName,
      }
      localStorage.setItem(`cust_draft_${accessToken}`, JSON.stringify(dataToSave))
    } catch (err) {
      console.warn('Erro ao salvar rascunho no localStorage:', err)
    }
  }, [instructions, artFieldValues, generalNotes, chosenVersionId, chosenVersionName, accessToken, submitted])

  // Controla overflow do body para manter o mesmo scroll ao fechar qualquer modal
  useEffect(() => {
    if (!editingArt && !previewingVersion) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [editingArt, previewingVersion])

  function handleOpenArtModal(art: Art) {
    setEditingArt(art)
    const existing = artFieldValues[art.id] || {}
    setTempFieldValues({ ...existing })
  }

  function handleSaveAndCloseArtModal() {
    if (editingArt) {
      const currentValues = { ...tempFieldValues }
      setArtFieldValues(prev => ({
        ...prev,
        [editingArt.id]: currentValues,
      }))

      // Formatar instructions legíveis com rótulo e valor
      const fields = getFieldsForArt(editingArt)
      const lines: string[] = []
      for (const f of fields) {
        const val = currentValues[f.id]?.trim()
        if (val) {
          lines.push(`${f.label}: ${val}`)
        }
      }
      setInstructions(prev => ({
        ...prev,
        [editingArt.id]: lines.join('\n'),
      }))
    }
    setEditingArt(null)
  }

  function handleCloseArtModal() {
    handleSaveAndCloseArtModal()
  }

  const modalFields = editingArt ? getFieldsForArt(editingArt) : []
  const hasModalFields = modalFields.length > 0

  const hasAtLeastOneFilled =
    arts.some(art => isArtFilled(art) || (instructions[art.id] || '').trim().length > 0) ||
    Object.values(artFieldValues).some(values =>
      Object.values(values).some(val => typeof val === 'string' && val.trim().length > 0)
    )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || !hasAtLeastOneFilled) return

    setSubmitting(true)
    setError('')

    const payload = arts.map(art => {
      const fields = getFieldsForArt(art)
      const values = artFieldValues[art.id] || {}
      const lines: string[] = []
      for (const f of fields) {
        const val = values[f.id]?.trim()
        if (val) {
          lines.push(`${f.label}: ${val}`)
        }
      }
      return {
        art_id: art.id,
        instructions: lines.join('\n'),
        inputs: values,
      }
    })

    const formData = new FormData()
    formData.append('access_token', accessToken)
    formData.append('general_notes', generalNotes.trim())
    formData.append('arts_instructions', JSON.stringify(payload))
    if (chosenVersionId) {
      formData.append('chosen_version_id', chosenVersionId)
    }
    if (chosenVersionName) {
      formData.append('chosen_version_name', chosenVersionName)
    }

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
        ) : step === 'color' && hasVersions ? (
          <motion.div
            key="customize-step-color"
            className="cust-flow-container"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
          >
            {/* 1. Backdrop de Capa e Sombra */}
            <div className="pack-hero-backdrop">
              <img src={coverImage} alt={packName} className="pack-cover-img" />
              <img src="/sombra-cover.webp" alt="" className="pack-cover-shadow" aria-hidden="true" />
            </div>

            {/* 2. Header Etapa 1 */}
            <motion.div className="pack-header-section" variants={headerVariants}>
              <div className="pack-cover-header">
                <img src="/premium.webp" alt="" className="pack-crown-icon" />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', color: '#FFB742' }}>
                  {texts.step1Badge}
                </span>
              </div>
              <h1 className="pack-cover-title" style={{ marginTop: '2px' }}>
                {texts.step1Title}
              </h1>
              <p className="pack-header-description" style={{ marginTop: '8px' }}>
                {texts.step1Desc}
              </p>
            </motion.div>

            {/* 3. Dica da Etapa */}
            <div className="cust-grid-hint">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cust-grid-hint-icon">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="cust-grid-hint-text">
                {isEs ? 'Haz clic en una versión para verla y seleccionarla.' : 'Clique em uma versão para ver e selecionar.'}
              </span>
            </div>

            {/* 4. Grade das Versões de Cores (Estilo PackCard Dashboard - 1 coluna no mobile) */}
            <div className="cust-versions-grid">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  onClick={() => setPreviewingVersion(ver)}
                  className="pack-card unlocked cust-version-card"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setPreviewingVersion(ver)
                    }
                  }}
                >
                  <div className="pack-card-media">
                    <img
                      src={ver.cover_image_url || coverImage}
                      alt={ver.name}
                      className="pack-card-img"
                      loading="lazy"
                    />
                    <img
                      src="/sombra-card.webp"
                      alt=""
                      className="pack-card-shadow-img"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="pack-card-footer">
                    <h3 className="pack-card-title">{ver.name}</h3>
                  </div>
                </div>
              ))}
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
              <img src={chosenVersionCover || coverImage} alt={packName} className="pack-cover-img" />
              <img src="/sombra-cover.webp" alt="" className="pack-cover-shadow" aria-hidden="true" />
            </div>

            {/* 2. Header (Começa rigorosamente no mesmo pixel Y) */}
            <motion.div className="pack-header-section" variants={headerVariants}>
              <div className="pack-cover-header">
                <img src="/premium.webp" alt="" className="pack-crown-icon" />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', color: '#FFB742' }}>
                  {hasVersions ? texts.step2Badge : texts.badge}
                </span>
              </div>
              <h1 className="pack-cover-title" style={{ marginTop: '2px' }}>
                {texts.greeting}
              </h1>
              <p className="pack-header-description" style={{ marginTop: '8px' }}>
                {texts.description}
              </p>
            </motion.div>

            {/* Indicação da cor escolhida (clicável para trocar) */}
            {hasVersions && chosenVersionName && (
              <div className="cust-chosen-version-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setStep('color')
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                  className="cust-chosen-version-btn"
                  title={isEs ? 'Haz clic para cambiar de color' : 'Clique para trocar a versão de cor'}
                  aria-label={isEs ? 'Cambiar versión de color' : 'Trocar versão de cor'}
                >
                  {chosenVersionCover && (
                    <img
                      src={chosenVersionCover}
                      alt={chosenVersionName}
                      className="cust-chosen-version-thumb"
                    />
                  )}
                  <span className="cust-chosen-version-name">{chosenVersionName}</span>
                </button>
              </div>
            )}

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
                  const fields = getFieldsForArt(art)
                  const hasFields = fields.length > 0
                  const isFilled = isArtFilled(art) || (instructions[art.id] || '').trim().length > 0
                  return (
                    <ArtGridCard
                      key={art.id}
                      art={art}
                      hasFields={hasFields}
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
                disabled={submitting || !hasAtLeastOneFilled}
                className="cust-main-submit-btn"
                whileHover={!submitting && hasAtLeastOneFilled ? { scale: 1.015 } : undefined}
                whileTap={!submitting && hasAtLeastOneFilled ? { scale: 0.98 } : undefined}
                title={!hasAtLeastOneFilled ? (isEs ? 'Completa los datos de al menos un diseño para enviar' : 'Preencha as informações de pelo menos uma arte para enviar') : undefined}
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

      {/* Modal Isolado de Preview da Versão de Cores */}
      <AnimatePresence>
        {previewingVersion && (
          <motion.div
            key="cust-version-preview-overlay"
            className="cust-version-preview-overlay"
            onClick={() => setPreviewingVersion(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="cust-version-preview-container"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            >
              {/* Botão fechar */}
              <button
                type="button"
                className="cust-version-preview-close-btn"
                onClick={() => setPreviewingVersion(null)}
                aria-label={isEs ? 'Cerrar' : 'Fechar'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Card isolado */}
              <div className="pack-card unlocked" style={{ width: '100%' }}>
                <div className="pack-card-media">
                  <img
                    src={previewingVersion.cover_image_url || coverImage}
                    alt={previewingVersion.name}
                    className="pack-card-img"
                  />
                  <img
                    src="/sombra-card.webp"
                    alt=""
                    className="pack-card-shadow-img"
                    aria-hidden="true"
                  />
                </div>
                <div className="pack-card-footer">
                  <h3 className="pack-card-title">{previewingVersion.name}</h3>
                </div>
              </div>

              {/* Botão selecionar esta versão */}
              <motion.button
                type="button"
                onClick={() => handleConfirmVersion(previewingVersion)}
                className="cust-version-preview-select-btn"
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{isEs ? 'Seleccionar esta versión' : 'Selecionar esta versão'}</span>
              </motion.button>
            </motion.div>
          </motion.div>
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

              {/* Painel lateral direito no desktop (ou abaixo no mobile) */}
              <div className="custom-art-modal-sidebar cust-briefing-modal-sidebar">
                {hasModalFields ? (
                  <>
                    <div className="cust-briefing-sidebar-header">
                      <h3 className="cust-briefing-sidebar-title">
                        {isEs ? 'Información para este diseño' : 'Informações para esta arte'}
                      </h3>
                      <p className="cust-briefing-sidebar-desc">
                        {isEs
                          ? 'Completa los campos abajo con los textos que deseas en este diseño.'
                          : 'Preencha os campos abaixo com os textos que deseja nesta arte.'}
                      </p>
                    </div>

                    {/* Inputs dinâmicos para as informações configuradas */}
                    <div
                      className="cust-modal-input-area"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        maxHeight: '52vh',
                        overflowY: 'auto',
                        paddingRight: '4px',
                        marginBottom: '16px',
                      }}
                    >
                      {modalFields.map((field, idx) => (
                        <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label
                            htmlFor={`cust-field-${field.id}`}
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              color: '#E4E4E7',
                            }}
                          >
                            {field.label}
                          </label>
                          <input
                            id={`cust-field-${field.id}`}
                            type="text"
                            placeholder={field.placeholder || (isEs ? 'Escribe aquí...' : 'Digite aqui...')}
                            value={tempFieldValues[field.id] || ''}
                            onChange={e =>
                              setTempFieldValues(prev => ({
                                ...prev,
                                [field.id]: e.target.value,
                              }))
                            }
                            autoFocus={idx === 0}
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              borderRadius: '10px',
                              backgroundColor: '#18181B',
                              border: '1px solid #27272A',
                              color: '#FAFAFA',
                              fontSize: '0.9rem',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      ))}
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
                  </>
                ) : (
                  <>
                    <div className="cust-briefing-sidebar-header" style={{ marginBottom: '16px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#A1A1AA',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          marginBottom: '12px',
                          width: 'fit-content',
                        }}
                      >
                        <span>🎨 {isEs ? 'Diseño Estándar' : 'Arte Padrão'}</span>
                      </div>
                      <h3 className="cust-briefing-sidebar-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                        {isEs ? 'Diseño sin textos para alterar' : 'Arte sem textos para alteração'}
                      </h3>
                      <p className="cust-briefing-sidebar-desc" style={{ color: '#A1A1AA', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        {isEs
                          ? 'Este diseño no requiere textos ni información adicional. Se personalizará aplicando el logotipo y la identidad visual oficial de su marca.'
                          : 'Esta arte não requer textos ou informações adicionais. Ela será personalizada aplicando o logotipo e a identidade visual oficial da sua marca.'}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(24, 24, 27, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#A1A1AA',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '20px',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✨</span>
                      <div>
                        <strong style={{ color: '#E4E4E7', display: 'block', marginBottom: '3px' }}>
                          {isEs ? 'Todo listo para este diseño' : 'Tudo pronto para esta arte'}
                        </strong>
                        <span>
                          {isEs
                            ? 'No necesitas escribir nada. Haz clic en Entendido para continuar.'
                            : 'Você não precisa digitar nada aqui. Basta clicar em Entendido para continuar.'}
                        </span>
                      </div>
                    </div>

                    {/* Botão Entendido */}
                    <motion.button
                      type="button"
                      className="cust-modal-conclude-btn"
                      onClick={handleSaveAndCloseArtModal}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isEs ? 'Entendido' : 'Entendido'}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
