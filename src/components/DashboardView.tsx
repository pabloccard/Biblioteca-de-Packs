'use client'

import { motion } from 'motion/react'
import PackCard from '@/components/PackCard'

export interface PackItemData {
  id: string
  name: string
  coverImageUrl: string | null
  artCount: number
  isUnlocked: boolean
  arts: { id: string; image_url: string }[]
  buyLink: string
  version: string
}

interface DashboardViewProps {
  greetingText: string
  subtitleText: string
  lang: string
  dict: any
  packs: PackItemData[]
  logoutAction: (formData?: FormData) => Promise<void>
}

// Stagger animation container for the pack cards
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
}

// Card item entry and hover animation
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
}

// Header entry animation
const headerVariants = {
  hidden: { opacity: 0, y: -16 },
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
    y: -12,
    transition: { duration: 0.2 },
  },
}

export default function DashboardView({
  greetingText,
  subtitleText,
  lang,
  dict,
  packs,
  logoutAction,
}: DashboardViewProps) {
  const hasAnyPacks = packs.length > 0

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Animated Header */}
        <motion.header
          className="dashboard-header"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <div className="dashboard-header-top">
            <div className="dashboard-header-text">
              <motion.h1
                className="dashboard-title"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {greetingText}
              </motion.h1>
              <motion.p
                className="dashboard-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {subtitleText}
              </motion.p>
            </div>

            <div className="dashboard-header-actions">
              <form action={logoutAction}>
                <input type="hidden" name="lang" value={lang} />
                <motion.button
                  type="submit"
                  className="btn-logout"
                  title={lang === 'en' ? 'Log out' : lang === 'es' ? 'Salir' : 'Sair'}
                  aria-label={lang === 'en' ? 'Log out' : lang === 'es' ? 'Salir' : 'Sair'}
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </motion.button>
              </form>
            </div>
          </div>
        </motion.header>

        {/* Animated Packs Grid with Staggering */}
        {hasAnyPacks ? (
          <motion.main
            className="packs-grid"
            role="region"
            aria-label="Packs disponíveis"
            initial="hidden"
            animate="visible"
            variants={gridVariants}
          >
            {packs.map((pack, index) => (
              <motion.div
                key={pack.id}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <PackCard
                  id={pack.id}
                  name={pack.name}
                  coverImageUrl={pack.coverImageUrl}
                  artCount={pack.artCount}
                  isUnlocked={pack.isUnlocked}
                  arts={pack.arts}
                  buyLink={pack.buyLink}
                  version={pack.version}
                  lang={lang}
                  priority={index < 3}
                />
              </motion.div>
            ))}
          </motion.main>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#71717A',
            }}
          >
            <p style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📦</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: '#FFFFFF' }}>{dict.noPacksAvailable}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>{dict.comeBackSoon}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
