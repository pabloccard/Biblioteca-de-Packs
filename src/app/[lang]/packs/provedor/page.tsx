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
import './vendas.css'

const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
})

export const metadata: Metadata = {
  title: 'Pack de Artes para Provedor de Internet | Artes Editáveis',
  description:
    'Pack de Artes Editáveis para Provedor de Internet. Um pacote completo pronto para você abrir no celular ou computador, colocar a sua logo e os seus planos e baixar para postar em menos de 5 minutos.',
}

export default async function ProvedorSalesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <main className={`vendas-page ${urbanist.className} ${urbanist.variable}`}>
      <div className="vendas-container">
        {/* 1. HERO (com carrossel de artes integrado) */}
        <HeroSection />

        {/* 2. VERSÕES DE CORES */}
        <VersoesSection />

        {/* 3. EDITE ONDE QUISER (Canva e Photoshop) */}
        <EditeSection />

        {/* FAIXA: FÁCIL EDIÇÃO */}
        <FaixaSection
          text="FÁCIL EDIÇÃO • FÁCIL EDIÇÃO • FÁCIL EDIÇÃO • FÁCIL EDIÇÃO • FÁCIL EDIÇÃO"
          variant="light"
        />

        {/* 4. FÁCIL EDIÇÃO */}
        <FacilEdicaoSection />

        {/* 5. SUPORTE WHATSAPP */}
        <SuporteSection />

        {/* FAIXA: FEEDBACKS */}
        <FaixaSection text="FEEDBACKS • FEEDBACKS • FEEDBACKS • FEEDBACKS • FEEDBACKS" />

        {/* 6. FEEDBACKS */}
        <FeedbacksSection />

        {/* 7. NOVA OFERTA (Black Friday R$ 29,90) */}
        <NovaOfertaSection />

        {/* FAIXA: CRIAÇÃO 100% AUTORAL */}
        <FaixaSection
          text="CRIAÇÃO 100% AUTORAL • CRIAÇÃO 100% AUTORAL • CRIAÇÃO 100% AUTORAL"
          variant="dark"
        />

        {/* 8. 100% AUTORAL */}
        <AutoralSection />

        {/* 9. FAQ (Perguntas Frequentes) */}
        <FaqSection />
      </div>
    </main>
  )
}
