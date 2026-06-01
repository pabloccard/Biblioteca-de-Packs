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

        <h1 className="login-title" dangerouslySetInnerHTML={{ __html: dict.title }} />
        <p className="login-subtitle" dangerouslySetInnerHTML={{ __html: dict.subtitle }} />

        <LoginForm dict={dict} lang={lang} />

        <div className="login-footer" dangerouslySetInnerHTML={{ __html: dict.footer }} />
      </div>
      <WhatsAppButton autoExpand />
    </div>
  )
}
