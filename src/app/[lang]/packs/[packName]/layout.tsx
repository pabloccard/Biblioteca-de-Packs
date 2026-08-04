import { Metadata } from 'next'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  params: Promise<{ lang: string, packName: string }>
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const resolvedParams = await params
  const { lang, packName } = resolvedParams

  let title = 'Biblioteca de Packs — Artes Editáveis'
  let imageUrl = '/herocover.png'
  
  if (packName === 'burger-restaurants') {
    title = 'Burger Restaurants Pack — Social Media Arts'
    imageUrl = '/packs/burger-restaurants/card.webp'
  } else if (packName === 'burger') {
    title = lang === 'es' ? 'Pack de Hamburguesas — Artes Editables' : 'Pack de Hambúrgueres — Artes Editáveis'
    imageUrl = lang === 'es' ? '/packs/burger-es-vol01/card.webp' : '/packs/burger-pt-vol01/card.webp'
  } else if (packName === 'provedor' || packName === 'proveedor') {
    title = lang === 'es' ? 'Pack Proveedor de Internet — Artes Editables' : 'Pack Provedor de Internet — Artes Editáveis'
    imageUrl = '/packs/proveedor-vol03/card.webp'
  }

  return {
    title,
    openGraph: {
      title,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [imageUrl],
    },
  }
}

export default function PackLayout({ children }: Props) {
  return <>{children}</>
}
