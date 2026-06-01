'use client'

import { useState } from 'react'
import { updateSuggestionStatusAction, updateSuggestionNotesAction, deleteSuggestionAction } from './actions'

interface Suggestion {
  id: string
  member_name: string
  member_email: string
  niche: string
  message: string
  pack_name: string
  status: string
  admin_notes: string
  created_at: string
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '⏳ Pendente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  reviewed: { label: '👀 Analisado', color: '#0088ff', bg: 'rgba(0, 136, 255, 0.1)' },
  approved: { label: '✅ Aprovado', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  rejected: { label: '❌ Rejeitado', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
}

export default function SuggestionsList({ suggestions: initial }: { suggestions: Suggestion[] }) {
  const [suggestions, setSuggestions] = useState(initial)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [notesMap, setNotesMap] = useState<Record<string, string>>(
    Object.fromEntries(initial.map(s => [s.id, s.admin_notes || '']))
  )

  const filtered = filter === 'all' ? suggestions : suggestions.filter(s => s.status === filter)

  async function handleStatus(id: string, status: string) {
    const result = await updateSuggestionStatusAction(id, status)
    if (!result.error) {
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    }
  }

  async function handleSaveNotes(id: string) {
    await updateSuggestionNotesAction(id, notesMap[id] || '')
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta sugestão?')) return
    const result = await deleteSuggestionAction(id)
    if (!result.error) {
      setSuggestions(prev => prev.filter(s => s.id !== id))
    }
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `Todas (${suggestions.length})` },
          { key: 'pending', label: `Pendentes (${suggestions.filter(s => s.status === 'pending').length})` },
          { key: 'reviewed', label: `Analisadas (${suggestions.filter(s => s.status === 'reviewed').length})` },
          { key: 'approved', label: `Aprovadas (${suggestions.filter(s => s.status === 'approved').length})` },
          { key: 'rejected', label: `Rejeitadas (${suggestions.filter(s => s.status === 'rejected').length})` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="btn-admin-action"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: filter === f.key ? 'rgba(0, 82, 255, 0.15)' : undefined,
              borderColor: filter === f.key ? 'rgba(0, 82, 255, 0.3)' : undefined,
              color: filter === f.key ? '#0088ff' : undefined,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
          Nenhuma sugestão {filter !== 'all' ? 'neste filtro' : 'recebida ainda'}.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(s => {
            const statusInfo = STATUS_MAP[s.status] || STATUS_MAP.pending
            const isExpanded = expandedId === s.id
            const date = new Date(s.created_at)
            const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

            return (
              <div
                key={s.id}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.01)',
                }}
              >
                {/* Header row */}
                <div
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, color: statusInfo.color, background: statusInfo.bg, border: `1px solid ${statusInfo.color}30`, whiteSpace: 'nowrap' }}>
                        {statusInfo.label}
                      </span>
                      {s.pack_name && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 500 }}>📦 {s.pack_name}</span>
                      )}
                      {s.niche && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🏷️ {s.niche}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' }}>
                      {s.message}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      {s.member_name || 'Anônimo'} {s.member_email && `· ${s.member_email}`} · {dateStr}
                    </p>
                  </div>
                  <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '0.8rem', flexShrink: 0 }}>▼</span>
                </div>

                {/* Expanded area */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                    {/* Full message */}
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Mensagem completa</p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        {s.message}
                      </p>
                    </div>

                    {/* Admin notes */}
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Notas do Admin</p>
                      <textarea
                        className="input-field input-textarea"
                        rows={2}
                        placeholder="Anotações internas..."
                        value={notesMap[s.id] || ''}
                        onChange={e => setNotesMap({ ...notesMap, [s.id]: e.target.value })}
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button onClick={() => handleSaveNotes(s.id)} className="btn-admin-action" style={{ marginTop: '6px', fontSize: '0.75rem' }}>Salvar Nota</button>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleStatus(s.id, 'reviewed')} className="btn-admin-action" style={{ fontSize: '0.75rem' }}>👀 Analisado</button>
                      <button onClick={() => handleStatus(s.id, 'approved')} className="btn-admin-action" style={{ fontSize: '0.75rem', borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}>✅ Aprovar</button>
                      <button onClick={() => handleStatus(s.id, 'rejected')} className="btn-admin-action" style={{ fontSize: '0.75rem', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>❌ Rejeitar</button>
                      <button onClick={() => handleDelete(s.id)} className="btn-admin-action btn-delete" style={{ fontSize: '0.75rem', marginLeft: 'auto' }}>🗑️ Excluir</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
