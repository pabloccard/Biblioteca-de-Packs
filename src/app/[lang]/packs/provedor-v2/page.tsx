import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'
import HeroSection from './HeroSection'
import CarrosselSection from './CarrosselSection'
import VersoesSection from './VersoesSection'
import FaixaSection from './FaixaSection'
import EditeSection from './EditeSection'
import PersonalizeSection from './PersonalizeSection'
import FeedbacksSection from './FeedbacksSection'
import OfertasSection from './OfertasSection'
import SuporteSection from './SuporteSection'
import FaqSection from './FaqSection'
import ScrollRevealObserver from './ScrollRevealObserver'
import './vendas.css'

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-urbanist',
})

export const metadata: Metadata = {
  title: 'Pack de Artes para Provedor de Internet | Artes Editáveis',
  description:
    'O próximo post do seu provedor está aqui. Um pack completo de criativos para destacar seus planos de internet nas redes sociais.',
}

export default async function ProvedorV2SalesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <main className={`vendas-page ${urbanist.className} ${urbanist.variable}`}>
      <div className="vendas-container">
        {/* Ativa observador de animações de rolagem */}
        <ScrollRevealObserver />

        {/* 1. HERO */}
        <HeroSection />

        {/* 2. CARROSSEL DE ARTES */}
        <CarrosselSection />

        {/* 3. VERSÕES DE CORES */}
        <VersoesSection />

        {/* FAIXA: CANVA E PHOTOSHOP */}
        <FaixaSection
          text="CANVA E PHOTOSHOP • CANVA E PHOTOSHOP • CANVA E PHOTOSHOP • CANVA E PHOTOSHOP"
          variant="light"
        />

        {/* 4. EDITE ONDE QUISER */}
        <EditeSection />

        {/* 5. PERSONALIZE (Passos 1-2-3) */}
        <PersonalizeSection />

        {/* FAIXA: FEEDBACKS */}
        <FaixaSection text="FEEDBACKS • FEEDBACKS • FEEDBACKS • FEEDBACKS • FEEDBACKS" />

        {/* 6. FEEDBACKS */}
        <FeedbacksSection />

        {/* 7. OFERTAS (Preços + CTA) */}
        <OfertasSection />

        {/* 8. SUPORTE WHATSAPP */}
        <SuporteSection />

        {/* FAIXA: PERGUNTAS FREQUENTES */}
        <FaixaSection
          text="PERGUNTAS FREQUENTES • PERGUNTAS FREQUENTES • PERGUNTAS FREQUENTES • PERGUNTAS FREQUENTES"
          variant="light"
        />

        {/* 9. FAQ (PERGUNTAS FREQUENTES) */}
        <FaqSection />
      </div>
    </main>
  )
}
