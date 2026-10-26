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
    // Priority: URL email param > saved localStorage email
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
    e.preventDefault()
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
        router.push(result.url)
        return
      }

      if (result?.error) {
        const errorMap: Record<string, string> = {
          notFound: dict.errors.member_not_found,
          emptyEmail: dict.errors.invalid_email,
        }
        setError(errorMap[result.error] || dict.errors.default || result.error)
      }
    } catch {
      setError(dict.errors.default || 'Erro ao conectar. Tente novamente.')
    }

    setLoading(false)
  }

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="login-input-wrapper">
          <input
            id="email-input"
            name="email"
            type="email"
            className="login-input"
            placeholder={dict.emailPlaceholder}
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <button
          id="login-submit-button"
          type="submit"
          className="login-btn-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner" />
              <span>{dict.loading}</span>
            </>
          ) : (
            <span>{dict.submit}</span>
          )}
        </button>
      </form>

      <div
        className="login-support"
        dangerouslySetInnerHTML={{ __html: dict.helpText }}
      />
    </div>
  )
}
