'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { updatePackAction } from '../../../actions'
import CoverDropzone from '@/components/admin/CoverDropzone'
import PackArtsDriveUploader, { DriveFileItem } from '@/components/admin/PackArtsDriveUploader'

// ===== INTERFACES =====
interface DriveArtItem {
  id: string
  number: number
  name: string
  thumbnailUrl: string
}
export interface ArtCustomField {
  id: string
  label: string
  placeholder?: string
}

interface Pack {
  id: string
  hotmart_id: string
  name: string
  release_date: string | null
  cover_image_url: string | null
  language: string
  category_id: string | null
  section_order: string[] | null
  buy_link: string | null
  parent_pack_id: string | null
  version: string
  hide_when_locked: boolean
  drive_arts_folder_id?: string | null
  arts_folder: string | null
  art_captions: Record<string, string> | null
  art_custom_fields?: Record<string, ArtCustomField[]> | null
}

interface ParentPackOption { id: string; name: string }
interface PackLink { id: string; label_pt: string; label_es: string; label_en: string; url: string; display_order: number; category: string; subsection_id: string | null }
interface Subsection { id: string; name_pt: string; name_es: string; name_en: string; icon: string; display_order: number }
interface Category { id: string; name: string; tag: string }
interface Icon { id: string; name: string; image_url: string }

export interface PackVersionLink {
  id?: string
  version_id?: string
  platform: 'canva' | 'photoshop'
  format: 'feed' | 'stories'
  url: string
  label_pt?: string
  label_es?: string
  label_en?: string
  display_order: number
}

export interface PackVersion {
  id: string
  pack_id: string
  name: string
  cover_image_url: string | null
  display_order: number
  pack_version_links?: PackVersionLink[]
}

export interface PackComplement {
  id: string
  pack_id: string
  type: 'stories' | 'custom'
  hotmart_id: string | null
  hotmart_id_secondary?: string | null
  buy_link: string | null
  price: number | null
  is_active: boolean
  display_order: number
}


interface VersionFormLink {
  _key: string
  id?: string
  platform: 'canva' | 'photoshop'
  format: 'feed' | 'stories'
  url: string
  label_pt: string
  label_es?: string
  label_en?: string
  display_order: number
  _delete?: boolean
}

interface VersionFormItem {
  _key: string
  id?: string
  name: string
  cover_image_url: string
  display_order: number
  _delete?: boolean
  links: VersionFormLink[]
}

interface Props {
  pack: Pack
  existingLinks: PackLink[]
  existingSubsections: Subsection[]
  categories: Category[]
  icons: Icon[]
  parentPacks: ParentPackOption[]
  existingVersions: PackVersion[]
  existingComplements: PackComplement[]
}

