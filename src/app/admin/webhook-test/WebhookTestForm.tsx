'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Pack {
  id: string
  name: string
  version: string
  hotmart_id: string | null
}

interface Complement {
  id: string
  pack_id: string
  type: 'stories' | 'custom'
  hotmart_id: string | null
  packs: { id: string; name: string; version: string } | any
}

interface WebhookTestFormProps {
  packs: Pack[]
  complements: Complement[]
}

export default function WebhookTestForm({ packs, complements }: WebhookTestFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [selectedKey, setSelectedKey] = useState('') // 'pack:ID' ou 'comp:ID'
  const [status, setStatus] = useState('APPROVED')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; data: string } | null>(null)

  const isPack = selectedKey.startsWith('pack:')
  const isComplement = selectedKey.startsWith('comp:')
  const selectedId = selectedKey.replace(/^(pack|comp):/, '')

  const selectedPack = isPack ? packs.find(p => p.id === selectedId) : null
  const selectedComplement = isComplement ? complements.find(c => c.id === selectedId) : null

  const selectedHotmartId = selectedPack
    ? selectedPack.hotmart_id
    : selectedComplement
      ? selectedComplement.hotmart_id
      : null

  const selectedItemLabel = selectedPack
    ? `Pack: ${selectedPack.name} (${selectedPack.version || '1.0'})`
    : selectedComplement
      ? `Complemento: ${selectedComplement.type === 'stories' ? '📱 Stories' : '👑 Personalizado'} — ${selectedComplement.packs?.name || 'Pack vinculado'}`
      : null

  async function handleTest() {
    if (!email || !selectedKey) return

    if (!selectedHotmartId) {
      setResult({
        success: false,
        data: 'Este produto não possui Hotmart ID cadastrado no banco de dados. Configure o Hotmart ID no painel do pack para simular o webhook.',
      })
      return
    }

    setLoading(true)
    setResult(null)

    // Simular payload da Hotmart
    const payload = {
      hottok: '__FROM_ENV__', // Será substituído no servidor de teste
      data: {
        buyer: {
          email: email.trim().toLowerCase(),
          name: name.trim() || 'Teste',
          checkout_phone: whatsapp.trim() || undefined,
          address: {
            country: 'Brasil',
          },
        },
        product: {
          id: selectedHotmartId,
        },
        purchase: {
          status: status,
          checkout_country: {
            name: 'Brasil',
            iso: 'BR',
          },
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
              Simule uma chamada do webhook da Hotmart para liberar ou remover acesso a <strong>Packs</strong> ou <strong>Complementos</strong> (Stories/Personalizado).
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

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="test_whatsapp">WhatsApp do comprador (opcional)</label>
                <input
                  id="test_whatsapp"
                  type="text"
                  className="input-field"
                  placeholder="5564999999999 (com DDD)"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                />
              </div>

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="test_product">Produto (Pack ou Complemento) *</label>
                <select
                  id="test_product"
                  className="input-field"
                  value={selectedKey}
                  onChange={e => setSelectedKey(e.target.value)}
                >
                  <option value="">Selecione um produto para simular...</option>
                  
                  <optgroup label="📦 Packs Principais">
                    {packs.map(p => (
                      <option key={`pack:${p.id}`} value={`pack:${p.id}`}>
                        📦 {p.name} ({p.version || '1.0'}) {p.hotmart_id ? `— Hotmart ID: ${p.hotmart_id}` : '— (sem Hotmart ID)'}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="✨ Complementos (Stories / Personalizado)">
                    {complements.map(c => (
                      <option key={`comp:${c.id}`} value={`comp:${c.id}`}>
                        {c.type === 'stories' ? '📱 [Stories]' : '👑 [Personalizado]'} — {c.packs?.name} ({c.packs?.version || '1.0'}) {c.hotmart_id ? `— Hotmart ID: ${c.hotmart_id}` : '— (sem Hotmart ID)'}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
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
                    <option value="COMPLETED">✅ COMPLETED</option>
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

            {selectedKey && !selectedHotmartId && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '10px',
                color: '#f87171',
                fontSize: '0.85rem',
              }}>
                ⚠️ <strong>Atenção:</strong> Este item não possui Hotmart ID cadastrado. Para simular compras da Hotmart, cadastre o ID do produto nas configurações do pack.
              </div>
            )}

            {selectedKey && (
              <div style={{
                marginTop: '16px',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Item Selecionado:</strong>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: isPack
                      ? 'rgba(59, 130, 246, 0.15)'
                      : selectedComplement?.type === 'stories'
                        ? 'rgba(99, 102, 241, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    color: isPack
                      ? '#60a5fa'
                      : selectedComplement?.type === 'stories'
                        ? '#a5b4fc'
                        : '#fbbf24',
                    border: isPack
                      ? '1px solid rgba(59, 130, 246, 0.3)'
                      : selectedComplement?.type === 'stories'
                        ? '1px solid rgba(99, 102, 241, 0.3)'
                        : '1px solid rgba(245, 158, 11, 0.3)',
                  }}>
                    {isPack
                      ? '📦 PACK'
                      : selectedComplement?.type === 'stories'
                        ? '📱 COMPLEMENTO STORIES'
                        : '👑 COMPLEMENTO PERSONALIZADO'}
                  </span>
                </div>
                <div style={{ marginBottom: '10px', color: '#FFFFFF', fontWeight: 500 }}>
                  {selectedItemLabel}
                </div>
                <strong style={{ color: 'var(--text-secondary)' }}>Payload simulado que será enviado:</strong>
                <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#A1A1AA' }}>
{`{
  "product.id": "${selectedHotmartId || 'NENHUM_HOTMART_ID'}",
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
            disabled={loading || !email || !selectedKey || !selectedHotmartId}
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
