'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { createPackAction } from '../../actions'

const SECTION_TYPES = [
  { value: 'tutorial', label: '📹 Tutoriais' },
  { value: 'files', label: '📁 Arquivos' },
  { value: 'legends', label: '🖼️ Legendas' },
]

interface Category { id: string; name: string; tag: string }
interface Icon { id: string; name: string; image_url: string }
interface ParentPackOption { id: string; name: string }
interface TutorialItem { _key: string; url: string; label_pt: string; label_es: string; label_en: string; order: number }
interface LinkItem { _key: string; url: string; label_pt: string; label_es: string; label_en: string; order: number }
interface SpecItem { _key: string; label: string; order: number }

// Subsection simplificada — categorias fixas (Feed / Utilitários para pai, Story para filho)
interface SubsectionGroup {
  category: 'feed' | 'utilities' | 'story'
  label: string
  links: LinkItem[]
}

type PackType = 'parent' | 'child'

export default function NewPackForm({ categories, icons, parentPacks }: { categories: Category[], icons: Icon[], parentPacks: ParentPackOption[] }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [packType, setPackType] = useState<PackType>('parent')

  // Common
  const [sectionOrder, setSectionOrder] = useState<string[]>(['files', 'tutorial', 'legends'])
  const [tutorials, setTutorials] = useState<TutorialItem[]>([])
  const [specs, setSpecs] = useState<SpecItem[]>([])

  // Arts folder (local)
  const [artsFolder, setArtsFolder] = useState('')
  const [localArts, setLocalArts] = useState<number[]>([])
  const [localArtCaptions, setLocalArtCaptions] = useState<Record<number, string>>({})
  const [hasCover, setHasCover] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  // Parent: Feed + Utilitários links
  const [feedLinks, setFeedLinks] = useState<LinkItem[]>([])
  const [utilitiesLinks, setUtilitiesLinks] = useState<LinkItem[]>([])

  // Child: Story links
  const [storyLinks, setStoryLinks] = useState<LinkItem[]>([])

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

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

  // Section order
  function moveSectionUp(idx: number) {
    if (idx === 0) return
    const arr = [...sectionOrder]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    setSectionOrder(arr)
  }
  function moveSectionDown(idx: number) {
    if (idx === sectionOrder.length - 1) return
    const arr = [...sectionOrder]
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    setSectionOrder(arr)
  }

  // Tutorials
  function addTutorial() { setTutorials([...tutorials, { _key: `new-${Date.now()}`, url: '', label_pt: '', label_es: '', label_en: '', order: tutorials.length + 1 }]) }
  function removeTutorial(key: string) { setTutorials(tutorials.filter(t => t._key !== key)) }
  function updateTutorial(key: string, field: string, value: string | number) {
    setTutorials(tutorials.map(t => t._key === key ? { ...t, [field]: value } : t))
  }

  // Specs
  function addSpec() { setSpecs([...specs, { _key: `spec-${Date.now()}`, label: '', order: specs.length + 1 }]) }
  function removeSpec(key: string) { setSpecs(specs.filter(s => s._key !== key)) }
  function updateSpec(key: string, label: string) {
    setSpecs(specs.map(s => s._key === key ? { ...s, label } : s))
  }

  // Generic link helpers
  function addLinkTo(setter: React.Dispatch<React.SetStateAction<LinkItem[]>>, current: LinkItem[]) {
    setter([...current, { _key: `link-${Date.now()}`, url: '', label_pt: '', label_es: '', label_en: '', order: current.length + 1 }])
  }
  function removeLinkFrom(setter: React.Dispatch<React.SetStateAction<LinkItem[]>>, current: LinkItem[], key: string) {
    setter(current.filter(l => l._key !== key))
  }
  function updateLinkIn(setter: React.Dispatch<React.SetStateAction<LinkItem[]>>, current: LinkItem[], key: string, field: string, value: string | number) {
    setter(current.map(l => l._key === key ? { ...l, [field]: value } : l))
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    // Incluir arts_folder
    if (artsFolder.trim()) {
      formData.set('arts_folder', artsFolder.trim())
      formData.set('local_art_captions', JSON.stringify(localArtCaptions))
    }

    // Build subsections data based on pack type
    const subsectionsData = []

    if (packType === 'parent') {
      if (feedLinks.length > 0) {
        subsectionsData.push({
          name_pt: 'Feed', name_es: 'Feed', name_en: 'Feed', icon: '', order: 1,
          links: feedLinks.map(l => ({ url: l.url, label_pt: l.label_pt, label_es: l.label_es, label_en: '', order: l.order })),
        })
      }
      if (utilitiesLinks.length > 0) {
        subsectionsData.push({
          name_pt: 'Utilitários', name_es: 'Utilidades', name_en: 'Utilities', icon: '', order: 3,
          links: utilitiesLinks.map(l => ({ url: l.url, label_pt: l.label_pt, label_es: l.label_es, label_en: '', order: l.order })),
        })
      }
    } else {
      if (storyLinks.length > 0) {
        subsectionsData.push({
          name_pt: 'Story', name_es: 'Story', name_en: 'Story', icon: '', order: 1,
          links: storyLinks.map(l => ({ url: l.url, label_pt: l.label_pt, label_es: l.label_es, label_en: '', order: l.order })),
        })
      }
    }

    const sectionsJson = JSON.stringify({
      tutorials: packType === 'parent'
        ? tutorials.map(t => ({ url: t.url, label_pt: t.label_pt, label_es: t.label_es, label_en: '', order: t.order }))
        : [],
      subsections: subsectionsData,
    })

    formData.set('sections_data', sectionsJson)
    formData.set('section_order', JSON.stringify(sectionOrder))
    formData.set('specs_data', JSON.stringify(specs.map((s, i) => ({ label: s.label, order: i + 1 }))))

    const result = await createPackAction(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  // ===== RENDER LINK GROUP =====
  function renderLinkGroup(title: string, linkList: LinkItem[], setter: React.Dispatch<React.SetStateAction<LinkItem[]>>) {
    return (
      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          {title}
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          {linkList.map((link, li) => (
            <div key={link._key} className="admin-art-field" style={{ marginBottom: '8px', marginTop: li === 0 ? '12px' : '0' }}>
              <div className="admin-art-field-header">
                <span>Link {li + 1}</span>
                <button type="button" onClick={() => removeLinkFrom(setter, linkList, link._key)} className="btn-admin-action btn-delete">Remover</button>
              </div>
              <div className="admin-form-grid">
                <div className="input-group"><label>URL *</label><input type="url" className="input-field" value={link.url} onChange={e => updateLinkIn(setter, linkList, link._key, 'url', e.target.value)} placeholder="https://..." /></div>
                <div className="input-group"><label>Texto (PT-BR) *</label><input type="text" className="input-field" value={link.label_pt} onChange={e => updateLinkIn(setter, linkList, link._key, 'label_pt', e.target.value)} placeholder="Ex: Artes para Feed" /></div>
                <div className="input-group"><label>Texto (Espanhol)</label><input type="text" className="input-field" value={link.label_es} onChange={e => updateLinkIn(setter, linkList, link._key, 'label_es', e.target.value)} /></div>
                <div className="input-group"><label>Posição</label><input type="number" className="input-field" value={link.order} onChange={e => updateLinkIn(setter, linkList, link._key, 'order', parseInt(e.target.value) || 1)} min={1} /></div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addLinkTo(setter, linkList)} className="btn-admin-secondary" style={{ fontSize: '0.8rem', marginTop: '8px' }}>+ Adicionar Link</button>
        </div>
      </div>
    )
  }

  // ===== RENDER SECTIONS (parent only) =====
  function renderSection(sectionType: string, idx: number) {
    const sectionLabel = SECTION_TYPES.find(s => s.value === sectionType)?.label || sectionType
    const isExpanded = expandedSections[sectionType] !== false

    return (
      <div key={sectionType} className="admin-form-section" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }} onClick={() => toggleSection(sectionType)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sectionLabel}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: '20px' }}>Posição {idx + 1}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" onClick={(e) => { e.stopPropagation(); moveSectionUp(idx) }} className="btn-admin-action" disabled={idx === 0} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>▲</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); moveSectionDown(idx) }} className="btn-admin-action" disabled={idx === sectionOrder.length - 1} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>▼</button>
            <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '0.9rem' }}>▼</span>
          </div>
        </div>

        {isExpanded && (
          <div style={{ padding: '0 20px 20px' }}>
            {sectionType === 'tutorial' && (
              <div>
                {tutorials.map((t, i) => (
                  <div key={t._key} className="admin-art-field" style={{ marginBottom: '12px' }}>
                    <div className="admin-art-field-header">
                      <span>Vídeo {i + 1}</span>
                      <button type="button" onClick={() => removeTutorial(t._key)} className="btn-admin-action btn-delete">Remover</button>
                    </div>
                    <div className="admin-form-grid">
                      <div className="input-group"><label>URL do YouTube *</label><input type="url" className="input-field" value={t.url} onChange={e => updateTutorial(t._key, 'url', e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
                      <div className="input-group"><label>Título (PT-BR) *</label><input type="text" className="input-field" value={t.label_pt} onChange={e => updateTutorial(t._key, 'label_pt', e.target.value)} placeholder="Ex: Como instalar as fontes" /></div>
                      <div className="input-group"><label>Título (Espanhol)</label><input type="text" className="input-field" value={t.label_es} onChange={e => updateTutorial(t._key, 'label_es', e.target.value)} placeholder="Ex: Cómo instalar las fuentes" /></div>
                      <div className="input-group"><label>Título (Inglês)</label><input type="text" className="input-field" value={t.label_en} onChange={e => updateTutorial(t._key, 'label_en', e.target.value)} placeholder="Ex: How to install fonts" /></div>
                      <div className="input-group"><label>Posição</label><input type="number" className="input-field" value={t.order} onChange={e => updateTutorial(t._key, 'order', parseInt(e.target.value) || 1)} min={1} /></div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addTutorial} className="btn-admin-secondary" style={{ marginTop: '8px' }}>+ Adicionar Vídeo</button>
              </div>
            )}

            {sectionType === 'files' && (
              <div>
                {renderLinkGroup('🖼️ Feed', feedLinks, setFeedLinks)}
                {renderLinkGroup('🔧 Utilitários', utilitiesLinks, setUtilitiesLinks)}
              </div>
            )}

            {sectionType === 'legends' && (
              <div>
                {artsFolder.trim() && localArts.length > 0 ? (
                  <div>
                    <div className="admin-arts-grid" style={{ marginBottom: '16px' }}>
                      {localArts.map((num) => (
                        <div key={num} className="admin-art-card">
                          <img src={`/${artsFolder}/${num}.webp`} alt={`Arte ${num}`} />
                          <div className="admin-art-card-info">
                            <div className="input-group" style={{ marginBottom: '8px' }}>
                              <label style={{ fontSize: '0.7rem' }}>{num}.webp</label>
                              <textarea
                                className="input-field"
                                value={localArtCaptions[num] || ''}
                                onChange={e => setLocalArtCaptions(prev => ({ ...prev, [num]: e.target.value }))}
                                placeholder="Legenda da arte... (permite quebras de linha)"
                                style={{ padding: '6px 8px', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {artsFolder.trim()
                        ? 'Clique em "🔍 Escanear" nas informações básicas para carregar as artes da pasta.'
                        : 'Preencha o campo "Pasta das Artes" nas informações básicas para gerenciar as legendas.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header"><h1 className="pack-name">Novo Pack</h1></header>

        <form className="admin-form" action={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          {/* Tipo do Pack */}
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">Tipo do Pack</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setPackType('parent')}
                style={{
                  flex: 1, padding: '16px', borderRadius: 'var(--radius-lg)',
                  border: packType === 'parent' ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                  background: packType === 'parent' ? 'rgba(0, 82, 255, 0.08)' : 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'center', color: 'var(--text-primary)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📦</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Pack Pai</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Pack principal com Feed, Tutoriais e Legendas</div>
              </button>
              <button
                type="button"
                onClick={() => setPackType('child')}
                style={{
                  flex: 1, padding: '16px', borderRadius: 'var(--radius-lg)',
                  border: packType === 'child' ? '2px solid #f97316' : '1px solid var(--border-subtle)',
                  background: packType === 'child' ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'center', color: 'var(--text-primary)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📱</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Pack Filho (Story)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Complemento de Story vinculado a um Pack Pai</div>
              </button>
            </div>
          </div>

          {/* Info Básicas */}
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">Informações Básicas</h2>
            <div className="admin-form-grid">
              <div className="input-group"><label>Nome *</label><input name="name" type="text" className="input-field" required placeholder={packType === 'child' ? 'Ex: Pack Provedor - Story' : 'Ex: Pack Provedor de Internet'} /></div>
              <div className="input-group"><label>ID Hotmart *</label><input name="hotmart_id" type="text" className="input-field" required placeholder="ID do produto na Hotmart" /></div>
              <div className="input-group"><label>Versão</label><input name="version" type="text" className="input-field" defaultValue="1.0" placeholder="Ex: 1.0, 2.0" /></div>

              {packType === 'parent' && (
                <>
                  <div className="input-group">
                    <label>Idioma *</label>
                    <select name="language" className="input-field">
                      <option value="pt">Português (PT-BR)</option>
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Categoria</label>
                    <select name="category_id" className="input-field">
                      <option value="">Sem categoria</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.tag})</option>)}
                    </select>
                  </div>
                  <div className="input-group"><label>Data de Lançamento</label><input name="release_date" type="date" className="input-field" /></div>
                  <div className="input-group">
                    <label>Pasta das Artes (local)</label>
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
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Caminho relativo a <code>public/</code>. As imagens devem ser: <code>card.webp</code> (card quadrado), <code>cover.webp</code> (capa horizontal 16:9), <code>1.webp</code>, <code>2.webp</code>, etc.</p>
                    {scanError && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>{scanError}</p>}
                    {hasCover && <p style={{ fontSize: '0.8rem', color: '#4ade80', margin: '4px 0 0 0' }}>✅ Imagem do card encontrada (card.webp)</p>}
                    {localArts.length > 0 && <p style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '2px' }}>✅ {localArts.length} arte(s) encontrada(s)</p>}
                  </div>
                </>
              )}

              <div className="input-group" style={{ gridColumn: '1 / -1' }}><label>Link de Checkout (Buy Link)</label><input name="buy_link" type="url" className="input-field" placeholder="https://pay.hotmart.com/..." /></div>

              {packType === 'parent' && (
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input name="show_discount_tag" type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#f97316', cursor: 'pointer' }} />
                    <span>🔥 Exibir tag &quot;Desconto Exclusivo&quot; quando bloqueado</span>
                  </label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Se ativado, o pack mostrará a tag de desconto no dashboard quando não estiver liberado para o usuário.</p>
                </div>
              )}

              {packType === 'parent' && (
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input name="hide_when_locked" type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#4ade80', cursor: 'pointer' }} />
                    <span>👁️ Ocultar pack caso o usuário não tenha acesso (não aparecerá como bloqueado)</span>
                  </label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Se ativado, este pack será invisível na dashboard para todos os usuários que não realizaram a compra.</p>
                </div>
              )}

              {packType === 'child' && (
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Pack Pai *</label>
                  <select name="parent_pack_id" className="input-field" required>
                    <option value="">Selecione o pack pai...</option>
                    {parentPacks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Os links de Story deste pack aparecerão dentro da seção de arquivos do pack pai.</p>
                </div>
              )}

              {packType === 'parent' && (
                <input type="hidden" name="parent_pack_id" value="" />
              )}
            </div>
          </div>

          {/* Conteúdo do Pack Pai */}
          {packType === 'parent' && (
            <>
              {/* Especificações */}
              <div className="admin-form-section">
                <h2 className="admin-form-section-title">Especificações do Pack</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '12px' }}>Itens exibidos no modal quando o pack está bloqueado. Ex: &quot;24 artes&quot;, &quot;Editável no Canva&quot;.</p>
                {specs.map((spec, i) => (
                  <div key={spec._key} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input type="text" className="input-field" value={spec.label} onChange={e => updateSpec(spec._key, e.target.value)} placeholder={`Especificação ${i + 1}`} style={{ flex: 1 }} />
                    <button type="button" onClick={() => removeSpec(spec._key)} className="btn-admin-action btn-delete" style={{ padding: '8px 12px', fontSize: '0.75rem' }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={addSpec} className="btn-admin-secondary" style={{ fontSize: '0.85rem' }}>+ Adicionar Especificação</button>
              </div>

              {/* Seções */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 className="admin-form-section-title" style={{ marginBottom: '0' }}>Seções do Pack</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-8px' }}>Use as setas ▲▼ para alterar a ordem das abas na área de membros.</p>
                {sectionOrder.map((sectionType, idx) => renderSection(sectionType, idx))}
              </div>
            </>
          )}

          {/* Conteúdo do Pack Filho (Story) */}
          {packType === 'child' && (
            <div className="admin-form-section">
              <h2 className="admin-form-section-title">📱 Links de Story</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '16px' }}>Adicione os links das artes em formato Story.</p>
              {storyLinks.map((link, li) => (
                <div key={link._key} className="admin-art-field" style={{ marginBottom: '8px' }}>
                  <div className="admin-art-field-header">
                    <span>Link {li + 1}</span>
                    <button type="button" onClick={() => removeLinkFrom(setStoryLinks, storyLinks, link._key)} className="btn-admin-action btn-delete">Remover</button>
                  </div>
                  <div className="admin-form-grid">
                    <div className="input-group"><label>URL *</label><input type="url" className="input-field" value={link.url} onChange={e => updateLinkIn(setStoryLinks, storyLinks, link._key, 'url', e.target.value)} placeholder="https://..." /></div>
                    <div className="input-group"><label>Texto (PT-BR) *</label><input type="text" className="input-field" value={link.label_pt} onChange={e => updateLinkIn(setStoryLinks, storyLinks, link._key, 'label_pt', e.target.value)} placeholder="Ex: Story Canva" /></div>
                    <div className="input-group"><label>Texto (Espanhol)</label><input type="text" className="input-field" value={link.label_es} onChange={e => updateLinkIn(setStoryLinks, storyLinks, link._key, 'label_es', e.target.value)} /></div>
                    <div className="input-group"><label>Texto (English)</label><input type="text" className="input-field" value={link.label_en} onChange={e => updateLinkIn(setStoryLinks, storyLinks, link._key, 'label_en', e.target.value)} /></div>
                    <div className="input-group"><label>Posição</label><input type="number" className="input-field" value={link.order} onChange={e => updateLinkIn(setStoryLinks, storyLinks, link._key, 'order', parseInt(e.target.value) || 1)} min={1} /></div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addLinkTo(setStoryLinks, storyLinks)} className="btn-admin-secondary" style={{ fontSize: '0.85rem' }}>+ Adicionar Link de Story</button>
            </div>
          )}

          <button type="submit" className="btn-primary btn-submit" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? (<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><span className="loading-spinner" />Criando...</span>) : `Criar Pack ${packType === 'child' ? 'Filho' : ''}`}
          </button>
        </form>
      </div>
    </div>
  )
}
