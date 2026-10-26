'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { adminLoginAction } from '../actions'

// Stagger animation container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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
}

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
      <motion.main
        className="login-card"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Title */}
        <motion.div variants={itemVariants}>
          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#4D4D4D', textTransform: 'uppercase', marginBottom: '8px' }}>
            ACESSO RESTRITO
          </span>
          <h1 className="login-title">
            Painel Admin
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p className="login-subtitle" variants={itemVariants}>
          Área administrativa da<br />
          Biblioteca de Packs
        </motion.p>

        {/* Form Container */}
        <div className="login-form-container">
          <form className="login-form" action={handleSubmit}>
            {/* Email Input */}
            <motion.div className="login-input-wrapper" variants={itemVariants}>
              <input
                id="admin-email"
                name="email"
                type="email"
                className="login-input"
                placeholder="exemplo@admin.com"
                required
                autoComplete="email"
                autoFocus
              />
            </motion.div>

            {/* Password Input */}
            <motion.div className="login-input-wrapper" variants={itemVariants}>
              <input
                id="admin-password"
                name="password"
                type="password"
                className="login-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="login-error"
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                id="admin-submit-button"
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
                    <span>Entrando...</span>
                  </>
                ) : (
                  <span>Entrar no Painel</span>
                )}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.main>
    </div>
  )
}
