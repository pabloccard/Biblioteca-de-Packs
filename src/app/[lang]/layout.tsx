import { ReactNode } from 'react'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function LangLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      {children}
      <WhatsAppButton />
    </>
  )
}
