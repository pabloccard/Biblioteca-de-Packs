import { redirect } from 'next/navigation'
import { getMemberEmail } from '../actions'

export default async function RootPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const email = await getMemberEmail()

  if (email) {
    redirect(`/${lang}/dashboard`)
  }

  redirect(`/${lang}/login`)
}
