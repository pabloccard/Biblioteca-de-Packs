import { HeroMain } from '../../components/HeroMain'
import { SectionPersonalize } from '../../components/SectionPersonalize'
import { SectionRecebeMais } from '../../components/SectionRecebeMais'
import { SectionFeedbacks } from '../../components/SectionFeedbacks'
import { SectionOffer } from '../../components/SectionOffer'
import { SectionGuarantee } from '../../components/SectionGuarantee'
import { SectionSupport } from '../../components/SectionSupport'
import { SectionFaq } from '../../components/SectionFaq'
import { SectionFooter } from '../../components/SectionFooter'

import { HeroMain as HeroMainEs } from '../../components-es/HeroMain'
import { SectionPersonalize as SectionPersonalizeEs } from '../../components-es/SectionPersonalize'
import { SectionRecebeMais as SectionRecebeMaisEs } from '../../components-es/SectionRecebeMais'
import { SectionFeedbacks as SectionFeedbacksEs } from '../../components-es/SectionFeedbacks'
import { SectionOffer as SectionOfferEs } from '../../components-es/SectionOffer'
import { SectionGuarantee as SectionGuaranteeEs } from '../../components-es/SectionGuarantee'
import { SectionSupport as SectionSupportEs } from '../../components-es/SectionSupport'
import { SectionFaq as SectionFaqEs } from '../../components-es/SectionFaq'
import { SectionFooter as SectionFooterEs } from '../../components-es/SectionFooter'

import { HeroMain as HeroMainBurger } from '../../components-burger/HeroMain'
import { SectionPersonalize as SectionPersonalizeBurger } from '../../components-burger/SectionPersonalize'
import { SectionRecebeMais as SectionRecebeMaisBurger } from '../../components-burger/SectionRecebeMais'
import { SectionFeedbacks as SectionFeedbacksBurger } from '../../components-burger/SectionFeedbacks'
import { SectionOffer as SectionOfferBurger } from '../../components-burger/SectionOffer'
import { SectionGuarantee as SectionGuaranteeBurger } from '../../components-burger/SectionGuarantee'
import { SectionSupport as SectionSupportBurger } from '../../components-burger/SectionSupport'
import { SectionFaq as SectionFaqBurger } from '../../components-burger/SectionFaq'
import { SectionFooter as SectionFooterBurger } from '../../components-burger/SectionFooter'

import { redirect, notFound } from 'next/navigation'

// Configuração de versões válidas e aliases por pack
const packConfig: Record<string, { validVersions: string[], aliases: Record<string, string> }> = {
  // Provedor de Internet (PT e ES)
  provedor: {
    validVersions: ['vol3'],
    aliases: { 'v3': 'vol3', 'v03': 'vol3', 'vol03': 'vol3' }
  },
  proveedor: {
    validVersions: ['vol3'],
    aliases: { 'v3': 'vol3', 'v03': 'vol3', 'vol03': 'vol3' }
  },
  // Hamburgueria
  burger: {
    validVersions: ['vol1'],
    aliases: { 'v1': 'vol1', 'v01': 'vol1', 'vol01': 'vol1' }
  }
}

export default async function PackSalesPage({ params }: { params: Promise<{ lang: string, packName: string, version: string }> }) {
  const { lang, packName, version } = await params;

  // Verificar se o pack existe
  const config = packConfig[packName]
  if (!config) notFound()

  // Se a versão é um alias, redireciona para a canônica
  if (config.aliases[version]) {
    redirect(`/${lang}/packs/${packName}/${config.aliases[version]}`)
  }

  // Validar versão canônica
  if (!config.validVersions.includes(version)) {
    notFound()
  }

  // === HAMBURGUERIA ===
  if (packName === 'burger') {
    return (
      <main>
        <HeroMainBurger />
        <SectionPersonalizeBurger />
        <SectionRecebeMaisBurger />
        <SectionFeedbacksBurger />
        <SectionOfferBurger />
        <SectionGuaranteeBurger />
        <SectionSupportBurger />
        <SectionFaqBurger />
        <SectionFooterBurger />
      </main>
    )
  }

  // === PROVEDOR DE INTERNET ===
  const isSpanish = lang === 'es' || packName === 'proveedor';

  if (isSpanish) {
    return (
      <main>
        <HeroMainEs />
        <SectionPersonalizeEs />
        <SectionRecebeMaisEs />
        <SectionFeedbacksEs />
        <SectionOfferEs />
        <SectionGuaranteeEs />
        <SectionSupportEs />
        <SectionFaqEs />
        <SectionFooterEs />
      </main>
    )
  }

  return (
    <main>
      <HeroMain />
      <SectionPersonalize />
      <SectionRecebeMais />
      <SectionFeedbacks />
      <SectionOffer />
      <SectionGuarantee />
      <SectionSupport />
      <SectionFaq />
      <SectionFooter />
    </main>
  )
}

