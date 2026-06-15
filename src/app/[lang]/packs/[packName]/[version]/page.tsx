import { HeroMain } from '../../components/HeroMain'
import { SectionPersonalize } from '../../components/SectionPersonalize'
import { SectionRecebeMais } from '../../components/SectionRecebeMais'
import { SectionFeedbacks } from '../../components/SectionFeedbacks'
import { SectionOffer } from '../../components/SectionOffer'
import { SectionGuarantee } from '../../components/SectionGuarantee'
import { SectionSupport } from '../../components/SectionSupport'
import { SectionFaq } from '../../components/SectionFaq'
import { SectionFooter } from '../../components/SectionFooter'

export default function PackSalesPage() {
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
