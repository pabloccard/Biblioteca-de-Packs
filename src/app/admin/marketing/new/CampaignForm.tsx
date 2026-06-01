'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { createCampaignAction, sendTestEmailAction, getMarketingRecipients } from '../../marketing-actions'

interface Pack { id: string; name: string; version: string; parent_pack_id: string | null }
interface Recipient { id: string; email: string; name: string }
interface CampaignFormProps { packs: Pack[] }

export default function CampaignForm({ packs }: CampaignFormProps) {
  const STORAGE_KEY = 'mkt_campaign_draft'

  const [campaignName, setCampaignName] = useState('')
  const [fromName, setFromName] = useState('Pablo Castilho')
  const [fromEmail, setFromEmail] = useState('send@pablocastilho.com.br')
  const [subject, setSubject] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [htmlContent, setHtmlContent] = useState(defaultTemplate)
  const [includePacks, setIncludePacks] = useState<string[]>([])
  const [excludePacks, setExcludePacks] = useState<string[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showRecipients, setShowRecipients] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testMsg, setTestMsg] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isLoadingCount, setIsLoadingCount] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [savedBatch, setSavedBatch] = useState<number | null>(null)

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false)
  const [dragAction, setDragAction] = useState<'select' | 'deselect' | null>(null)

  // Carregar rascunho do localStorage APÓS montagem (evita hydration mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.campaignName) setCampaignName(draft.campaignName)
        if (draft.fromName) setFromName(draft.fromName)
        if (draft.fromEmail) setFromEmail(draft.fromEmail)
        if (draft.subject) setSubject(draft.subject)
        if (draft.previewText) setPreviewText(draft.previewText)
        if (draft.htmlContent) setHtmlContent(draft.htmlContent)
        if (draft.includePacks) setIncludePacks(draft.includePacks)
        if (draft.excludePacks) setExcludePacks(draft.excludePacks)
        if (draft.testEmail) setTestEmail(draft.testEmail)
        if (draft.selectedBatch !== undefined && draft.selectedBatch !== null) setSavedBatch(draft.selectedBatch)
      }
    } catch {}
    setDraftLoaded(true)
  }, [])

  // Auto-save no localStorage (só após carregar o rascunho)
  useEffect(() => {
    if (!draftLoaded) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          campaignName, fromName, fromEmail, subject, previewText, htmlContent,
          includePacks, excludePacks, testEmail, selectedBatch: savedBatch,
        }))
      } catch {}
    }, 500)
    return () => clearTimeout(timer)
  }, [campaignName, fromName, fromEmail, subject, previewText, htmlContent, includePacks, excludePacks, testEmail, draftLoaded, savedBatch])

  useEffect(() => {
    function handleMouseUp() {
      setIsDragging(false)
      setDragAction(null)
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const refreshRecipients = useCallback(async () => {
    setIsLoadingCount(true)
    try {
      const result = await getMarketingRecipients({
        include_packs: includePacks,
        exclude_packs: excludePacks,
      })
      setRecipients(result)
      // Se tem um bloco salvo, re-selecionar ele; senão selecionar todos
      if (savedBatch !== null) {
        const start = savedBatch * BATCH_SIZE
        const end = Math.min(start + BATCH_SIZE, result.length)
        if (start < result.length) {
          const batchIds = result.slice(start, end).map((r: Recipient) => r.id)
          setSelectedIds(new Set(batchIds))
        } else {
          setSelectedIds(new Set(result.map((r: Recipient) => r.id)))
        }
      } else {
        setSelectedIds(new Set(result.map((r: Recipient) => r.id)))
      }
      setShowRecipients(true)
    } catch {
      setRecipients([])
      setSelectedIds(new Set())
    }
    setIsLoadingCount(false)
  }, [includePacks, excludePacks, savedBatch])

  function togglePack(packId: string, list: 'include' | 'exclude') {
    if (list === 'include') {
      setIncludePacks(prev => prev.includes(packId) ? prev.filter(p => p !== packId) : [...prev, packId])
      setExcludePacks(prev => prev.filter(p => p !== packId))
    } else {
      setExcludePacks(prev => prev.includes(packId) ? prev.filter(p => p !== packId) : [...prev, packId])
      setIncludePacks(prev => prev.filter(p => p !== packId))
    }
    setShowRecipients(false)
  }

  function toggleRecipient(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleMouseDown(id: string) {
    setIsDragging(true)
    const isSelected = selectedIds.has(id)
    const action = isSelected ? 'deselect' : 'select'
    setDragAction(action)
    updateSelection(id, action)
  }

  function handleMouseEnter(id: string) {
    if (isDragging && dragAction) {
      updateSelection(id, dragAction)
    }
  }

  function updateSelection(id: string, action: 'select' | 'deselect') {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (action === 'select') next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedIds.size === recipients.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(recipients.map(r => r.id)))
    }
  }

  const BATCH_SIZE = 100
  const totalBatches = Math.ceil(recipients.length / BATCH_SIZE)

  function selectBatch(batchIndex: number) {
    const start = batchIndex * BATCH_SIZE
    const end = Math.min(start + BATCH_SIZE, recipients.length)
    const batchIds = recipients.slice(start, end).map(r => r.id)
    setSelectedIds(new Set(batchIds))
    setSavedBatch(batchIndex)
  }

  function getBatchLabel(batchIndex: number) {
    const start = batchIndex * BATCH_SIZE + 1
    const end = Math.min((batchIndex + 1) * BATCH_SIZE, recipients.length)
    return `${start}-${end}`
  }

  function isBatchSelected(batchIndex: number) {
    const start = batchIndex * BATCH_SIZE
    const end = Math.min(start + BATCH_SIZE, recipients.length)
    const batchIds = recipients.slice(start, end).map(r => r.id)
    return batchIds.length > 0 && batchIds.every(id => selectedIds.has(id)) && selectedIds.size === batchIds.length
  }

  async function handleSendTest() {
    setTestMsg('')
    const fd = new FormData()
    fd.set('subject', subject)
    fd.set('html_content', htmlContent)
    fd.set('test_email', testEmail)
    fd.set('from_name', fromName)
    fd.set('from_email', fromEmail)
    fd.set('preview_text', previewText)
    const result = await sendTestEmailAction(fd)
    setTestMsg(result.error || '✅ Email de teste enviado!')
  }

  function handleSubmit() {
    if (!subject.trim()) { setError('Informe o assunto'); return }
    if (!htmlContent.trim()) { setError('Informe o conteúdo HTML'); return }
    if (selectedIds.size === 0) { setError('Selecione pelo menos 1 destinatário'); return }

    setError('')
    startTransition(async () => {
      const fd = new FormData()
      fd.set('campaign_name', campaignName)
      fd.set('from_name', fromName)
      fd.set('from_email', fromEmail)
      fd.set('subject', subject)
      fd.set('preview_text', previewText)
      fd.set('html_content', htmlContent)
      fd.set('include_packs', JSON.stringify(includePacks))
      fd.set('exclude_packs', JSON.stringify(excludePacks))
      fd.set('selected_member_ids', JSON.stringify(Array.from(selectedIds)))
      const result = await createCampaignAction(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        // Limpar rascunho após criação com sucesso
        try { localStorage.removeItem(STORAGE_KEY) } catch {}
      }
    })
  }

  const allSelected = recipients.length > 0 && selectedIds.size === recipients.length

  return (
    <div className="admin-form">
      {error && <div className="login-error">{error}</div>}

      {/* SEÇÃO 1: NOME + FILTROS */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🎯 Destinatários</h2>

        <div className="input-group" style={{ marginBottom: '16px' }}>
          <label>Nome da Campanha</label>
          <input
            type="text"
            className="input-field"
            value={campaignName}
            onChange={e => setCampaignName(e.target.value)}
            placeholder="Ex: Black Friday 2026, Lançamento Pack X..."
          />
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Filtre os destinatários por packs. Sem filtros = todos os inscritos.
        </p>

        <div className="mkt-filter-grid">
          <div className="mkt-filter-group">
            <label className="mkt-filter-label">✅ Comprou estes packs (AND)</label>
            <div className="mkt-filter-chips">
              {packs.map(p => (
                <button
                  key={`inc-${p.id}`}
                  type="button"
                  className={`mkt-chip ${includePacks.includes(p.id) ? 'mkt-chip-active-green' : ''}`}
                  onClick={() => togglePack(p.id, 'include')}
                >
                  {p.name} ({p.version || '1.0'})
                </button>
              ))}
            </div>
          </div>

          <div className="mkt-filter-group">
            <label className="mkt-filter-label">🚫 NÃO comprou estes packs</label>
            <div className="mkt-filter-chips">
              {packs.map(p => (
                <button
                  key={`exc-${p.id}`}
                  type="button"
                  className={`mkt-chip ${excludePacks.includes(p.id) ? 'mkt-chip-active-red' : ''}`}
                  onClick={() => togglePack(p.id, 'exclude')}
                >
                  {p.name} ({p.version || '1.0'})
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mkt-filter-preview">
          <button type="button" onClick={refreshRecipients} className="btn-admin-secondary" disabled={isLoadingCount} style={{ fontSize: '0.85rem' }}>
            {isLoadingCount ? 'Buscando...' : '🔍 Buscar Destinatários'}
          </button>
          {showRecipients && (
            <span className="mkt-recipient-count">
              <strong>{selectedIds.size}</strong> de {recipients.length} selecionados
            </span>
          )}
        </div>

        {/* Lista de destinatários */}
        {showRecipients && recipients.length > 0 && (
          <div className="mkt-recipients-box">
            <div className="mkt-recipients-header">
              <label className="mkt-select-all" onClick={toggleAll}>
                <input type="checkbox" checked={allSelected} readOnly style={{ width: '16px', height: '16px', accentColor: '#0088ff', cursor: 'pointer' }} />
                <span>{allSelected ? 'Desmarcar todos' : 'Selecionar todos'}</span>
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{recipients.length} encontrados</span>
            </div>

            {/* Seleção por Blocos */}
            {totalBatches > 1 && (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  📦 Selecionar por bloco de {BATCH_SIZE}:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Array.from({ length: totalBatches }, (_, i) => (
                    <button
                      key={`batch-${i}`}
                      type="button"
                      onClick={() => selectBatch(i)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: isBatchSelected(i) ? '#0088ff' : 'rgba(255,255,255,0.12)',
                        borderRadius: '6px',
                        background: isBatchSelected(i) ? 'rgba(0,136,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: isBatchSelected(i) ? '#0088ff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Bloco {i + 1} ({getBatchLabel(i)})
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mkt-recipients-list" style={{ userSelect: 'none' }}>
              {recipients.map(r => (
                <div 
                  key={r.id} 
                  className={`mkt-recipient-item ${selectedIds.has(r.id) ? 'selected' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); handleMouseDown(r.id) }}
                  onMouseEnter={() => handleMouseEnter(r.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(r.id)}
                    readOnly
                    style={{ width: '15px', height: '15px', accentColor: '#0088ff', pointerEvents: 'none', flexShrink: 0 }}
                  />
                  <span className="mkt-recipient-email">{r.email}</span>
                  {r.name && <span className="mkt-recipient-name">{r.name}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {showRecipients && recipients.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '24px 0' }}>
            Nenhum destinatário encontrado com estes filtros.
          </p>
        )}
      </div>

      {/* SEÇÃO 2: CONTEÚDO */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">✉️ Conteúdo do Email</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div className="input-group">
            <label>Nome do Remetente</label>
            <input
              type="text"
              className="input-field"
              value={fromName}
              onChange={e => setFromName(e.target.value)}
              placeholder="Ex: Pablo Castilho"
            />
          </div>
          <div className="input-group">
            <label>Email do Remetente</label>
            <input
              type="email"
              className="input-field"
              value={fromEmail}
              onChange={e => setFromEmail(e.target.value)}
              placeholder="Ex: send@seudominio.com"
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: '16px' }}>
          <label>Assunto *</label>
          <input
            type="text"
            className="input-field"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Ex: Novidades para você! 🚀"
          />
        </div>

        <div className="input-group" style={{ marginBottom: '16px' }}>
          <label>Preview Text <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(texto que aparece antes de abrir o email)</span></label>
          <input
            type="text"
            className="input-field"
            value={previewText}
            onChange={e => setPreviewText(e.target.value)}
            placeholder="Ex: Confira as novidades do novo pack de artes..."
          />
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Variáveis: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{'{{nome}}'}</code> <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{'{{email}}'}</code>
        </p>

        {/* Editor Tabs */}
        <div className="mkt-editor-tabs">
          <button type="button" className={`mkt-editor-tab ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>Código HTML</button>
          <button type="button" className={`mkt-editor-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>Preview</button>
        </div>

        {activeTab === 'editor' ? (
          <textarea
            className="input-field mkt-html-editor"
            value={htmlContent}
            onChange={e => setHtmlContent(e.target.value)}
            rows={20}
            spellCheck={false}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5 }}
          />
        ) : (
          <div className="mkt-preview-frame">
            <div dangerouslySetInnerHTML={{ __html: htmlContent.replace(/\{\{nome\}\}/g, 'João').replace(/\{\{email\}\}/g, 'joao@email.com') }} />
          </div>
        )}
      </div>

      {/* SEÇÃO 3: AÇÕES */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🚀 Enviar</h2>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>Email de Teste</label>
            <input type="email" className="input-field" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <button type="button" onClick={handleSendTest} className="btn-admin-secondary" style={{ whiteSpace: 'nowrap', height: 'fit-content' }}>
            📨 Enviar Teste
          </button>
        </div>
        {testMsg && <p style={{ fontSize: '0.85rem', color: testMsg.startsWith('✅') ? 'var(--success)' : 'var(--error)', marginBottom: '16px' }}>{testMsg}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary btn-submit"
          disabled={isPending || selectedIds.size === 0}
          style={{ width: '100%' }}
        >
          {isPending ? '⏳ Criando campanha...' : `📧 Criar Campanha (${selectedIds.size} destinatário${selectedIds.size !== 1 ? 's' : ''})`}
        </button>
      </div>
    </div>
  )
}

const defaultTemplate = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  /* Fallback styles in case inline is ignored */
  body { margin: 0; padding: 0; background-color: #050505; }
  
  /* Media queries for Mobile responsiveness */
  @media only screen and (max-width: 480px) {
    .mkt-banner-text { display: inline-block !important; margin-right: 4px !important; margin-bottom: 0 !important; font-size: 11px !important; }
    .mkt-banner-date { font-size: 11px !important; padding: 4px 8px !important; }
    .mkt-main-title { font-size: 24px !important; }
    .mkt-btn { width: 100% !important; padding: 16px 20px !important; font-size: 16px !important; box-sizing: border-box !important; }
    .mkt-benefits-text { font-size: 15px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#050505;">
  <div style="max-width:600px; margin:0 auto; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#050505; color:#ffffff;">
    
    <!-- Banner Topo Verde -->
    <div style="background-color:#00e676; padding:12px; text-align:center;">
      <span class="mkt-banner-text" style="color:#000000; font-size:14px; font-weight:800; letter-spacing:1px; vertical-align:middle; margin-right:8px;">PACK LANÇADO EM:</span>
      <span class="mkt-banner-date" style="display:inline-block; background-color:#000000; color:#00e676; font-size:14px; font-weight:700; padding:4px 16px; border-radius:20px; vertical-align:middle;">01 - JUNHO - 2026</span>
    </div>

    <!-- Area da Capa com Imagem de Fundo (Substitua a URL da imagem) -->
    <div style="background-color:#111111; background-image:url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'); background-size:cover; background-position:center; text-align:center;">
      <!-- Overlay Escuro para dar leitura ao texto -->
      <div style="background-color:rgba(0,0,0,0.7); padding:50px 20px;">
        <h1 class="mkt-main-title" style="margin:0; font-size:28px; font-weight:800; line-height:1.2; color:#ffffff;">
          Pack de Artes para<br>Provedores de<br>Internet Lançado!
        </h1>
        <p style="color:#cccccc; font-size:15px; margin-top:16px;">Olá, {{nome}}! A espera acabou.</p>
      </div>
    </div>

    <!-- Lista de Benefícios -->
    <div style="padding:40px 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td width="40" valign="top" style="padding-bottom:20px;">
            <div style="color:#888888; font-size:18px; font-weight:bold; line-height:20px;">✓</div>
          </td>
          <td class="mkt-benefits-text" valign="middle" style="padding-bottom:20px; font-size:16px; color:#888888;">40 artes profissionais</td>
        </tr>
        <tr>
          <td width="40" valign="top" style="padding-bottom:20px;">
            <div style="color:#888888; font-size:18px; font-weight:bold; line-height:20px;">✓</div>
          </td>
          <td class="mkt-benefits-text" valign="middle" style="padding-bottom:20px; font-size:16px; color:#888888;">Artes para Copa do Mundo</td>
        </tr>
        <tr>
          <td width="40" valign="top" style="padding-bottom:20px;">
            <div style="color:#888888; font-size:18px; font-weight:bold; line-height:20px;">✓</div>
          </td>
          <td class="mkt-benefits-text" valign="middle" style="padding-bottom:20px; font-size:16px; color:#888888;">Cores editáveis</td>
        </tr>
        <tr>
          <td width="40" valign="top" style="padding-bottom:20px;">
            <div style="color:#888888; font-size:18px; font-weight:bold; line-height:20px;">✓</div>
          </td>
          <td class="mkt-benefits-text" valign="middle" style="padding-bottom:20px; font-size:16px; color:#888888;">Editável no Canva e Photoshop</td>
        </tr>
        <tr>
          <td width="40" valign="top" style="padding-bottom:20px;">
            <div style="color:#888888; font-size:18px; font-weight:bold; line-height:20px;">✓</div>
          </td>
          <td class="mkt-benefits-text" valign="middle" style="padding-bottom:20px; font-size:16px; color:#888888;">Alta resolução 2160x2700</td>
        </tr>
        <tr>
          <td width="40" valign="top" style="padding-bottom:20px;">
            <div style="color:#888888; font-size:18px; font-weight:bold; line-height:20px;">✓</div>
          </td>
          <td class="mkt-benefits-text" valign="middle" style="padding-bottom:20px; font-size:16px; color:#888888;">Vídeo aula ensinando como editar</td>
        </tr>
        <tr>
          <td width="40" valign="top" style="padding-bottom:20px;">
            <div style="color:#888888; font-size:18px; font-weight:bold; line-height:20px;">✓</div>
          </td>
          <td class="mkt-benefits-text" valign="middle" style="padding-bottom:20px; font-size:16px; color:#888888;">E muito mais!</td>
        </tr>
      </table>
    </div>

    <!-- Botão de Ação -->
    <div style="text-align:center; padding:0 20px 40px 20px;">
      <!-- Usamos o gradiente padrão de botões e fallback color sólido -->
      <a href="https://seulink.com" class="mkt-btn" style="display:inline-block; padding:18px 40px; background-color:#0052FF; background:linear-gradient(90deg, #0052FF 0%, #00B2FF 100%); color:#ffffff; font-size:18px; font-weight:700; text-decoration:none; border-radius:8px; letter-spacing:1px; width:80%; max-width:400px; text-transform:uppercase;">GARANTIR PACK</a>
    </div>

    <!-- Rodapé: Unsubscribe e WhatsApp -->
    <div style="text-align:center; padding:20px 20px 60px 20px; border-top:1px solid #222222;">
      <p style="margin:0 0 16px 0; font-size:13px; color:#888888;">
        Ficou com alguma dúvida? 
        <a href="https://wa.me/5564993237320" data-no-track style="color:#888888; text-decoration:underline;">WhatsApp</a>
      </p>
      <p style="margin:0 0 8px 0; font-size:11px; color:#555555;">
        &copy; 2026 Sua Empresa. Todos os direitos reservados.
      </p>
      <p style="margin:0; font-size:11px; color:#555555;">
        <a href="{{unsubscribe_link}}" data-no-track style="color:#555555; text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`
