import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import HeroSection from './HeroSection'
import ArtesSection from './ArtesSection'
import CoresSection from './CoresSection'
import './provedor.css'

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-urbanist',
})

export const metadata: Metadata = {
  title: 'Pack de Artes para Provedor de Internet | Artes Editáveis',
  description:
    'O próximo post do seu provedor está aqui. Um pack completo de criativos para destacar seus planos de internet nas redes sociais.',
}

export default async function ProvedorSalesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <main className={`provedor-sales-page ${urbanist.className} ${urbanist.variable}`}>
      <div className="provedor-container">
        <HeroSection />
        <ArtesSection />
        <CoresSection />
        {/* As próximas seções serão adicionadas aqui uma a uma */}
      </div>
    </main>
  )
}
