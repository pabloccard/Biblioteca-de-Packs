'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createPackAction } from '../../actions'
import CoverDropzone from '@/components/admin/CoverDropzone'
import PackArtsDriveUploader from '@/components/admin/PackArtsDriveUploader'

interface Category { id: string; name: string; tag: string }
interface Icon { id: string; name: string; image_url: string }
interface ParentPackOption { id: string; name: string }


interface VersionFormLink {
  _key: string
  platform: 'canva' | 'photoshop'
  format: 'feed' | 'stories'
  url: string
  label_pt: string
  label_es?: string
  label_en?: string
  display_order: number
}

interface VersionFormItem {
  _key: string
  name: string
  cover_image_url: string
  display_order: number
  links: VersionFormLink[]
}

interface Props {
  categories: Category[]
  icons: Icon[]
  parentPacks: ParentPackOption[]
}

export default function NewPackForm({ categories }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [packName, setPackName] = useState('')

  // Capa geral do pack
  const [mainCoverUrl, setMainCoverUrl] = useState('')

  // Google Drive Arts Folder ID
  const [driveArtsFolderId, setDriveArtsFolderId] = useState('')


  // Arts folder (local)
  const [artsFolder, setArtsFolder] = useState('')
  const [localArts, setLocalArts] = useState<number[]>([])
  const [localArtCaptions, setLocalArtCaptions] = useState<Record<number, string>>({})
  const [hasCover, setHasCover] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  // Escanear pasta local
  async function fetchLocalArts(folder: string) {
    if (!folder.trim()) {
      setLocalArts([])
      setHasCover(false)
      setScanError(null)
      return
    }
    setScanLoading(true)
    setScanError(null)
    try {
      const res = await fetch(`/api/pack-arts?folder=${encodeURIComponent(folder.trim())}`)
      const data = await res.json()
      if (res.ok) {
        setLocalArts(data.artNumbers || [])
        setHasCover(data.hasCover || false)
        if (data.artNumbers?.length === 0 && !data.hasCover) {
          setScanError('Pasta encontrada mas nenhum arquivo .webp numerado foi encontrado.')
        }
      } else {
        setLocalArts([])
        setHasCover(false)
        setScanError(data.error || 'Erro ao escanear pasta.')
      }
    } catch {
      setScanError('Erro de conexão.')
    }
    setScanLoading(false)
  }

  // ===== VERSIONS STATE =====
  const [versions, setVersions] = useState<VersionFormItem[]>([
    {
      _key: 'v-init-1',
      name: 'Padrão',
      cover_image_url: '',
      display_order: 1,
      links: [],
    },
  ])

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
    setVersions(prev => prev.filter(v => v._key !== key))
  }

  function updateVersion(key: string, field: keyof VersionFormItem, value: any) {
    setVersions(prev => prev.map(v => (v._key === key ? { ...v, [field]: value } : v)))
  }

  function setPrimaryLink(versionKey: string, platform: 'canva' | 'photoshop', format: 'feed' | 'stories', url: string) {
    setVersions(prev =>
      prev.map(v => {
        if (v._key !== versionKey) return v

        const existingLinkIdx = v.links.findIndex(
          l => l.platform === platform && l.format === format
        )

        let newLinks = [...v.links]
        if (existingLinkIdx >= 0) {
          if (!url.trim()) {
            newLinks.splice(existingLinkIdx, 1)
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
    const found = v.links.find(l => l.platform === platform && l.format === format)
    return found?.url || ''
  }

  // ===== COMPLEMENTS STATE =====
  const [storiesComplement, setStoriesComplement] = useState({
    is_active: false,
    hotmart_id: '',
    buy_link: '',
    price: '',
  })

  const [customComplement, setCustomComplement] = useState({
    is_active: false,
    hotmart_id: '',
    buy_link: '',
    price: '',
  })


  // Submit
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    formData.set('cover_image_url', mainCoverUrl.trim())
    formData.set('drive_arts_folder_id', driveArtsFolderId.trim())

    if (artsFolder.trim()) {
      formData.set('arts_folder', artsFolder.trim())
      formData.set('local_art_captions', JSON.stringify(localArtCaptions))
    } else {
      formData.set('arts_folder', '')
    }

    const sectionsData = {
      subsections: [],
    }

    formData.set('sections_data', JSON.stringify(sectionsData))

    // Versions Data (sem color_hex)
    const versionsPayload = versions.map((v, vIdx) => ({
      name: v.name,
      cover_image_url: v.cover_image_url || null,
      display_order: vIdx + 1,
      links: v.links.map((l, lIdx) => ({
        platform: l.platform,
        format: l.format,
        url: l.url,
        label_pt: l.label_pt,
        label_es: l.label_es || '',
        label_en: l.label_en || '',
        display_order: lIdx + 1,
      })),
    }))
    formData.set('versions_data', JSON.stringify(versionsPayload))

    // Complements Data
    formData.set(
      'complements_data',
      JSON.stringify({
        stories: storiesComplement,
        custom: customComplement,
      })
    )

    try {
      const result = await createPackAction(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else {
        window.location.href = '/admin'
      }
    } catch (err: any) {
      console.error('Erro ao criar pack:', err)
      setError(err?.message || 'Erro de rede ou conexão ao criar pack.')
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1100px' }}>
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header" style={{ marginBottom: '24px' }}>
          <h1 className="pack-name">Criar Novo Pack</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Cadastre um novo pack completo, com suas versões, capas enviadas no Supabase, links de Feed e Stories, e complementos.
          </p>
        </header>

        <form className="admin-form" action={handleSubmit}>
          {error && <div className="login-error" style={{ marginBottom: '20px' }}>{error}</div>}

          {/* 1. DADOS GERAIS */}
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">1. Informações Principais</h2>
            <div className="admin-form-grid">
              <div className="input-group">
                <label>Nome do Pack *</label>
                <input
                  name="name"
                  type="text"
                  className="input-field"
                  required
                  value={packName}
                  onChange={e => setPackName(e.target.value)}
                  placeholder="Ex: Provedor de Internet — Vol. 04"
                />
              </div>
              <div className="input-group">
                <label>ID Principal na Hotmart *</label>
                <input name="hotmart_id" type="text" className="input-field" required placeholder="Código numérico do produto principal" />
              </div>
              <div className="input-group">
                <label>Versão</label>
                <input name="version" type="text" className="input-field" defaultValue="1.0" placeholder="Ex: 1.0, 2.0" />
              </div>
              <div className="input-group">
                <label>Idioma *</label>
                <select name="language" className="input-field" defaultValue="pt">
                  <option value="pt">Português (PT-BR)</option>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="input-group">
                <label>Categoria</label>
                <select name="category_id" className="input-field" defaultValue="">
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.tag})</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Data de Lançamento</label>
                <input name="release_date" type="date" className="input-field" />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Link de Checkout Principal (Hotmart Buy Link)</label>
                <input name="buy_link" type="url" className="input-field" placeholder="https://pay.hotmart.com/..." />
              </div>

              {/* Upload da Capa Geral */}
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <CoverDropzone
                  value={mainCoverUrl}
                  onChange={(url) => setMainCoverUrl(url)}
                  packId="new"
                  versionId="main-cover"
                  label="Capa Geral do Pack (Upload direto no Supabase)"
                />
              </div>


              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input name="hide_when_locked" type="checkbox" defaultChecked={false} style={{ width: '18px', height: '18px', accentColor: '#4ade80', cursor: 'pointer' }} />
                  <span>👁️ Ocultar pack na dashboard para usuários sem acesso</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. VERSÕES DO PACK & LINKS */}
          <div className="admin-form-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="admin-form-section-title" style={{ marginBottom: '2px' }}>
                  📦 2. Versões do Pack & Links (Canva / Photoshop)
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Cadastre as versões deste pack, suba as capas e configure os links de <strong>Feed</strong> e <strong>Stories</strong>.
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

            {versions.map((v, vIndex) => {
              const canvaFeedUrl = getPrimaryLinkUrl(v, 'canva', 'feed')
              const psdFeedUrl = getPrimaryLinkUrl(v, 'photoshop', 'feed')
              const canvaStoriesUrl = getPrimaryLinkUrl(v, 'canva', 'stories')
              const psdStoriesUrl = getPrimaryLinkUrl(v, 'photoshop', 'stories')

              return (
                <div key={v._key} className="admin-version-card">
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
                      {versions.length > 1 && (
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

                  {/* Upload de Capa */}
                  <CoverDropzone
                    value={v.cover_image_url}
                    onChange={(url) => updateVersion(v._key, 'cover_image_url', url)}
                    packId="new"
                    versionId={v._key}
                    label="Capa desta Versão (Arraste o arquivo aqui):"
                  />

                  {/* Formatos Feed e Stories */}
                  <div className="admin-format-boxes-grid">
                    {/* Bloco Feed */}
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

                    {/* Bloco Stories */}
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

          {/* 3. COMPLEMENTOS */}
          <div className="admin-form-section">
            <h2 className="admin-form-section-title" style={{ marginBottom: '4px' }}>
              ⚡ 3. Complementos do Pack (Stories & Personalização)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Ative ou configure os complementos opcionais para este pack.
            </p>

            <div className="admin-complements-grid">
              {/* STORIES */}
              <div className={`admin-complement-card ${storiesComplement.is_active ? 'stories-active' : ''}`}>
                <div className="admin-complement-header">
                  <div className="admin-complement-info">
                    <div className="admin-complement-icon stories">📱</div>
                    <div>
                      <h3 className="admin-complement-title">Complemento: Stories</h3>
                      <p className="admin-complement-desc">Libera os templates e links de Stories deste pack.</p>
                    </div>
                  </div>
                  <label className="admin-switch stories-switch">
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
                      placeholder="Ex: 1234567"
                    />
                  </div>

                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem' }}>Link de Checkout (Hotmart) *</label>
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

              {/* PERSONALIZAÇÃO */}
              <div className={`admin-complement-card ${customComplement.is_active ? 'active' : ''}`}>
                <div className="admin-complement-header">
                  <div className="admin-complement-info">
                    <div className="admin-complement-icon custom">🎨</div>
                    <div>
                      <h3 className="admin-complement-title">Complemento: Personalização</h3>
                      <p className="admin-complement-desc">Serviço de personalização de artes com a marca do cliente.</p>
                    </div>
                  </div>
                  <label className="admin-switch">
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
                    <label style={{ fontSize: '0.8rem' }}>ID na Hotmart (Personalização) *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={customComplement.hotmart_id}
                      onChange={e => setCustomComplement(prev => ({ ...prev, hotmart_id: e.target.value }))}
                      placeholder="Ex: 7654321"
                    />
                  </div>

                  <div className="input-group">
                    <label style={{ fontSize: '0.8rem' }}>Link de Checkout (Hotmart) *</label>
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
              packName={packName}
              driveArtsFolderId={driveArtsFolderId}
              onChangeDriveFolderId={setDriveArtsFolderId}
            />

            {/* Pasta Local Legada */}
            <details style={{ marginTop: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                📁 Pasta Local Legada (public/...) — Opcional para packs antigos
              </summary>
              <div style={{ marginTop: '14px' }}>
                <div className="input-group">
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
                  {localArts.length > 0 && <p style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '2px' }}>✅ {localArts.length} arte(s) encontrada(s)</p>}
                </div>
              </div>
            </details>
          </div>

          {/* BOTÃO SUBMIT */}
          <button type="submit" className="btn-primary btn-submit" disabled={loading} style={{ marginTop: '24px', padding: '14px 28px', fontSize: '1rem', fontWeight: 700 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="loading-spinner" />Criando Pack...
              </span>
            ) : 'Criar Pack'}
          </button>
        </form>
      </div>
    </div>
  )
}
