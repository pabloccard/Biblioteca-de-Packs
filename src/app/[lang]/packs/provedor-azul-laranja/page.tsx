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
  return buildProvedorMetadata({ lang, theme: 'azul-laranja' })
}

export default async function ProvedorAzulLaranjaSalesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <PacksProvider artesFolder="/sales-pages/provedor-v2/artes-azul-laranja" theme="azul-laranja">
      <main className={`vendas-page vendas-page--azul-laranja ${urbanist.className} ${urbanist.variable}`}>
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

          {/* 7. NOVA OFERTA (Black Friday R$ 37,90) */}
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
    </PacksProvider>
  )
}
