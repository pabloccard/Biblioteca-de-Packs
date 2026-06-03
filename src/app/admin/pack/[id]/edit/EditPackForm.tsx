'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { updatePackAction } from '../../../actions'

const SECTION_TYPES = [
  { value: 'tutorial', label: '📹 Tutoriais' },
  { value: 'files', label: '📁 Arquivos' },
  { value: 'legends', label: '🖼️ Legendas' },
]

// ===== TYPES =====
interface Pack {
  id: string; hotmart_id: string; name: string; release_date: string | null
  cover_image_url: string | null; language: string; category_id: string | null
  section_order: string[] | null; buy_link: string | null; parent_pack_id: string | null
  show_discount_tag: boolean; version: string; hide_when_locked: boolean
  arts_folder: string | null; art_captions: Record<string, string> | null
}
interface ParentPackOption { id: string; name: string }
interface PackSpec { id: string; label: string; display_order: number }
interface PackLink { id: string; label_pt: string; label_es: string; url: string; display_order: number; category: string; subsection_id: string | null }
interface Subsection { id: string; name_pt: string; name_es: string; icon: string; display_order: number }
interface Category { id: string; name: string; tag: string }
interface Icon { id: string; name: string; image_url: string }

interface TutorialItem { _key: string; id?: string; url: string; label_pt: string; label_es: string; order: number }
interface SubsectionItem {
  _key: string; id?: string; name_pt: string; name_es: string; icon: string; order: number
  links: LinkItem[]
}
interface LinkItem { _key: string; id?: string; url: string; label_pt: string; label_es: string; order: number }
interface SpecItem { _key: string; label: string; order: number }

interface Props { pack: Pack; existingLinks: PackLink[]; existingSubsections: Subsection[]; categories: Category[]; icons: Icon[]; existingSpecs: PackSpec[]; parentPacks: ParentPackOption[] }

