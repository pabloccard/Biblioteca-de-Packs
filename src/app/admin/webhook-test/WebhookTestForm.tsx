'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Pack { id: string; name: string; hotmart_id: string }

export default function WebhookTestForm({ packs }: { packs: Pack[] }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [selectedPack, setSelectedPack] = useState('')
  const [status, setStatus] = useState('APPROVED')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; data: string } | null>(null)

  const selectedPackData = packs.find(p => p.id === selectedPack)

  async function handleTest() {
    if (!email || !selectedPack) return

    setLoading(true)
    setResult(null)

    const pack = packs.find(p => p.id === selectedPack)
    if (!pack) {
      setResult({ success: false, data: 'Pack não encontrado' })
      setLoading(false)
      return
    }

    // Simular payload da Hotmart
    const payload = {
      hottok: '__FROM_ENV__', // Será substituído no servidor
      data: {
        buyer: {
          email: email.trim().toLowerCase(),
          name: name.trim() || 'Teste',
        },
        product: {
          id: pack.hotmart_id,
        },
        purchase: {
          status: status,
        },
      },
    }

    try {
      const res = await fetch('/api/webhook/hotmart/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      setResult({
        success: res.ok,
        data: JSON.stringify(data, null, 2),
      })
    } catch (err) {
      setResult({
        success: false,
        data: `Erro de conexão: ${err instanceof Error ? err.message : 'desconhecido'}`,
      })
    }

    setLoading(false)
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header">
          <h1 className="pack-name">🧪 Testar Webhook Hotmart</h1>
        </header>

        <div className="admin-form">
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">Simular Evento</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Simule uma chamada do webhook da Hotmart. O e-mail de boas-vindas será enviado de verdade se o status for APPROVED.
            </p>

            <div className="admin-form-grid">
              <div className="input-group">
                <label htmlFor="test_email">Email do comprador *</label>
                <input
                  id="test_email"
                  type="email"
                  className="input-field"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="test_name">Nome do comprador</label>
                <input
                  id="test_name"
                  type="text"
                  className="input-field"
                  placeholder="João Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="test_pack">Pack *</label>
                <select
                  id="test_pack"
                  className="input-field"
                  value={selectedPack}
                  onChange={e => setSelectedPack(e.target.value)}
                >
                  <option value="">Selecione um pack...</option>
                  {packs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ID: {p.hotmart_id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="test_status">Status da compra *</label>
                <select
                  id="test_status"
                  className="input-field"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <optgroup label="Liberar acesso">
                    <option value="APPROVED">✅ APPROVED</option>
                    <option value="COMPLETE">✅ COMPLETE</option>
                  </optgroup>
                  <optgroup label="Remover acesso">
                    <option value="REFUNDED">🚫 REFUNDED</option>
                    <option value="CHARGEBACK">🚫 CHARGEBACK</option>
                    <option value="DISPUTE">🚫 DISPUTE</option>
                    <option value="CANCELLED">🚫 CANCELLED</option>
                    <option value="EXPIRED">🚫 EXPIRED</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {selectedPackData && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Payload simulado:</strong>
                <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{`{
  "product.id": "${selectedPackData.hotmart_id}",
  "buyer.email": "${email || '...'}",
  "buyer.name": "${name || 'Teste'}",
  "purchase.status": "${status}"
}`}
                </pre>
              </div>
            )}
          </div>

          {result && (
            <div style={{
              marginTop: '20px',
              padding: '16px 20px',
              background: result.success ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${result.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              borderRadius: '12px',
            }}>
              <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', color: result.success ? 'var(--success)' : 'var(--error)' }}>
                {result.success ? '✅ Sucesso' : '❌ Erro'}
              </p>
              <pre style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0, wordBreak: 'break-all' }}>
                {result.data}
              </pre>
            </div>
          )}

          <button
            type="button"
            className="btn-primary btn-submit"
            disabled={loading || !email || !selectedPack}
            onClick={handleTest}
            style={{ marginTop: '20px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="loading-spinner" />Enviando...
              </span>
            ) : `Simular ${status}`}
          </button>
        </div>
      </div>
    </div>
  )
}
