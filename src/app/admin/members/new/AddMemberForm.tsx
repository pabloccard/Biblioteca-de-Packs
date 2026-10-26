'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { addMemberAndAssignPackAction, bulkAddSingleMemberAction } from '../../actions'

interface Pack { id: string; name: string; version: string }

type BulkResult = { email: string; status: 'created' | 'existing' | 'error'; message: string }

export default function AddMemberForm({ allPacks }: { allPacks: Pack[] }) {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memberExists, setMemberExists] = useState(false)
  const [success, setSuccess] = useState(false)

  // Bulk state
  const [bulkText, setBulkText] = useState('')
  const [bulkPackId, setBulkPackId] = useState('')
  const [bulkLanguage, setBulkLanguage] = useState('pt')
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([])
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })
  const [bulkDone, setBulkDone] = useState(false)

  const logEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll log
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [bulkResults])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setMemberExists(false)
    setSuccess(false)

    const result = await addMemberAndAssignPackAction(formData)

    if (result?.error === 'MEMBER_EXISTS') {
      setMemberExists(true)
    } else if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  function parseBulkText(text: string): { name: string; email: string }[] {
    const lines = text.split('\n').filter(l => l.trim())
    const members: { name: string; email: string }[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      const parts = trimmed.split(/[,;\t]+/).map(p => p.trim())

      if (parts.length >= 2) {
        const emailPart = parts.find(p => p.includes('@'))
        const namePart = parts.find(p => !p.includes('@')) || ''
        if (emailPart) {
          members.push({ name: namePart, email: emailPart })
        }
      } else if (parts.length === 1 && parts[0].includes('@')) {
        members.push({ name: '', email: parts[0] })
      }
    }

    return members
  }

  async function handleBulkSubmit() {
    setBulkProcessing(true)
    setBulkError(null)
    setBulkResults([])
    setBulkDone(false)

    const members = parseBulkText(bulkText)

    if (members.length === 0) {
      setBulkError('Nenhum email válido encontrado na lista.')
      setBulkProcessing(false)
      return
    }

    if (!bulkPackId) {
      setBulkError('Selecione um pack para atribuir.')
      setBulkProcessing(false)
      return
    }

    setBulkProgress({ current: 0, total: members.length })

    for (let i = 0; i < members.length; i++) {
      const result = await bulkAddSingleMemberAction({
        name: members[i].name,
        email: members[i].email,
        pack_id: bulkPackId,
        language: bulkLanguage,
      })

      setBulkResults(prev => [...prev, result])
      setBulkProgress({ current: i + 1, total: members.length })
    }

    setBulkDone(true)
    setBulkProcessing(false)
  }

  const previewMembers = parseBulkText(bulkText)
  const progressPercent = bulkProgress.total > 0 ? Math.round((bulkProgress.current / bulkProgress.total) * 100) : 0

  const summary = {
    created: bulkResults.filter(r => r.status === 'created').length,
    existing: bulkResults.filter(r => r.status === 'existing').length,
    errors: bulkResults.filter(r => r.status === 'error').length,
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header"><h1 className="pack-name">Adicionar Membro</h1></header>

        {success ? (
          <div className="admin-form-section" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '2rem', marginBottom: '16px' }}>✅</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Membro adicionado com sucesso!</p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>O membro foi criado e o pack atribuído.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => { setSuccess(false); setError(null) }} className="btn-admin-secondary">Adicionar outro</button>
              <Link href="/admin" className="btn-admin-primary">Voltar ao painel</Link>
            </div>
          </div>
        ) : (
          <form className="admin-form" action={handleSubmit}>
            <div className="admin-form-section">
              <h2 className="admin-form-section-title">Adicionar Individualmente</h2>
              <div className="admin-form-grid">
                <div className="input-group">
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" className="input-field" required placeholder="email@exemplo.com" />
                </div>
                <div className="input-group">
                  <label htmlFor="name">Nome</label>
                  <input id="name" name="name" type="text" className="input-field" placeholder="Nome do membro" />
                </div>
                <div className="input-group">
                  <label htmlFor="language">Idioma *</label>
                  <select id="language" name="language" className="input-field">
                    <option value="pt">Português (PT-BR)</option>
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="pack_id">Pack *</label>
                  <select id="pack_id" name="pack_id" className="input-field" required>
                    <option value="">Selecione um pack...</option>
                    {allPacks.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.version || '1.0'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {memberExists && (
              <div className="admin-member-exists">
                <p><strong>⚠️ Este membro já existe.</strong></p>
                <p>Para atribuir packs ou editar os dados, vá para a área de gerenciamento.</p>
                <Link href="/admin/members/search" className="btn-admin-primary" style={{ marginTop: '12px', display: 'inline-flex' }}>
                  Gerenciar Membro →
                </Link>
              </div>
            )}

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn-primary btn-submit" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="loading-spinner" />Adicionando...
                </span>
              ) : 'Adicionar Membro'}
            </button>
          </form>
        )}

        {/* ======================== */}
        {/* SEÇÃO DE ADIÇÃO EM MASSA */}
        {/* ======================== */}
        <div className="bulk-section">
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">Adicionar em Massa</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Cole uma lista com nome e email (um por linha). Formatos aceitos:<br />
              <code style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                Nome, email@exemplo.com
              </code>{' '}ou apenas{' '}
              <code style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                email@exemplo.com
              </code>
            </p>

            <div className="admin-form-grid">
              <div className="input-group">
                <label htmlFor="bulk_pack">Pack *</label>
                <select
                  id="bulk_pack"
                  className="input-field"
                  value={bulkPackId}
                  onChange={e => setBulkPackId(e.target.value)}
                  disabled={bulkProcessing}
                >
                  <option value="">Selecione um pack...</option>
                  {allPacks.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.version || '1.0'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="bulk_language">Idioma padrão *</label>
                <select
                  id="bulk_language"
                  className="input-field"
                  value={bulkLanguage}
                  onChange={e => setBulkLanguage(e.target.value)}
                  disabled={bulkProcessing}
                >
                  <option value="pt">Português (PT-BR)</option>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label htmlFor="bulk_list">Lista de Membros *</label>
              <textarea
                id="bulk_list"
                className="input-field bulk-textarea"
                rows={8}
                placeholder={`João Silva, joao@email.com\nMaria Souza, maria@email.com\ncarlos@email.com`}
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                disabled={bulkProcessing}
              />
            </div>

            {/* Preview (antes de iniciar) */}
            {previewMembers.length > 0 && !bulkProcessing && !bulkDone && (
              <div className="bulk-preview">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>
                  📋 {previewMembers.length} membro{previewMembers.length !== 1 ? 's' : ''} detectado{previewMembers.length !== 1 ? 's' : ''}:
                </p>
                <div className="bulk-preview-list">
                  {previewMembers.slice(0, 10).map((m, i) => (
                    <div key={i} className="bulk-preview-item">
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.email}</span>
                      {m.name && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{m.name}</span>}
                    </div>
                  ))}
                  {previewMembers.length > 10 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
                      ... e mais {previewMembers.length - 10}
                    </p>
                  )}
                </div>
              </div>
            )}

            {bulkError && <div className="login-error">{bulkError}</div>}

            {/* Progress bar + Live log (durante e depois) */}
            {(bulkProcessing || bulkDone) && (
              <div className="bulk-live-section">
                {/* Progress bar */}
                <div className="bulk-progress-bar-container">
                  <div className="bulk-progress-header">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {bulkDone ? '✅ Concluído' : `⏳ Processando...`}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {bulkProgress.current} / {bulkProgress.total} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="bulk-progress-track">
                    <div
                      className="bulk-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Summary counters (live) */}
                <div className="bulk-summary">
                  <div className="bulk-stat bulk-stat-created">
                    <span className="bulk-stat-number">{summary.created}</span>
                    <span className="bulk-stat-label">Criados</span>
                  </div>
                  <div className="bulk-stat bulk-stat-existing">
                    <span className="bulk-stat-number">{summary.existing}</span>
                    <span className="bulk-stat-label">Existentes</span>
                  </div>
                  <div className="bulk-stat bulk-stat-error">
                    <span className="bulk-stat-number">{summary.errors}</span>
                    <span className="bulk-stat-label">Erros</span>
                  </div>
                </div>

                {/* Live log */}
                <div className="bulk-log">
                  <div className="bulk-log-header">
                    <span>📜 Log em tempo real</span>
                  </div>
                  <div className="bulk-log-body">
                    {bulkResults.map((r, i) => (
                      <div key={i} className={`bulk-log-entry bulk-log-${r.status}`}>
                        <span className="bulk-log-index">{String(i + 1).padStart(3, '0')}</span>
                        <span className="bulk-log-indicator">
                          {r.status === 'created' ? '✅' : r.status === 'existing' ? '🔄' : '❌'}
                        </span>
                        <span className="bulk-log-email">{r.email}</span>
                        <span className="bulk-log-msg">{r.message}</span>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>

                {bulkDone && (
                  <button
                    type="button"
                    className="btn-admin-secondary"
                    style={{ marginTop: '20px' }}
                    onClick={() => {
                      setBulkResults([])
                      setBulkDone(false)
                      setBulkText('')
                      setBulkProgress({ current: 0, total: 0 })
                    }}
                  >
                    Importar mais membros
                  </button>
                )}
              </div>
            )}

            {!bulkProcessing && !bulkDone && (
              <button
                type="button"
                className="btn-primary btn-submit"
                disabled={previewMembers.length === 0}
                onClick={handleBulkSubmit}
                style={{ marginTop: '20px' }}
              >
                {`Adicionar ${previewMembers.length} Membro${previewMembers.length !== 1 ? 's' : ''} em Massa`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
