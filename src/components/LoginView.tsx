'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { loginAction } from '@/app/actions'

interface LoginViewProps {
  dict: any
  lang: string
}

// Stagger animation container
const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: {
      duration: 0.25,
      ease: 'easeIn' as const,
    },
  },
}

// Item fade & slide animation
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
}

export default function LoginView({ dict, lang }: LoginViewProps) {
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
    <div className="login-page">
      <motion.main
        className="login-card"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Title */}
        <motion.h1
          className="login-title"
          variants={itemVariants}
          dangerouslySetInnerHTML={{ __html: dict.title }}
        />

        {/* Subtitle */}
        <motion.p
          className="login-subtitle"
          variants={itemVariants}
          dangerouslySetInnerHTML={{ __html: dict.subtitle }}
        />

        {/* Form Container */}
        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Input */}
            <motion.div className="login-input-wrapper" variants={itemVariants}>
              <input
                id="email-input"
                name="email"
                type="email"
                className="login-input"
                placeholder={dict.emailPlaceholder || "Seu e-mail de compra"}
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="login-error"
                  role="alert"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                id="login-submit-button"
                type="submit"
                className="login-btn-submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.015, backgroundColor: '#F4F4F5' } : undefined}
                whileTap={!loading ? { scale: 0.985 } : undefined}
                transition={{ duration: 0.15 }}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner" />
                    <span>{dict.loading}</span>
                  </>
                ) : (
                  <span>{dict.submit}</span>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Support Link */}
          <motion.div
            className="login-support"
            variants={itemVariants}
            dangerouslySetInnerHTML={{ __html: dict.helpText }}
          />
        </div>

        {/* Footer positioned right below support with 32px margin */}
        <motion.footer
          className="login-footer"
          variants={itemVariants}
          dangerouslySetInnerHTML={{ __html: dict.footer }}
        />
      </motion.main>
    </div>
  )
}