// ===== COMPONENT =====
export default function EditPackForm({ pack, existingLinks, existingSubsections, categories, icons, existingSpecs, parentPacks }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [specs, setSpecs] = useState<SpecItem[]>(existingSpecs.map(s => ({ _key: s.id, label: s.label, order: s.display_order })))

  // Arts folder (local)
  const [artsFolder, setArtsFolder] = useState(pack.arts_folder || '')
  const [localArts, setLocalArts] = useState<number[]>([])
  const [localArtCaptions, setLocalArtCaptions] = useState<Record<number, string>>(
    () => {
      const captions: Record<number, string> = {}
      if (pack.art_captions) {
        for (const [key, val] of Object.entries(pack.art_captions)) {
          captions[parseInt(key, 10)] = val
        }
      }
      return captions
    }
  )
  const [hasCover, setHasCover] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [hasScanned, setHasScanned] = useState(false)

  // Escanear pasta local
  async function fetchLocalArts(folder: string) {
    if (!folder.trim()) {
      setLocalArts([])
      setHasCover(false)
      setScanError(null)
      setHasScanned(false)
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
        setHasScanned(true)
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
  const defaultOrder = pack.section_order || ['files', 'tutorial', 'legends']
  const [sectionOrder, setSectionOrder] = useState<string[]>(defaultOrder)

  // Tutorials
  const youtubeLinks = existingLinks.filter(l => l.category === 'youtube')
  const [tutorials, setTutorials] = useState<TutorialItem[]>(
    youtubeLinks.map(l => ({ _key: l.id, id: l.id, url: l.url, label_pt: l.label_pt, label_es: l.label_es, order: l.display_order }))
  )

  // Subsections with their links
  const [subsections, setSubsections] = useState<SubsectionItem[]>(
    existingSubsections.map(s => ({
      _key: s.id, id: s.id, name_pt: s.name_pt, name_es: s.name_es, icon: s.icon, order: s.display_order,
      links: existingLinks.filter(l => l.subsection_id === s.id).map(l => ({
        _key: l.id, id: l.id, url: l.url, label_pt: l.label_pt, label_es: l.label_es, order: l.display_order,
      })),
    }))
  )

  // Collapsed state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // ===== SECTION ORDER =====
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

  // ===== TUTORIALS CRUD =====
  function addTutorial() { setTutorials([...tutorials, { _key: `new-${Date.now()}`, url: '', label_pt: '', label_es: '', order: tutorials.length + 1 }]) }
  function removeTutorial(key: string) { setTutorials(tutorials.filter(t => t._key !== key)) }
  function updateTutorial(key: string, field: string, value: string | number) { setTutorials(tutorials.map(t => t._key === key ? { ...t, [field]: value } : t)) }

  // ===== SUBSECTIONS CRUD =====
  function addSubsection() {
    setSubsections([...subsections, { _key: `new-${Date.now()}`, name_pt: '', name_es: '', icon: 'folder', order: subsections.length + 1, links: [] }])
  }
  function removeSubsection(key: string) { setSubsections(subsections.filter(s => s._key !== key)) }
  function updateSubsection(key: string, field: string, value: string | number) {
    setSubsections(subsections.map(s => s._key === key ? { ...s, [field]: value } : s))
  }

  // ===== LINKS CRUD =====
  function addLink(subKey: string) {
    setSubsections(subsections.map(s => s._key === subKey ? { ...s, links: [...s.links, { _key: `new-${Date.now()}`, url: '', label_pt: '', label_es: '', order: s.links.length + 1 }] } : s))
  }
  function removeLink(subKey: string, linkKey: string) {
    setSubsections(subsections.map(s => s._key === subKey ? { ...s, links: s.links.filter(l => l._key !== linkKey) } : s))
  }
  function updateLink(subKey: string, linkKey: string, field: string, value: string | number) {
    setSubsections(subsections.map(s => s._key === subKey ? { ...s, links: s.links.map(l => l._key === linkKey ? { ...l, [field]: value } : l) } : s))
  }

  // ===== SPECS CRUD =====
  function addSpec() { setSpecs([...specs, { _key: `new-${Date.now()}`, label: '', order: specs.length + 1 }]) }
  function removeSpec(key: string) { setSpecs(specs.filter(s => s._key !== key)) }
  function updateSpec(key: string, label: string) { setSpecs(specs.map(s => s._key === key ? { ...s, label } : s)) }

  // ===== SUBMIT =====
  async function handleSubmit(formData: FormData) {
    setLoading(true); setError(null)

    // Incluir arts_folder
    if (artsFolder.trim()) {
      formData.set('arts_folder', artsFolder.trim())
      formData.set('local_art_captions', JSON.stringify(localArtCaptions))
    }

    // Build sections JSON
    const deletedTutorials = youtubeLinks.filter(l => !tutorials.find(t => t.id === l.id)).map(l => ({ id: l.id, _delete: true, url: '', label_pt: '', label_es: '', order: 0 }))
    const deletedSubsections = existingSubsections.filter(s => !subsections.find(sub => sub.id === s.id)).map(s => ({ id: s.id, _delete: true, name_pt: '', name_es: '', icon: '', order: 0, links: [] as LinkItem[] }))
    const deletedLinks: { subId: string; linkId: string }[] = []
    existingSubsections.forEach(s => {
      const currentSub = subsections.find(sub => sub.id === s.id)
      if (currentSub) {
        const existingSubLinks = existingLinks.filter(l => l.subsection_id === s.id)
        existingSubLinks.forEach(l => {
          if (!currentSub.links.find(cl => cl.id === l.id)) {
            deletedLinks.push({ subId: s.id, linkId: l.id })
          }
        })
      }
    })

    const sectionsData = {
      tutorials: [
        ...tutorials.map(t => ({ id: t.id, url: t.url, label_pt: t.label_pt, label_es: t.label_es, order: t.order })),
        ...deletedTutorials,
      ],
      subsections: [
        ...subsections.map(s => ({
          id: s.id,
          name_pt: s.name_pt,
          name_es: s.name_es,
          icon: s.icon,
          order: s.order,
          links: [
            ...s.links.map(l => ({ id: l.id, url: l.url, label_pt: l.label_pt, label_es: l.label_es, order: l.order })),
            ...deletedLinks.filter(d => d.subId === s.id).map(d => ({ id: d.linkId, _delete: true, url: '', label_pt: '', label_es: '', order: 0 })),
          ],
        })),
        ...deletedSubsections,
      ],
    }

    formData.set('sections_data', JSON.stringify(sectionsData))
    formData.set('section_order', JSON.stringify(sectionOrder))
    formData.set('specs_data', JSON.stringify(specs.map((s, i) => ({ label: s.label, order: i + 1 }))))

    const result = await updatePackAction(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  // ===== RENDER SECTIONS =====
  function renderSection(sectionType: string, idx: number) {
    const sectionLabel = SECTION_TYPES.find(s => s.value === sectionType)?.label || sectionType
    const isExpanded = expandedSections[sectionType] !== false // default open

    return (
      <div key={sectionType} className="admin-form-section" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
          onClick={() => toggleSection(sectionType)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sectionLabel}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: '20px' }}>
              Posição {idx + 1}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" onClick={(e) => { e.stopPropagation(); moveSectionUp(idx) }} className="btn-admin-action" disabled={idx === 0} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>▲</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); moveSectionDown(idx) }} className="btn-admin-action" disabled={idx === sectionOrder.length - 1} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>▼</button>
            <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '0.9rem' }}>▼</span>
          </div>
        </div>

        {isExpanded && (
          <div style={{ padding: '0 20px 20px' }}>
            {sectionType === 'tutorial' && renderTutorials()}
            {sectionType === 'files' && renderFiles()}
            {sectionType === 'legends' && renderLegends()}
          </div>
        )}
      </div>
    )
  }

  // ===== RENDER TUTORIALS =====
  function renderTutorials() {
    return (
      <div>
        {tutorials.map((t, i) => (
          <div key={t._key} className="admin-art-field" style={{ marginBottom: '12px' }}>
            <div className="admin-art-field-header">
              <span>Vídeo {i + 1}{t.id ? '' : ' (novo)'}</span>
              <button type="button" onClick={() => removeTutorial(t._key)} className="btn-admin-action btn-delete">Remover</button>
            </div>
            <div className="admin-form-grid">
              <div className="input-group"><label>URL do YouTube *</label><input type="url" className="input-field" value={t.url} onChange={e => updateTutorial(t._key, 'url', e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
              <div className="input-group"><label>Título (PT-BR) *</label><input type="text" className="input-field" value={t.label_pt} onChange={e => updateTutorial(t._key, 'label_pt', e.target.value)} placeholder="Ex: Como instalar as fontes" /></div>
              <div className="input-group"><label>Título (Espanhol)</label><input type="text" className="input-field" value={t.label_es} onChange={e => updateTutorial(t._key, 'label_es', e.target.value)} placeholder="Ex: Cómo instalar las fuentes" /></div>
              <div className="input-group"><label>Posição</label><input type="number" className="input-field" value={t.order} onChange={e => updateTutorial(t._key, 'order', parseInt(e.target.value) || 1)} min={1} /></div>
            </div>
          </div>
        ))}
        <button type="button" onClick={addTutorial} className="btn-admin-secondary" style={{ marginTop: '8px' }}>+ Adicionar Vídeo</button>
      </div>
    )
  }

  // ===== RENDER FILES (FEED + UTILITÁRIOS) =====
  function renderFiles() {
    // Separar subsections por tipo
    const feedSubs = subsections.filter(s => { const n = s.name_pt.toLowerCase(); return !n.includes('utilitário') && !n.includes('utilidades') && !n.includes('story') })
    const utilSubs = subsections.filter(s => { const n = s.name_pt.toLowerCase(); return n.includes('utilitário') || n.includes('utilidades') })

    function renderLinkGroup(title: string, subs: SubsectionItem[], type: 'feed' | 'util') {
      const sub = subs[0]
      if (!sub) {
        return (
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{title}</div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Nenhuma subseção encontrada.</p>
              <button 
                type="button" 
                onClick={() => {
                  const isFeed = type === 'feed'
                  setSubsections([
                    ...subsections,
                    {
                      _key: `new-${Date.now()}`,
                      name_pt: isFeed ? 'Artes Feed' : 'Utilitários',
                      name_es: isFeed ? 'Artes Feed' : 'Utilitarios',
                      icon: isFeed ? 'folder' : 'utilities',
                      order: subsections.length + 1,
                      links: []
                    }
                  ])
                }} 
                className="btn-admin-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                + Criar Subseção {title.replace('🖼️', '').replace('🔧', '').trim()}
              </button>
            </div>
          </div>
        )
      }

      return (
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', marginBottom: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{title}</span>
            <button type="button" onClick={() => removeSubsection(sub._key)} className="btn-admin-action btn-delete">Remover Subseção</button>
          </div>
          <div style={{ padding: '16px 16px 0' }}>
            <div className="admin-form-grid" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="input-group">
                <label>Nome da Subseção (PT-BR) *</label>
                <input type="text" className="input-field" value={sub.name_pt} onChange={e => updateSubsection(sub._key, 'name_pt', e.target.value)} placeholder={type === 'feed' ? 'Artes Feed' : 'Utilitários'} />
              </div>
              <div className="input-group">
                <label>Nome da Subseção (ES)</label>
                <input type="text" className="input-field" value={sub.name_es} onChange={e => updateSubsection(sub._key, 'name_es', e.target.value)} />
              </div>
            </div>
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            {sub.links.map((link, li) => (
              <div key={link._key} className="admin-art-field" style={{ marginBottom: '8px', marginTop: li === 0 ? '12px' : '0' }}>
                <div className="admin-art-field-header">
                  <span>Link {li + 1}{link.id ? '' : ' (novo)'}</span>
                  <button type="button" onClick={() => removeLink(sub._key, link._key)} className="btn-admin-action btn-delete">Remover</button>
                </div>
                <div className="admin-form-grid">
                  <div className="input-group"><label>URL *</label><input type="url" className="input-field" value={link.url} onChange={e => updateLink(sub._key, link._key, 'url', e.target.value)} placeholder="https://..." /></div>
                  <div className="input-group"><label>Texto (PT-BR) *</label><input type="text" className="input-field" value={link.label_pt} onChange={e => updateLink(sub._key, link._key, 'label_pt', e.target.value)} placeholder="Ex: Artes Feed" /></div>
                  <div className="input-group"><label>Texto (Espanhol)</label><input type="text" className="input-field" value={link.label_es} onChange={e => updateLink(sub._key, link._key, 'label_es', e.target.value)} /></div>
                  <div className="input-group"><label>Posição</label><input type="number" className="input-field" value={link.order} onChange={e => updateLink(sub._key, link._key, 'order', parseInt(e.target.value) || 1)} min={1} /></div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addLink(sub._key)} className="btn-admin-secondary" style={{ fontSize: '0.8rem', marginTop: '8px' }}>+ Adicionar Link</button>
          </div>
        </div>
      )
    }

    return (
      <div>
        {renderLinkGroup('🖼️ Feed', feedSubs, 'feed')}
        {renderLinkGroup('🔧 Utilitários', utilSubs, 'util')}
      </div>
    )
  }

  // ===== RENDER LEGENDS =====
  function renderLegends() {
    if (!artsFolder.trim()) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preencha o campo "Pasta das Artes" nas informações básicas para gerenciar as legendas.</p>
        </div>
      )
    }

    if (!hasScanned) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <button
            type="button"
            onClick={() => fetchLocalArts(artsFolder)}
            className="btn-admin-primary"
            disabled={scanLoading}
          >
            {scanLoading ? 'Escaneando...' : '🔍 Escanear Pasta para Carregar Artes'}
          </button>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Clique para carregar as artes da pasta <code>{artsFolder}</code></p>
        </div>
      )
    }

    if (localArts.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma arte encontrada na pasta. Adicione arquivos 1.webp, 2.webp, etc. e reescaneie.</p>
          <button
            type="button"
            onClick={() => fetchLocalArts(artsFolder)}
            className="btn-admin-secondary"
            disabled={scanLoading}
            style={{ marginTop: '12px' }}
          >
            {scanLoading ? 'Escaneando...' : '🔄 Reescanear Pasta'}
          </button>
        </div>
      )
    }

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => fetchLocalArts(artsFolder)}
            className="btn-admin-secondary"
            disabled={scanLoading}
            style={{ fontSize: '0.8rem' }}
          >
            {scanLoading ? 'Escaneando...' : '🔄 Reescanear Pasta'}
          </button>
        </div>
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
    )
  }

  const isChildPack = !!pack.parent_pack_id

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header"><h1 className="pack-name">Editar: {pack.name}</h1></header>

        {/* Tipo badge */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: isChildPack ? 'rgba(249,115,22,0.15)' : 'rgba(0,82,255,0.15)', color: isChildPack ? '#f97316' : 'var(--accent)' }}>
            {isChildPack ? '📱 Pack Filho (Story)' : '📦 Pack Pai'}
          </span>
        </div>

        <form className="admin-form" action={handleSubmit}>
          <input type="hidden" name="pack_id" value={pack.id} />
          {error && <div className="login-error">{error}</div>}

          {/* Info Básicas */}
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">Informações Básicas</h2>
            <div className="admin-form-grid">
              <div className="input-group"><label>Nome *</label><input name="name" type="text" className="input-field" required defaultValue={pack.name} /></div>
              <div className="input-group"><label>ID Hotmart *</label><input name="hotmart_id" type="text" className="input-field" required defaultValue={pack.hotmart_id} /></div>
              <div className="input-group"><label>Versão</label><input name="version" type="text" className="input-field" defaultValue={pack.version || '1.0'} placeholder="Ex: 1.0, 2.0" /></div>

              {!isChildPack && (
                <>
                  <div className="input-group">
                    <label>Idioma *</label>
                    <select name="language" className="input-field" defaultValue={pack.language}>
                      <option value="pt">Português (PT-BR)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Categoria</label>
                    <select name="category_id" className="input-field" defaultValue={pack.category_id || ''}>
                      <option value="">Sem categoria</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.tag})</option>)}
                    </select>
                  </div>
                  <div className="input-group"><label>Data de Lançamento</label><input name="release_date" type="date" className="input-field" defaultValue={pack.release_date || ''} /></div>
                  <div className="input-group">
                    <label>Nova Capa (opcional)</label>
                    <input name="cover_image" type="file" className="input-field input-file" accept="image/*" />
                    {pack.cover_image_url && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Capa atual mantida se não enviar nova.</p>}
                  </div>
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
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
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Caminho relativo a <code>public/</code>. As imagens devem ser: <code>card.webp</code> (card quadrado), <code>cover.webp</code> (capa horizontal 16:9), <code>1.webp</code>, <code>2.webp</code>, etc. Se preenchido, a capa do card será <code>card.webp</code> da pasta e a capa 16:9 será <code>cover.webp</code>.</p>
                    {scanError && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>{scanError}</p>}
                    {hasCover && <p style={{ fontSize: '0.8rem', color: '#4ade80', margin: '4px 0 0 0' }}>✅ Imagem do card encontrada (card.webp)</p>}
                    {localArts.length > 0 && <p style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '2px' }}>✅ {localArts.length} arte(s) encontrada(s)</p>}
                  </div>
                </>
              )}

              <div className="input-group" style={{ gridColumn: '1 / -1' }}><label>Link de Checkout (Buy Link)</label><input name="buy_link" type="url" className="input-field" defaultValue={pack.buy_link || ''} placeholder="https://pay.hotmart.com/..." /></div>

              {!isChildPack && (
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input name="show_discount_tag" type="checkbox" defaultChecked={pack.show_discount_tag} style={{ width: '18px', height: '18px', accentColor: '#f97316', cursor: 'pointer' }} />
                    <span>🔥 Exibir tag &quot;Desconto Exclusivo&quot; quando bloqueado</span>
                  </label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Se ativado, o pack mostrará a tag de desconto no dashboard quando não estiver liberado.</p>
                </div>
              )}

              {!isChildPack && (
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input name="hide_when_locked" type="checkbox" defaultChecked={pack.hide_when_locked} style={{ width: '18px', height: '18px', accentColor: '#4ade80', cursor: 'pointer' }} />
                    <span>👁️ Ocultar pack caso o usuário não tenha acesso (não aparecerá como bloqueado)</span>
                  </label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Se ativado, este pack será invisível na dashboard para todos os usuários que não realizaram a compra.</p>
                </div>
              )}

              {isChildPack && (
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Pack Pai</label>
                  <select name="parent_pack_id" className="input-field" defaultValue={pack.parent_pack_id || ''}>
                    <option value="">Nenhum</option>
                    {parentPacks.filter(p => p.id !== pack.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {!isChildPack && <input type="hidden" name="parent_pack_id" value="" />}
            </div>
          </div>

          {/* PACK PAI: Specs + Sections */}
          {!isChildPack && (
            <>
              <div className="admin-form-section">
                <h2 className="admin-form-section-title">Especificações do Pack</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '12px' }}>Itens exibidos no modal quando o pack está bloqueado.</p>
                {specs.map((spec, i) => (
                  <div key={spec._key} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input type="text" className="input-field" value={spec.label} onChange={e => updateSpec(spec._key, e.target.value)} placeholder={`Especificação ${i + 1}`} style={{ flex: 1 }} />
                    <button type="button" onClick={() => removeSpec(spec._key)} className="btn-admin-action btn-delete" style={{ padding: '8px 12px', fontSize: '0.75rem' }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={addSpec} className="btn-admin-secondary" style={{ fontSize: '0.85rem' }}>+ Adicionar Especificação</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 className="admin-form-section-title" style={{ marginBottom: '0' }}>Seções do Pack</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-8px' }}>Use as setas ▲▼ para alterar a ordem das abas.</p>
                {sectionOrder.map((sectionType, idx) => renderSection(sectionType, idx))}
              </div>
            </>
          )}

          {/* PACK FILHO: Story Links */}
          {isChildPack && (
            <div className="admin-form-section">
              <h2 className="admin-form-section-title">📱 Links de Story</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '16px' }}>Links das artes em formato Story.</p>
              {subsections.length > 0 && subsections[0].links.map((link, li) => (
                <div key={link._key} className="admin-art-field" style={{ marginBottom: '8px' }}>
                  <div className="admin-art-field-header">
                    <span>Link {li + 1}{link.id ? '' : ' (novo)'}</span>
                    <button type="button" onClick={() => removeLink(subsections[0]._key, link._key)} className="btn-admin-action btn-delete">Remover</button>
                  </div>
                  <div className="admin-form-grid">
                    <div className="input-group"><label>URL *</label><input type="url" className="input-field" value={link.url} onChange={e => updateLink(subsections[0]._key, link._key, 'url', e.target.value)} placeholder="https://..." /></div>
                    <div className="input-group"><label>Texto (PT-BR) *</label><input type="text" className="input-field" value={link.label_pt} onChange={e => updateLink(subsections[0]._key, link._key, 'label_pt', e.target.value)} placeholder="Ex: Story Canva" /></div>
                    <div className="input-group"><label>Texto (Espanhol)</label><input type="text" className="input-field" value={link.label_es} onChange={e => updateLink(subsections[0]._key, link._key, 'label_es', e.target.value)} /></div>
                    <div className="input-group"><label>Posição</label><input type="number" className="input-field" value={link.order} onChange={e => updateLink(subsections[0]._key, link._key, 'order', parseInt(e.target.value) || 1)} min={1} /></div>
                  </div>
                </div>
              ))}
              {subsections.length > 0 && (
                <button type="button" onClick={() => addLink(subsections[0]._key)} className="btn-admin-secondary" style={{ fontSize: '0.85rem' }}>+ Adicionar Link de Story</button>
              )}
              {subsections.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma subseção Story encontrada. Adicione links e salve.</p>
              )}
            </div>
          )}

          <button type="submit" className="btn-primary btn-submit" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? (<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><span className="loading-spinner" />Salvando...</span>) : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
