import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import HeroSection from '../provedor/HeroSection'
import VersoesSection from '../provedor/VersoesSection'
import EditeSection from '../provedor/EditeSection'
import FaixaSection from '../provedor/FaixaSection'
import FacilEdicaoSection from '../provedor/FacilEdicaoSection'
import SuporteSection from '../provedor/SuporteSection'
import FeedbacksSection from '../provedor/FeedbacksSection'
import NovaOfertaSection from '../provedor/NovaOfertaSection'
import AutoralSection from '../provedor/AutoralSection'
import FaqSection from '../provedor/FaqSection'
import { PacksProvider } from '../provedor/PacksContext'
import { getProvedorContent } from '../provedor/i18n'
import { buildProvedorMetadata } from '../provedor/metadataHelper'
import '../provedor/vendas.css'

const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
})

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  return buildProvedorMetadata({ lang, theme: 'vermelho' })
}

export default async function ProvedorVermelhoSalesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isEs = lang === 'es'
  const content = getProvedorContent(lang)

  return (
    <PacksProvider
      lang={lang}
      theme="vermelho"
      artesFolder={isEs ? '/sales-pages/provedor-v2-es/artes-vermelho' : '/sales-pages/provedor-v2/artes-vermelho'}
    >
      <main className={`vendas-page vendas-page--vermelho ${isEs ? 'vendas-page--es' : ''} ${urbanist.className} ${urbanist.variable}`}>
        <div className="vendas-container">
          {/* 1. HERO (com carrossel de artes integrado) */}
          <HeroSection />

          {/* 2. VERSÕES DE CORES */}
          <VersoesSection />

          {/* 3. EDITE ONDE QUISER (Canva e Photoshop) */}
          <EditeSection />

          {/* FAIXA: FÁCIL EDIÇÃO */}
          <FaixaSection text={content.faixaEdicao} variant="light" />

          {/* 4. FÁCIL EDIÇÃO */}
          <FacilEdicaoSection />

          {/* 5. SUPORTE WHATSAPP */}
          <SuporteSection />

          {/* FAIXA: FEEDBACKS */}
          <FaixaSection text={content.faixaFeedbacks} />

          {/* 6. FEEDBACKS */}
          <FeedbacksSection />

          {/* 7. NOVA OFERTA */}
          <NovaOfertaSection />

          {/* FAIXA: CRIAÇÃO 100% AUTORAL */}
          <FaixaSection text={content.faixaAutoral} variant="dark" />

          {/* 8. 100% AUTORAL */}
          <AutoralSection />

          {/* 9. FAQ (Perguntas Frequentes) */}
          <FaqSection />
        </div>
      </main>
    </PacksProvider>
  )
}
