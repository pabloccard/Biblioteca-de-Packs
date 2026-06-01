'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CampaignSendButtonProps {
  campaignId: string
  recipientCount: number
}

export default function CampaignSendButton({ campaignId, recipientCount }: CampaignSendButtonProps) {
  const [sending, setSending] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState('')
  const router = useRouter()

  async function handleSend() {
    setSending(true)
    setResult('')
    try {
      const res = await fetch('/api/marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(`✅ Envio concluído: ${data.total_sent} enviados, ${data.total_failed} falhas`)
        router.refresh()
      } else {
        setResult(`❌ Erro: ${data.error}`)
      }
    } catch {
      setResult('❌ Erro ao enviar campanha')
    }
    setSending(false)
    setShowConfirm(false)
  }

  return (
    <div>
      {!showConfirm ? (
        <button onClick={() => setShowConfirm(true)} className="btn-primary btn-submit" style={{ width: '100%' }}>
          📧 Enviar para {recipientCount} {recipientCount === 1 ? 'destinatário' : 'destinatários'}
        </button>
      ) : (
        <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#f97316' }}>⚠️ Confirmar Envio</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Tem certeza que deseja enviar esta campanha para <strong>{recipientCount}</strong> {recipientCount === 1 ? 'pessoa' : 'pessoas'}? Esta ação não pode ser desfeita.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setShowConfirm(false)} className="btn-admin-secondary" disabled={sending}>Cancelar</button>
            <button onClick={handleSend} className="btn-primary btn-submit" disabled={sending} style={{ minWidth: '160px' }}>
              {sending ? '⏳ Enviando...' : '✅ Confirmar Envio'}
            </button>
          </div>
        </div>
      )}
      {result && <p style={{ marginTop: '12px', fontSize: '0.9rem', color: result.startsWith('✅') ? 'var(--success)' : 'var(--error)', textAlign: 'center' }}>{result}</p>}
    </div>
  )
}
