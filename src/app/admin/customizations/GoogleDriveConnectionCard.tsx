'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GoogleDriveConnectionCard() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<{
    loading: boolean
    connected: boolean
    email?: string
    connectedAt?: string
  }>({ loading: true, connected: false })

  const [disconnecting, setDisconnecting] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function checkStatus() {
    try {
      const res = await fetch('/api/admin/google/status')
      const data = await res.json()
      if (res.ok) {
        setStatus({
          loading: false,
          connected: data.connected,
          email: data.email,
          connectedAt: data.connectedAt,
        })
      } else {
        setStatus({ loading: false, connected: false })
      }
    } catch {
      setStatus({ loading: false, connected: false })
    }
  }

  useEffect(() => {
    checkStatus()

    if (searchParams.get('google_success') === 'true') {
      setBanner({
        type: 'success',
        message: '🎉 Conta Google conectada com sucesso! O upload direto de artes já está liberado.',
      })
    } else if (searchParams.get('google_error')) {
      setBanner({
        type: 'error',
        message: `Erro ao conectar com Google: ${searchParams.get('google_error')}`,
      })
    }
  }, [searchParams])

  async function handleDisconnect() {
    if (!confirm('Deseja realmente desconectar sua conta Google do painel?')) return

    setDisconnecting(true)
    try {
      const res = await fetch('/api/admin/google/disconnect', { method: 'POST' })
      if (res.ok) {
        setStatus({ loading: false, connected: false })
        setBanner({ type: 'success', message: 'Conta Google desconectada.' })
      } else {
        alert('Erro ao desconectar.')
      }
    } catch {
      alert('Erro de conexão.')
    } finally {
      setDisconnecting(false)
    }
  }

  if (status.loading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
      {banner && (
        <div
          className={banner.type === 'success' ? 'admin-success' : 'login-error'}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>{banner.message}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {status.connected ? (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>🟢</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#4ade80' }}>
                Google Drive Conectado: <span style={{ color: '#fff' }}>{status.email}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Uploads diretos e criação de pastas funcionando com a cota da sua conta pessoal.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="btn-admin-action"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            {disconnecting ? 'Desconectando...' : 'Desconectar Conta'}
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(250, 204, 21, 0.05)',
            border: '1px solid rgba(250, 204, 21, 0.2)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '700px' }}>
            <span style={{ fontSize: '1.8rem' }}>📁</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#facc15' }}>
                Conectar Conta Google (Upload Direto de Artes)
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Conecte sua conta pessoal do Google uma única vez para permitir que o painel faça upload de imagens direto para as pastas de Feed e Stories no Drive dos seus clientes.
              </p>
            </div>
          </div>

          <a
            href="/api/admin/google/auth"
            className="btn-admin-primary"
            style={{
              textDecoration: 'none',
              padding: '10px 18px',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              background: '#facc15',
              color: '#000',
              fontWeight: 600,
              borderRadius: '8px',
            }}
          >
            <span>🔗</span> Conectar Conta Google
          </a>
        </div>
      )}
    </div>
  )
}
