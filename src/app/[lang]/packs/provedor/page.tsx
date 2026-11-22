import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import HeroSection from './HeroSection'
import VersoesSection from './VersoesSection'
import EditeSection from './EditeSection'
import FaixaSection from './FaixaSection'
import FacilEdicaoSection from './FacilEdicaoSection'
import SuporteSection from './SuporteSection'
import FeedbacksSection from './FeedbacksSection'
import NovaOfertaSection from './NovaOfertaSection'
import AutoralSection from './AutoralSection'
import FaqSection from './FaqSection'
import { PacksProvider } from './PacksContext'
import { getProvedorContent } from './i18n'
import './vendas.css'

const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const content = getProvedorContent(lang)
  return {
    title: content.metadata.title,
    description: content.metadata.description,
  }
}

export default async function ProvedorSalesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const content = getProvedorContent(lang)

  return (
    <PacksProvider lang={lang} theme="green">
      <main className={`vendas-page ${lang === 'es' ? 'vendas-page--es' : ''} ${urbanist.className} ${urbanist.variable}`}>
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
