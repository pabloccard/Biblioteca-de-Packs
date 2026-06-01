'use client'

import { useState } from 'react'
import { adminLoginAction } from '../actions'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await adminLoginAction(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          🔐
        </div>

        <h1 className="login-title">Admin</h1>
        <p className="login-subtitle">
          Painel de administração da<br />
          Biblioteca de Packs
        </p>

        <form className="login-form" action={handleSubmit}>
          <div className="input-group">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              className="input-field"
              placeholder="admin@email.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="admin-password">Senha</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="loading-spinner" />
                Entrando...
              </span>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
