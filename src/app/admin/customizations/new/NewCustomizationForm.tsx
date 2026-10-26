'use client'

import { useState } from 'react'
import { createSimpleCustomizationOrderAction } from '../../customization-actions'

interface Pack {
  id: string
  name: string
  version: string
}

export default function NewCustomizationForm({ packs }: { packs: Pack[] }) {
  const [packId, setPackId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientWhatsapp, setClientWhatsapp] = useState('')
  const [status, setStatus] = useState('waiting')
  const [generalNotes, setGeneralNotes] = useState('')

  const [feedUrl, setFeedUrl] = useState('')
  const [storiesUrl, setStoriesUrl] = useState('')
  const [canvaFeedUrl, setCanvaFeedUrl] = useState('')
  const [canvaStoriesUrl, setCanvaStoriesUrl] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!packId || !clientEmail.trim()) {
      setError('Selecione o pack e informe o e-mail do cliente.')
      return
    }

    setSubmitting(true)
    setError('')

    const fd = new FormData()
    fd.set('pack_id', packId)
    fd.set('client_name', clientName)
    fd.set('client_email', clientEmail)
    fd.set('client_whatsapp', clientWhatsapp)
    fd.set('status', status)
    fd.set('general_notes', generalNotes)
    fd.set('feed_url', feedUrl)
    fd.set('stories_url', storiesUrl)
    fd.set('canva_feed_url', canvaFeedUrl)
    fd.set('canva_stories_url', canvaStoriesUrl)

    const result = await createSimpleCustomizationOrderAction(fd)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{ gap: '24px' }}>
      {error && <div className="login-error">{error}</div>}

      {/* Dados do Cliente */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">👤 Informações do Cliente</h2>
        <div className="admin-form-grid">
          <div className="input-group">
            <label htmlFor="client_name">Nome do Cliente</label>
            <input
              id="client_name"
              type="text"
              className="input-field"
              placeholder="Ex: Carlos Silva"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="client_email">E-mail do Cliente *</label>
            <input
              id="client_email"
              type="email"
              className="input-field"
              placeholder="cliente@exemplo.com"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="client_whatsapp">WhatsApp do Cliente</label>
            <input
              id="client_whatsapp"
              type="text"
              className="input-field"
              placeholder="Ex: 64993237320"
              value={clientWhatsapp}
              onChange={e => setClientWhatsapp(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="pack_id">Pack Contratado *</label>
            <select
              id="pack_id"
              className="input-field"
              value={packId}
              onChange={e => setPackId(e.target.value)}
              required
            >
              <option value="">Selecione um pack...</option>
              {packs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.version || '1.0'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Links de Entrega (Opcionais se ainda for produzir) */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🔗 Links de Entrega das Artes (Opcional na criação)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Se as artes já estiverem prontas, você pode preencher os links agora. Caso contrário, pode salvar como <strong>Pendente</strong> e adicionar os links mais tarde.
        </p>

        <div className="admin-form-grid">
          <div className="input-group">
            <label htmlFor="feed_url">📁 Link Artes Feed (1080×1440)</label>
            <input
              id="feed_url"
              type="url"
              className="input-field"
              placeholder="https://drive.google.com/..."
              value={feedUrl}
              onChange={e => setFeedUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="stories_url">📱 Link Artes Stories (1080×1920)</label>
            <input
              id="stories_url"
              type="url"
              className="input-field"
              placeholder="https://drive.google.com/..."
              value={storiesUrl}
              onChange={e => setStoriesUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="canva_feed_url">🎨 Template Canva (Feed 1080×1440)</label>
            <input
              id="canva_feed_url"
              type="url"
              className="input-field"
              placeholder="https://www.canva.com/design/..."
              value={canvaFeedUrl}
              onChange={e => setCanvaFeedUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="canva_stories_url">🎨 Template Canva (Stories 1080×1920)</label>
            <input
              id="canva_stories_url"
              type="url"
              className="input-field"
              placeholder="https://www.canva.com/design/..."
              value={canvaStoriesUrl}
              onChange={e => setCanvaStoriesUrl(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status e Observações */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">⚙️ Status Inicial e Observações</h2>

        <div className="admin-form-grid" style={{ marginBottom: '16px' }}>
          <div className="input-group">
            <label htmlFor="status">Status do Pedido</label>
            <select
              id="status"
              className="input-field"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="waiting">⏳ Aguardando Cliente (Enviar Formulário no WhatsApp)</option>
              <option value="pending">📩 Dados Recebidos (Pendente de Produção)</option>
              <option value="in_progress">🎨 Em Produção</option>
              <option value="delivered">✅ Entregue (Liberar links ao cliente)</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="general_notes">Anotações Internas (Cores, preferências, etc.)</label>
          <textarea
            id="general_notes"
            className="input-field"
            rows={3}
            placeholder="Ex: Logotipo enviado pelo cliente, plano 400MB por R$79,90..."
            value={generalNotes}
            onChange={e => setGeneralNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          type="submit"
          className="btn-admin-primary"
          disabled={submitting}
          style={{ padding: '12px 28px', fontSize: '0.95rem' }}
        >
          {submitting ? 'Salvando...' : 'Criar Pedido de Personalização'}
        </button>
      </div>
    </form>
  )
}
