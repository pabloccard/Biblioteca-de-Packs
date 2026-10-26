import { redirect } from 'next/navigation'
import { getDictionary, Locale } from '@/lib/dictionaries'
import { getMemberEmail } from '../../actions'
import LoginView from '@/components/LoginView'

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const email = await getMemberEmail()

  if (email) {
    redirect(`/${lang}/dashboard`)
  }

  const dict: any = await getDictionary(lang as Locale, 'login')

  return <LoginView dict={dict} lang={lang} />
}
