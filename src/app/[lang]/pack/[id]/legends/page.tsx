import { redirect } from 'next/navigation'

interface LegendsPageProps {
  params: Promise<{ id: string; lang: string }>
}

export default async function LegendsRedirectPage({ params }: LegendsPageProps) {
  const { id, lang } = await params
  redirect(`/${lang}/pack/${id}?tab=legends`)
}
