'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminLogoutAction } from '@/app/admin/actions'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  href: string
  label: string
  icon: (active: boolean) => React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'CONTEÚDO',
    items: [
      {
        href: '/admin',
        label: 'Packs Cadastrados',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        ),
      },
      {
        href: '/admin/pack/new',
        label: 'Novo Pack',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        ),
      },
      {
        href: '/admin/categories',
        label: 'Categorias',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
          </svg>
        ),
      },
      {
        href: '/admin/icons',
        label: 'Ícones',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'CLIENTES & ACESSO',
    items: [
      {
        href: '/admin/members/search',
        label: 'Gerenciar Membros',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        href: '/admin/members/new',
        label: 'Adicionar Membro',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        ),
      },
      {
        href: '/admin/customizations',
        label: 'Personalizações',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'COMUNICAÇÃO & FERRAMENTAS',
    items: [
      {
        href: '/admin/marketing',
        label: 'Email Marketing',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        ),
      },
      {
        href: '/admin/suggestions',
        label: 'Sugestões',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
        ),
      },
      {
        href: '/admin/webhook-test',
        label: 'Testar Webhook',
        icon: (active) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.31" />
            <path d="M14 9.3V1.99" />
            <path d="M8.5 2h7" />
            <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
            <path d="M5.52 16h12.96" />
          </svg>
        ),
      },
    ],
  },
]

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const isCurrentActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Mobile close button (discrete, top right, only visible on mobile) */}
        {onClose && (
          <div className="admin-sidebar-mobile-bar">
            <button
              type="button"
              className="admin-sidebar-close-btn"
              onClick={onClose}
              aria-label="Fechar menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="admin-sidebar-nav">
          {navSections.map((section) => (
            <div key={section.title} className="admin-nav-group">
              <span className="admin-nav-group-title">{section.title}</span>
              <div className="admin-nav-items">
                {section.items.map((item) => {
                  const active = isCurrentActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`admin-nav-item ${active ? 'active' : ''}`}
                    >
                      <span className="admin-nav-icon">{item.icon(active)}</span>
                      <span className="admin-nav-label">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="admin-sidebar-footer">
          {/* Link to public library (standard a tag to prevent prefetching member routes) */}
          <a
            href="/pt/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-footer-link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Ver Biblioteca</span>
          </a>

          {/* Logout form */}
          <form action={adminLogoutAction} className="admin-logout-form">
            <button type="submit" className="admin-logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sair do Painel</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
