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

export default async function PackSalesPage({ params }: { params: Promise<{ lang: string, packName: string, version: string }> }) {
  const { lang, packName } = await params;
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