export default function EditPackForm({
  pack,
  existingLinks,
  categories,
  existingVersions,
  existingComplements,
}: Props) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Capa geral do pack
  const [mainCoverUrl, setMainCoverUrl] = useState(pack.cover_image_url || '')

  // Google Drive Arts Folder ID
  const [driveArtsFolderId, setDriveArtsFolderId] = useState(pack.drive_arts_folder_id || '')
  const [driveArts, setDriveArts] = useState<DriveArtItem[]>([])
  const [loadingDriveArts, setLoadingDriveArts] = useState(false)

  // Processa e alinha as artes carregadas do Google Drive
  const handleDriveFilesLoaded = useCallback((files: DriveFileItem[]) => {
    const parsed: DriveArtItem[] = (files || [])
      .filter(f => f.mimeType?.startsWith('image/') || f.name?.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i))
      .map((f, idx) => {
        const numMatch = f.name.match(/^(\d+)/) || f.name.match(/(\d+)/)
        const number = numMatch ? parseInt(numMatch[1], 10) : idx + 1
        const thumbnailUrl = f.thumbnailLink
          ? f.thumbnailLink.replace(/=s\d+$/, '=s800')
          : `/api/drive/proxy-thumbnail?fileId=${f.id}`
        return {
          id: f.id,
          number,
          name: f.name,
          thumbnailUrl,
        }
      })
      .sort((a, b) => a.number - b.number)

    setDriveArts(parsed)

    // Se localArts estiver vazio, preenche automaticamente com os números do Drive
    setLocalArts(prev => {
      if (prev.length === 0 && parsed.length > 0) {
        return parsed.map(a => a.number)
      }
      return prev
    })
  }, [])

  // Carrega as artes da pasta do Google Drive na inicialização
  const loadDriveArts = useCallback(async (folderId: string) => {
    if (!folderId) {
      setDriveArts([])
      return
    }
    setLoadingDriveArts(true)
    try {
      const res = await fetch(`/api/drive/list-files?folderId=${encodeURIComponent(folderId)}`)
      const data = await res.json()
      if (res.ok && Array.isArray(data.files)) {
        handleDriveFilesLoaded(data.files)
      }
    } catch (e) {
      console.error('Erro ao carregar artes do Drive para legendas:', e)
    } finally {
      setLoadingDriveArts(false)
    }
  }, [handleDriveFilesLoaded])

  useEffect(() => {
    if (driveArtsFolderId) {
      loadDriveArts(driveArtsFolderId)
    }
  }, [driveArtsFolderId, loadDriveArts])

  // Arts folder (local)
  const [artsFolder, setArtsFolder] = useState(pack.arts_folder || '')
  const [localArts, setLocalArts] = useState<number[]>(() => {
    if (pack.art_captions) {
      const keys = Object.keys(pack.art_captions)
        .map(k => parseInt(k, 10))
        .filter(n => !isNaN(n))
      if (keys.length > 0) {
        return keys.sort((a, b) => a - b)
      }
    }
    return []
  })
  const [localArtCaptions, setLocalArtCaptions] = useState<Record<number, string>>(() => {
    const captions: Record<number, string> = {}
    if (pack.art_captions) {
      for (const [key, val] of Object.entries(pack.art_captions)) {
        captions[parseInt(key, 10)] = val
      }
    }
    return captions
  })

  // Campos de personalização por arte
  const [artCustomFields, setArtCustomFields] = useState<Record<string, ArtCustomField[]>>(() => {
    return (pack.art_custom_fields as Record<string, ArtCustomField[]>) || {}
  })
  const [editingFieldsArtNum, setEditingFieldsArtNum] = useState<number | null>(null)
  const [tempCustomFields, setTempCustomFields] = useState<ArtCustomField[]>([])
  const [copyFromArtNum, setCopyFromArtNum] = useState<string>('')

  function handleOpenFieldsModal(num: number) {
    setEditingFieldsArtNum(num)
    const existing = artCustomFields[String(num)] || []
    setTempCustomFields(JSON.parse(JSON.stringify(existing)))
    setCopyFromArtNum('')
  }

  function handleSaveFieldsModal() {
    if (editingFieldsArtNum !== null) {
      const cleaned = tempCustomFields
        .map(f => ({ ...f, label: f.label.trim(), placeholder: f.placeholder?.trim() || '' }))
        .filter(f => f.label.length > 0)

      setArtCustomFields(prev => {
        const copy = { ...prev }
        if (cleaned.length > 0) {
          copy[String(editingFieldsArtNum)] = cleaned
        } else {
          delete copy[String(editingFieldsArtNum)]
        }
        return copy
      })
    }
    setEditingFieldsArtNum(null)
  }

  function handleAddFieldToModal() {
    setTempCustomFields(prev => [
      ...prev,
      {
        id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        label: '',
        placeholder: '',
      },
    ])
  }

  function handleRemoveFieldFromModal(idx: number) {
    setTempCustomFields(prev => prev.filter((_, i) => i !== idx))
  }

  function handleCopyFieldsFromOtherArt(targetNumStr: string) {
    if (!targetNumStr) return
    const source = artCustomFields[targetNumStr] || []
    if (source.length > 0) {
      setTempCustomFields(source.map(f => ({
        ...f,
        id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      })))
    }
  }

  const [hasCover, setHasCover] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [hasScanned, setHasScanned] = useState(() => {
    return !!(pack.art_captions && Object.keys(pack.art_captions).length > 0)
  })

  function addArtCaption() {
    setLocalArts(prev => {
      const max = prev.length > 0 ? Math.max(...prev) : 0
      const next = max + 1
      return [...prev, next].sort((a, b) => a - b)
    })
  }

  function removeArtCaption(num: number) {
    setLocalArts(prev => prev.filter(n => n !== num))
    setLocalArtCaptions(prev => {
      const copy = { ...prev }
      delete copy[num]
      return copy
    })
  }

  function generate40Arts() {
    const numbers = Array.from({ length: 40 }, (_, i) => i + 1)
    setLocalArts(prev => {
      const set = new Set([...prev, ...numbers])
      return Array.from(set).sort((a, b) => a - b)
    })
  }

  async function fetchLocalArts(folder: string) {
    if (!folder.trim()) {
      setScanError(null)
      return
    }
    setScanLoading(true)
    setScanError(null)
    try {
      const res = await fetch(`/api/pack-arts?folder=${encodeURIComponent(folder.trim())}`)
      const data = await res.json()
      if (res.ok) {
        const scannedNumbers: number[] = data.artNumbers || []
        setLocalArts(prev => {
          const set = new Set([...prev, ...scannedNumbers])
          return Array.from(set).sort((a, b) => a - b)
        })
        setHasCover(data.hasCover || false)
        setHasScanned(true)
        if (scannedNumbers.length === 0 && !data.hasCover) {
          setScanError('Pasta encontrada mas nenhum arquivo .webp numerado foi encontrado.')
        }
      } else {
        setScanError(data.error || 'Erro ao escanear pasta.')
      }
    } catch {
      setScanError('Erro de conexão ao escanear pasta.')
    } finally {
      setScanLoading(false)
    }
  }

  // ===== VERSIONS STATE (SEM CORES) =====
  const [versions, setVersions] = useState<VersionFormItem[]>(() => {
    if (existingVersions && existingVersions.length > 0) {
      return existingVersions.map((v, i) => ({
        _key: v.id || `v-${i}`,
        id: v.id,
        name: v.name || `Versão ${i + 1}`,
        cover_image_url: v.cover_image_url || '',
        display_order: v.display_order ?? i + 1,
        links: (v.pack_version_links || []).map((l, li) => ({
          _key: l.id || `vl-${li}`,
          id: l.id,
          platform: l.platform,
          format: l.format,
          url: l.url || '',
          label_pt: l.label_pt || '',
          label_es: l.label_es || '',
          label_en: l.label_en || '',
          display_order: l.display_order ?? li + 1,
        })),
      }))
    }
    return [
      {
        _key: `v-${Date.now()}`,
        name: 'Padrão',
        cover_image_url: '',
        display_order: 1,
        links: [],
      },
    ]
  })

  function addVersion() {
    setVersions(prev => [
      ...prev,
      {
        _key: `v-new-${Date.now()}`,
        name: `Versão 0${prev.length + 1}`,
        cover_image_url: '',
        display_order: prev.length + 1,
        links: [],
      },
    ])
  }

  function removeVersion(key: string) {
    setVersions(prev =>
      prev
        .map(v => (v._key === key ? (v.id ? { ...v, _delete: true } : null) : v))
        .filter(Boolean) as VersionFormItem[]
    )
  }

  function updateVersion(key: string, field: keyof VersionFormItem, value: any) {
    setVersions(prev => prev.map(v => (v._key === key ? { ...v, [field]: value } : v)))
  }

  // Links do Feed e Stories
  function setPrimaryLink(versionKey: string, platform: 'canva' | 'photoshop', format: 'feed' | 'stories', url: string) {
    setVersions(prev =>
      prev.map(v => {
        if (v._key !== versionKey) return v

        const existingLinkIdx = v.links.findIndex(
          l => !l._delete && l.platform === platform && l.format === format
        )

        let newLinks = [...v.links]
        if (existingLinkIdx >= 0) {
          if (!url.trim()) {
            if (newLinks[existingLinkIdx].id) {
              newLinks[existingLinkIdx] = { ...newLinks[existingLinkIdx], _delete: true }
            } else {
              newLinks.splice(existingLinkIdx, 1)
            }
          } else {
            newLinks[existingLinkIdx] = { ...newLinks[existingLinkIdx], url: url.trim() }
          }
        } else if (url.trim()) {
          newLinks.push({
            _key: `link-${Date.now()}-${Math.random()}`,
            platform,
            format,
            url: url.trim(),
            label_pt: `${platform === 'canva' ? 'Canva' : 'Photoshop'} ${format === 'stories' ? 'Stories' : 'Feed'}`,
            display_order: newLinks.length + 1,
          })
        }

        return { ...v, links: newLinks }
      })
    )
  }

  function getPrimaryLinkUrl(v: VersionFormItem, platform: 'canva' | 'photoshop', format: 'feed' | 'stories'): string {
    const found = v.links.find(l => !l._delete && l.platform === platform && l.format === format)
    return found?.url || ''
  }

  // ===== COMPLEMENTS STATE =====
  const existingStoriesComp = existingComplements.find(c => c.type === 'stories')
  const existingCustomComp = existingComplements.find(c => c.type === 'custom')

  const [storiesComplement, setStoriesComplement] = useState({
    id: existingStoriesComp?.id,
    is_active: existingStoriesComp ? existingStoriesComp.is_active : false,
    hotmart_id: existingStoriesComp?.hotmart_id || '',
    hotmart_id_secondary: existingStoriesComp?.hotmart_id_secondary || '',
    buy_link: existingStoriesComp?.buy_link || '',
    price: existingStoriesComp?.price != null ? String(existingStoriesComp.price) : '',
  })

  const [customComplement, setCustomComplement] = useState({
    id: existingCustomComp?.id,
    is_active: existingCustomComp ? existingCustomComp.is_active : false,
    hotmart_id: existingCustomComp?.hotmart_id || '',
    hotmart_id_secondary: existingCustomComp?.hotmart_id_secondary || '',
    buy_link: existingCustomComp?.buy_link || '',
    price: existingCustomComp?.price != null ? String(existingCustomComp.price) : '',
  })


  // Submit
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    formData.set('cover_image_url', mainCoverUrl.trim())
    formData.set('drive_arts_folder_id', driveArtsFolderId.trim())

    formData.set('arts_folder', artsFolder.trim())
    formData.set('local_art_captions', JSON.stringify(localArtCaptions))
    formData.set('art_custom_fields', JSON.stringify(artCustomFields))

    const sectionsData = {
      subsections: [],
    }

    formData.set('sections_data', JSON.stringify(sectionsData))

    // Versions Data (sem color_hex)
    const versionsPayload = versions.map((v, vIdx) => ({
      id: v.id,
      name: v.name,
      cover_image_url: v.cover_image_url || null,
      display_order: vIdx + 1,
      _delete: v._delete,
      links: v.links.map((l, lIdx) => ({
        id: l.id,
        platform: l.platform,
        format: l.format,
        url: l.url,
        label_pt: l.label_pt,
        label_es: l.label_es || '',
        label_en: l.label_en || '',
        display_order: lIdx + 1,
        _delete: l._delete,
      })),
    }))
    formData.set('versions_data', JSON.stringify(versionsPayload))

    // Complements Data
    formData.set(
      'complements_data',
      JSON.stringify({
        stories: {
          id: storiesComplement.id,
          is_active: storiesComplement.is_active,
          hotmart_id: storiesComplement.hotmart_id,
          hotmart_id_secondary: storiesComplement.hotmart_id_secondary,
          buy_link: storiesComplement.buy_link,
          price: storiesComplement.price,
        },
        custom: {
          id: customComplement.id,
          is_active: customComplement.is_active,
          hotmart_id: customComplement.hotmart_id,
          hotmart_id_secondary: customComplement.hotmart_id_secondary,
          buy_link: customComplement.buy_link,
          price: customComplement.price,
        },
      })
    )

    try {
      const result = await updatePackAction(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else {
        window.location.href = `/admin/pack/${pack.id}`
      }
    } catch (err: any) {
      console.error('Erro ao salvar pack:', err)
      setError(err?.message || 'Erro de rede ou conexão ao salvar alterações.')
      setLoading(false)
    }
  }

  const activeVersions = versions.filter(v => !v._delete)

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1100px' }}>
        <Link href={`/admin/pack/${pack.id}`} className="pack-back-btn">← Voltar ao pack</Link>
        <header className="pack-header" style={{ marginBottom: '24px' }}>
          <h1 className="pack-name">Editar: {pack.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Configure as informações do pack, suas versões com upload de capas no Supabase, links de Feed/Stories e complementos.
          </p>
        </header>

        <form className="admin-form" action={handleSubmit}>
          <input type="hidden" name="pack_id" value={pack.id} />
          {error && <div className="login-error" style={{ marginBottom: '20px' }}>{error}</div>}

          {/* 1. INFORMAÇÕES BÁSICAS */}
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">1. Informações do Pack</h2>
            <div className="admin-form-grid">
              <div className="input-group">
                <label>Nome do Pack *</label>
                <input name="name" type="text" className="input-field" required defaultValue={pack.name} placeholder="Ex: Provedor de Internet — Vol. 04" />
              </div>
              <div className="input-group">
                <label>ID Principal na Hotmart *</label>
                <input name="hotmart_id" type="text" className="input-field" required defaultValue={pack.hotmart_id} placeholder="Código numérico do produto principal" />
              </div>
              <div className="input-group">
                <label>Versão</label>
                <input name="version" type="text" className="input-field" defaultValue={pack.version || '1.0'} placeholder="Ex: 1.0, 2.0" />
              </div>
              <div className="input-group">
                <label>Idioma *</label>
                <select name="language" className="input-field" defaultValue={pack.language}>
                  <option value="pt">Português (PT-BR)</option>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="input-group">
                <label>Categoria</label>
                <select name="category_id" className="input-field" defaultValue={pack.category_id || ''}>
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.tag})</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Data de Lançamento</label>
                <input name="release_date" type="date" className="input-field" defaultValue={pack.release_date || ''} />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Link de Checkout Principal (Hotmart Buy Link)</label>
                <input name="buy_link" type="url" className="input-field" defaultValue={pack.buy_link || ''} placeholder="https://pay.hotmart.com/..." />
              </div>

              {/* Upload da Capa Geral do Pack */}
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <CoverDropzone
                  value={mainCoverUrl}
                  onChange={(url) => setMainCoverUrl(url)}
                  packId={pack.id}
                  versionId="main-cover"
                  label="Capa Geral do Pack (Upload direto no Supabase)"
                />
              </div>


              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input name="hide_when_locked" type="checkbox" defaultChecked={pack.hide_when_locked} style={{ width: '18px', height: '18px', accentColor: '#4ade80', cursor: 'pointer' }} />
                  <span>👁️ Ocultar pack na dashboard para usuários sem acesso</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. VERSÕES DO PACK & LINKS (FEED / STORIES) */}
          <div className="admin-form-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="admin-form-section-title" style={{ marginBottom: '2px' }}>
                  📦 2. Versões do Pack & Links (Canva / Photoshop)
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Cadastre as versões deste pack, arraste a capa para subir no Supabase e insira os links de Feed e Stories.
                </p>
              </div>
              <button
                type="button"
                onClick={addVersion}
                className="btn-admin-primary"
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                + Adicionar Versão
              </button>
            </div>

            {activeVersions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Nenhuma versão cadastrada.</p>
                <button type="button" onClick={addVersion} className="btn-admin-secondary">
                  Criar Versão Inicial (ex: Padrão)
                </button>
              </div>
            )}

            {activeVersions.map((v, vIndex) => {
              const canvaFeedUrl = getPrimaryLinkUrl(v, 'canva', 'feed')
              const psdFeedUrl = getPrimaryLinkUrl(v, 'photoshop', 'feed')
              const canvaStoriesUrl = getPrimaryLinkUrl(v, 'canva', 'stories')
              const psdStoriesUrl = getPrimaryLinkUrl(v, 'photoshop', 'stories')

              return (
                <div key={v._key} className="admin-version-card">
                  {/* Header da versão */}
                  <div className="admin-version-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                      <span style={{ fontSize: '1.2rem' }}>📁</span>
                      <input
                        type="text"
                        className="input-field"
                        value={v.name}
                        onChange={e => updateVersion(v._key, 'name', e.target.value)}
                        placeholder="Nome da Versão (ex: Versão 01, Azul, Padrão)"
                        style={{ fontWeight: 700, fontSize: '1rem', width: '280px', padding: '8px 12px' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posição #{vIndex + 1}</span>
                      {activeVersions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVersion(v._key)}
                          className="btn-admin-action btn-delete"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Excluir Versão
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload de Capa da Versão com Drag & Drop */}
                  <CoverDropzone
                    value={v.cover_image_url}
                    onChange={(url) => updateVersion(v._key, 'cover_image_url', url)}
                    packId={pack.id}
                    versionId={v.id || v._key}
                    label="Capa desta Versão (Arraste o arquivo aqui):"
                  />

                  {/* Formatos: FEED e STORIES */}
                  <div className="admin-format-boxes-grid">
                    {/* Bloco FEED */}
                    <div className="admin-format-box feed-box">
                      <div className="admin-format-box-header">
                        <span className="admin-format-box-title">
                          <span>🖼️</span> Links de Formato FEED
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(0,136,255,0.15)', color: '#60a5fa' }}>
                          Incluso no Pack Principal
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#00c4cc' }}>Canva</span> Feed URL:
                          </label>
                          <input
                            type="url"
                            className="input-field"
                            value={canvaFeedUrl}
                            onChange={e => setPrimaryLink(v._key, 'canva', 'feed', e.target.value)}
                            placeholder="https://www.canva.com/design/..."
                            style={{ fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#31a8ff' }}>Photoshop / PSD</span> Feed URL:
                          </label>
                          <input
                            type="url"
                            className="input-field"
                            value={psdFeedUrl}
                            onChange={e => setPrimaryLink(v._key, 'photoshop', 'feed', e.target.value)}
                            placeholder="https://drive.google.com/..."
                            style={{ fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bloco STORIES */}
                    <div className="admin-format-box stories-box">
                      <div className="admin-format-box-header">
                        <span className="admin-format-box-title">
                          <span>📱</span> Links de Formato STORIES
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(249,115,22,0.15)', color: '#fb923c' }}>
                          Liberado pelo Complemento Stories
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#00c4cc' }}>Canva</span> Stories URL:
                          </label>
                          <input
                            type="url"
                            className="input-field"
                            value={canvaStoriesUrl}
                            onChange={e => setPrimaryLink(v._key, 'canva', 'stories', e.target.value)}
                            placeholder="https://www.canva.com/design/..."
                            style={{ fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#31a8ff' }}>Photoshop / PSD</span> Stories URL:
                          </label>
                          <input
                            type="url"
                            className="input-field"
                            value={psdStoriesUrl}
                            onChange={e => setPrimaryLink(v._key, 'photoshop', 'stories', e.target.value)}
                            placeholder="https://drive.google.com/..."
                            style={{ fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 3. COMPLEMENTOS DO PACK */}
          <div className="admin-form-section">
            <h2 className="admin-form-section-title" style={{ marginBottom: '4px' }}>
              ⚡ 3. Complementos do Pack (Stories & Personalização)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Ative ou configure os complementos opcionais que os membros podem adquirir para este pack.
            </p>

            <div className="admin-complements-grid">
              {/* COMPLEMENTO STORIES */}
              <div className={`admin-complement-card ${storiesComplement.is_active ? 'stories-active' : ''}`}>
                <div className="admin-complement-header">
                  <div className="admin-complement-info">
                    <div className="admin-complement-icon stories">📱</div>
                    <div>
                      <h3 className="admin-complement-title">Complemento: Stories</h3>
                      <p className="admin-complement-desc">
                        Libera os templates e links de Stories das versões deste pack.
                      </p>
                    </div>
                  </div>
                  <label className="admin-switch stories-switch" title="Ativar/Desativar Complemento Stories">
                    <input
                      type="checkbox"
                      checked={storiesComplement.is_active}
                      onChange={e => setStoriesComplement(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <span className="admin-switch-slider" />
                  </label>
                </div>

                <div style={{ opacity: storiesComplement.is_active ? 1 : 0.45, transition: 'opacity 0.2s ease', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem' }}>ID na Hotmart (Produto Stories) *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={storiesComplement.hotmart_id}
                      onChange={e => setStoriesComplement(prev => ({ ...prev, hotmart_id: e.target.value }))}
                      placeholder="Ex: 1234567 (usado para liberar via webhook)"
                    />
                  </div>

                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem' }}>Link de Checkout / Compra (Hotmart) *</label>
                    <input
                      type="url"
                      className="input-field"
                      value={storiesComplement.buy_link}
                      onChange={e => setStoriesComplement(prev => ({ ...prev, buy_link: e.target.value }))}
                      placeholder="https://pay.hotmart.com/..."
                    />
                  </div>

                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem' }}>Preço para exibição (R$)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={storiesComplement.price}
                      onChange={e => setStoriesComplement(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Ex: 29.90"
                    />
                  </div>
                </div>
              </div>

              {/* COMPLEMENTO PERSONALIZAÇÃO */}
              <div className={`admin-complement-card ${customComplement.is_active ? 'active' : ''}`}>
                <div className="admin-complement-header">
                  <div className="admin-complement-info">
                    <div className="admin-complement-icon custom">🎨</div>
                    <div>
                      <h3 className="admin-complement-title">Complemento: Personalização</h3>
                      <p className="admin-complement-desc">
                        Serviço onde nossa equipe personaliza as artes com as cores e logo do cliente.
                      </p>
                    </div>
                  </div>
                  <label className="admin-switch" title="Ativar/Desativar Personalização">
                    <input
                      type="checkbox"
                      checked={customComplement.is_active}
                      onChange={e => setCustomComplement(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <span className="admin-switch-slider" />
                  </label>
                </div>

                <div style={{ opacity: customComplement.is_active ? 1 : 0.45, transition: 'opacity 0.2s ease', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem' }}>ID na Hotmart (Principal) *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={customComplement.hotmart_id}
                      onChange={e => setCustomComplement(prev => ({ ...prev, hotmart_id: e.target.value }))}
                      placeholder="Ex: 7654321 (usado para criar o pedido via webhook)"
                    />
                  </div>

                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem' }}>ID Secundário na Hotmart (Opcional)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={customComplement.hotmart_id_secondary}
                      onChange={e => setCustomComplement(prev => ({ ...prev, hotmart_id_secondary: e.target.value }))}
                      placeholder="Ex: 108520110 (para vendas vindas de outro checkout/oferta)"
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Permite que compras vindas de um 2º ID da Hotmart liberem a personalização automaticamente.
                    </span>
                  </div>

                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem' }}>Link de Checkout / Compra (Hotmart) *</label>
                    <input
                      type="url"
                      className="input-field"
                      value={customComplement.buy_link}
                      onChange={e => setCustomComplement(prev => ({ ...prev, buy_link: e.target.value }))}
                      placeholder="https://pay.hotmart.com/..."
                    />
                  </div>

                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem' }}>Preço para exibição (R$)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={customComplement.price}
                      onChange={e => setCustomComplement(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Ex: 47.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* 4. ARTES DO PACK (GOOGLE DRIVE + FALLBACK LOCAL) */}
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">4. Artes de Amostra (Demonstração)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '16px' }}>
              Suba as artes no Google Drive para alimentar o carrossel do modal no dashboard e as páginas de visualização.
            </p>

            <PackArtsDriveUploader
              packId={pack.id}
              packName={pack.name}
              driveArtsFolderId={driveArtsFolderId}
              onChangeDriveFolderId={setDriveArtsFolderId}
              onFilesLoaded={handleDriveFilesLoaded}
            />

            {/* Pasta Local Legada */}
            <details style={{ marginTop: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                📁 Pasta Local Legada (public/...) — Opcional para packs antigos
              </summary>
              <div style={{ marginTop: '14px' }}>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.8rem' }}>Caminho da pasta local em public/</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={artsFolder}
                      onChange={e => setArtsFolder(e.target.value)}
                      placeholder="packs/nome-do-pack"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => fetchLocalArts(artsFolder)}
                      className="btn-admin-secondary"
                      disabled={scanLoading}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {scanLoading ? 'Escaneando...' : '🔍 Escanear'}
                    </button>
                  </div>
                  {hasCover && <p style={{ fontSize: '0.8rem', color: '#4ade80', margin: '4px 0 0 0' }}>✅ Capa encontrada (card.webp)</p>}
                  {localArts.length > 0 && <p style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '2px' }}>✅ {localArts.length} arte(s) sincronizada(s) para legendas</p>}
                  {scanError && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>⚠️ {scanError}</p>}
                </div>
              </div>
            </details>
          </div>

          {/* 5. LEGENDAS DAS ARTES */}
          <div className="admin-form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div>
                <h2 className="admin-form-section-title" style={{ margin: 0 }}>
                  5. Legendas das Artes ({localArts.length})
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Cada arte do pack pode ter sua legenda correspondente para os clientes copiarem facilmente.
                  {driveArts.length > 0 && (
                    <span style={{ color: '#60a5fa', marginLeft: '6px' }}>
                      (☁️ {driveArts.length} arte(s) vinculada(s) do Google Drive)
                    </span>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {driveArts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const driveNumbers = driveArts.map(a => a.number)
                      setLocalArts(prev => Array.from(new Set([...prev, ...driveNumbers])).sort((a, b) => a - b))
                    }}
                    className="btn-admin-secondary"
                    style={{ fontSize: '0.82rem', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}
                    title="Garantir que todas as artes do Drive apareçam na lista de legendas"
                  >
                    🔄 Sincronizar com Drive ({driveArts.length})
                  </button>
                )}
                {localArts.length === 0 && (
                  <button
                    type="button"
                    onClick={generate40Arts}
                    className="btn-admin-secondary"
                    style={{ fontSize: '0.82rem' }}
                  >
                    ⚡ Preencher 40 Artes
                  </button>
                )}
                <button
                  type="button"
                  onClick={addArtCaption}
                  className="btn-admin-secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  + Adicionar Arte
                </button>
              </div>
            </div>

            {localArts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '14px' }}>
                  {loadingDriveArts
                    ? 'Carregando artes do Google Drive...'
                    : 'Nenhuma legenda configurada para este pack.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {driveArts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLocalArts(driveArts.map(a => a.number))}
                      className="btn-admin-primary"
                      style={{ fontSize: '0.85rem' }}
                    >
                      ☁️ Puxar {driveArts.length} Artes do Google Drive
                    </button>
                  )}
                  <button type="button" onClick={generate40Arts} className="btn-admin-secondary" style={{ fontSize: '0.85rem' }}>
                    ⚡ Gerar 40 Campos de Legenda
                  </button>
                  <button type="button" onClick={addArtCaption} className="btn-admin-secondary" style={{ fontSize: '0.85rem' }}>
                    + Adicionar Arte Individual
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-arts-grid" style={{ marginTop: '16px' }}>
                {localArts.map(num => {
                  const driveArt = driveArts.find(a => a.number === num)
                  const hasLocalFolder = !!artsFolder.trim()
                  const localImgSrc = hasLocalFolder ? `/${artsFolder.trim()}/${num}.webp` : null
                  const imgSrc = driveArt?.thumbnailUrl || localImgSrc
                  const isDrive = !!driveArt?.thumbnailUrl

                  return (
                    <div key={num} className="admin-art-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '4/5',
                          background: '#161618',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={`Arte #${num}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const fb = e.currentTarget.parentElement?.querySelector('.art-card-fallback') as HTMLElement
                              if (fb) fb.style.display = 'flex'
                            }}
                          />
                        ) : null}

                        <div
                          className="art-card-fallback"
                          style={{
                            display: imgSrc ? 'none' : 'flex',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#71717A',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: '12px',
                          }}
                        >
                          🖼️ Arte #{num}
                        </div>

                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(4px)',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          #{num}
                        </span>

                        {isDrive && (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '8px',
                              left: '8px',
                              background: 'rgba(59, 130, 246, 0.85)',
                              backdropFilter: 'blur(4px)',
                              color: '#fff',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            ☁️ Drive
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeArtCaption(num)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.75)',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remover arte"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="admin-art-card-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="input-group" style={{ marginBottom: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <textarea
                            className="input-field"
                            value={localArtCaptions[num] || ''}
                            onChange={e => setLocalArtCaptions(prev => ({ ...prev, [num]: e.target.value }))}
                            placeholder={`Legenda da arte #${num}... (permite quebras de linha e emojis)`}
                            style={{
                              padding: '8px 10px',
                              fontSize: '0.82rem',
                              minHeight: '85px',
                              resize: 'vertical',
                              lineHeight: '1.4',
                              fontFamily: 'inherit',
                            }}
                          />
                        </div>

                        {/* Botão para Configurar Inputs de Personalização da Arte */}
                        {(() => {
                          const fieldsCount = (artCustomFields[String(num)] || []).length
                          return (
                            <button
                              type="button"
                              onClick={() => handleOpenFieldsModal(num)}
                              style={{
                                marginTop: '8px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: fieldsCount > 0 ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
                                background: fieldsCount > 0 ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                                color: fieldsCount > 0 ? '#d8b4fe' : 'var(--text-muted)',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              title="Configurar inputs de personalização para esta arte"
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>⚙️</span> Personalização
                              </span>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  background: fieldsCount > 0 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                                  color: fieldsCount > 0 ? '#f3e8ff' : '#71717a',
                                }}
                              >
                                {fieldsCount > 0 ? `✓ ${fieldsCount} input(s)` : 'Sem campos'}
                              </span>
                            </button>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Modal de Configuração de Campos de Personalização */}
          {editingFieldsArtNum !== null && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px',
              }}
              onClick={() => setEditingFieldsArtNum(null)}
            >
              <div
                style={{
                  background: '#121214',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '560px',
                  maxHeight: '85vh',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>⚙️</span> Inputs da Arte #{editingFieldsArtNum}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Defina os campos que o cliente poderá preencher no formulário para esta arte.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingFieldsArtNum(null)}
                    style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', fontSize: '0.78rem', color: '#93c5fd', lineHeight: 1.4 }}>
                    💡 <strong>Regra:</strong> Se você não adicionar nenhum campo aqui, esta arte será marcada como <em>sem alteração de texto</em> para o cliente. Não haverá campo para observações genéricas.
                  </div>

                  {/* Opção para copiar de outra arte */}
                  {(() => {
                    const artsWithFields = Object.keys(artCustomFields).filter(
                      k => k !== String(editingFieldsArtNum) && (artCustomFields[k] || []).length > 0
                    )
                    if (artsWithFields.length === 0) return null
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          📋 Copiar de:
                        </span>
                        <select
                          className="input-field"
                          value={copyFromArtNum}
                          onChange={e => setCopyFromArtNum(e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '4px 8px', flex: 1 }}
                        >
                          <option value="">Selecione outra arte...</option>
                          {artsWithFields.map(artK => (
                            <option key={artK} value={artK}>
                              Arte #{artK} ({artCustomFields[artK].length} campos)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-admin-secondary"
                          disabled={!copyFromArtNum}
                          onClick={() => handleCopyFieldsFromOtherArt(copyFromArtNum)}
                          style={{ fontSize: '0.78rem', padding: '5px 10px', whiteSpace: 'nowrap' }}
                        >
                          Aplicar
                        </button>
                      </div>
                    )
                  })()}

                  {/* Lista de campos */}
                  {tempCustomFields.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 12px 0' }}>
                        Nenhum input configurado para esta arte.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddFieldToModal}
                        className="btn-admin-primary"
                        style={{ fontSize: '0.82rem' }}
                      >
                        + Adicionar Primeiro Input
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {tempCustomFields.map((field, idx) => (
                        <div
                          key={field.id || idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc' }}>
                              Input #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFieldFromModal(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', padding: '2px 6px' }}
                              title="Remover este campo"
                            >
                              🗑️ Remover
                            </button>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#e4e4e7', marginBottom: '4px', fontWeight: 600 }}>
                              Rótulo / Label (o que o cliente verá) *
                            </label>
                            <input
                              type="text"
                              className="input-field"
                              value={field.label}
                              onChange={e => {
                                const v = e.target.value
                                setTempCustomFields(prev => prev.map((f, i) => (i === idx ? { ...f, label: v } : f)))
                              }}
                              placeholder="Ex: Plano 1 (Mega e Preço), Preço em Destaque, etc."
                              style={{ fontSize: '0.84rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                              Exemplo / Placeholder (Opcional)
                            </label>
                            <input
                              type="text"
                              className="input-field"
                              value={field.placeholder || ''}
                              onChange={e => {
                                const v = e.target.value
                                setTempCustomFields(prev => prev.map((f, i) => (i === idx ? { ...f, placeholder: v } : f)))
                              }}
                              placeholder="Ex: 400 Mega por R$ 79,90"
                              style={{ fontSize: '0.84rem' }}
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddFieldToModal}
                        className="btn-admin-secondary"
                        style={{ fontSize: '0.82rem', alignSelf: 'flex-start', marginTop: '4px' }}
                      >
                        + Adicionar Outro Input
                      </button>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0, 0, 0, 0.25)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingFieldsArtNum(null)}
                    className="btn-admin-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFieldsModal}
                    className="btn-admin-primary"
                    style={{ fontSize: '0.85rem', background: '#9333ea', borderColor: '#a855f7' }}
                  >
                    Salvar Inputs da Arte #{editingFieldsArtNum}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BOTÃO SALVAR */}
          <button type="submit" className="btn-primary btn-submit" disabled={loading} style={{ marginTop: '24px', padding: '14px 28px', fontSize: '1rem', fontWeight: 700 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="loading-spinner" />Salvando Alterações...
              </span>
            ) : 'Salvar Todas as Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
