'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginAction } from '../../actions'

interface Props {
  dict: any
  lang: string
}

export default function LoginForm({ dict, lang }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Prioridade: email da URL > email salvo no localStorage
    const urlEmail = searchParams.get('email')
    if (urlEmail) {
      setEmail(urlEmail)
    } else {
      const savedEmail = localStorage.getItem('last_login_email')
      if (savedEmail) {
        setEmail(savedEmail)
      }
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() // Impede 100% o recarregamento/GET nativo da página
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const submittedEmail = formData.get('email') as string
    if (submittedEmail) {
      localStorage.setItem('last_login_email', submittedEmail)
    }
    
    formData.append('lang', lang)

    try {
      const result = await loginAction(formData)

      if (result?.success && result.url) {
        // Redireciona via React Router (client-side) sem causar reload nativo
        router.push(result.url)
        return // não tira o loading para a transição ser suave
      }

      if (result?.error) {
        const errorMap: Record<string, string> = {
          'notFound': dict.errors.member_not_found,
          'emptyEmail': dict.errors.invalid_email,
        }
        setError(errorMap[result.error] || dict.errors.default || result.error)
      }
    } catch (err) {
      setError(dict.errors.default || 'Erro ao conectar. Tente novamente.')
    }
    
    setLoading(false)
  }

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="input-icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input
              id="email-input"
              name="email"
              type="email"
              className="input-field login-input"
              placeholder={dict.emailPlaceholder}
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {loading ? (
            <>
              <span className="loading-spinner" />
              {dict.loading}
            </>
          ) : (
            <>
              {dict.submit}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </>
          )}
        </button>
      </form>
      
      <div className="login-security-text" dangerouslySetInnerHTML={{ __html: dict.helpText }} />
    </div>
  )
}
