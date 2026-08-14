import { ReactNode } from 'react'

export default function LangLayout({
  children,
  sheet,
}: {
  children: ReactNode
  sheet: ReactNode
}) {
  return (
    <>
      {children}
      {sheet}
    </>
  )
}
