'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

interface AdminShellProps {
  children: React.ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="admin-shell-layout">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <AdminSidebar
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      <div className="admin-shell-body">
        {/* Mobile Top Header */}
        <header className="admin-mobile-header">
          <button
            type="button"
            className="admin-hamburger-btn"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link href="/admin" className="admin-mobile-brand">
            <span className="admin-sidebar-badge" style={{ width: '28px', height: '28px', fontSize: '11px' }}>BP</span>
            <span style={{ fontWeight: 600, fontSize: '15px', color: '#FFFFFF' }}>Painel Admin</span>
          </Link>

          <a
            href="/pt/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-mobile-action"
            aria-label="Ver Biblioteca"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </header>

        {/* Main Content Area */}
        <main className="admin-main-viewport">
          {children}
        </main>
      </div>
    </div>
  )
}
