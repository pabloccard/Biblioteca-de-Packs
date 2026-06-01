import { getDictionary, Locale } from '@/lib/dictionaries'
import WhatsAppButton from '@/components/WhatsAppButton'
import LoginForm from './LoginForm'

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict: any = await getDictionary(lang as Locale, 'login')

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-lock-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#lockGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            <defs>
              <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00B2FF" />
                <stop offset="100%" stopColor="#0052FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {dict.updateNotice && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h3 style={{
              color: '#eab308',
              margin: '0 0 8px 0',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {dict.updateNotice.title}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
              fontSize: '0.85rem',
              lineHeight: '1.5'
            }} dangerouslySetInnerHTML={{ __html: dict.updateNotice.message }} />
          </div>
        )}

        <h1 className="login-title" dangerouslySetInnerHTML={{ __html: dict.title }} />
        <p className="login-subtitle" dangerouslySetInnerHTML={{ __html: dict.subtitle }} />

        <LoginForm dict={dict} lang={lang} />

        <div className="login-footer" dangerouslySetInnerHTML={{ __html: dict.footer }} />
      </div>
      <WhatsAppButton autoExpand />
    </div>
  )
}
