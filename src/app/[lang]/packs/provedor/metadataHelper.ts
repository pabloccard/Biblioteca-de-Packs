import type { Metadata } from 'next'
import { getProvedorContent } from './i18n'

export type ProvedorThemeName =
  | 'azul'
  | 'vermelho'
  | 'verde'
  | 'amarelo'
  | 'laranja'
  | 'roxo'
  | 'azul-laranja'
  | 'default'

const THEME_COVERS: Record<ProvedorThemeName, { pt: string; es: string }> = {
  azul: {
    pt: '/sales-pages/provedor-v2/versao-cover-1.png',
    es: '/sales-pages/provedor-v2-es/versao-cover-1.png',
  },
  vermelho: {
    pt: '/sales-pages/provedor-v2/versao-cover-8.png',
    es: '/sales-pages/provedor-v2-es/versao-cover-4.png',
  },
  verde: {
    pt: '/sales-pages/provedor-v2/versao-cover-6.png',
    es: '/sales-pages/provedor-v2-es/versao-cover-11.png',
  },
  amarelo: {
    pt: '/sales-pages/provedor-v2/versao-cover-10.png',
    es: '/sales-pages/provedor-v2-es/versao-cover-2.png',
  },
  laranja: {
    pt: '/sales-pages/provedor-v2/versao-cover-11.png',
    es: '/sales-pages/provedor-v2-es/versao-cover-6.png',
  },
  roxo: {
    pt: '/sales-pages/provedor-v2/versao-cover-5.png',
    es: '/sales-pages/provedor-v2-es/versao-cover-13.png',
  },
  'azul-laranja': {
    pt: '/sales-pages/provedor-v2/versao-cover-3.png',
    es: '/sales-pages/provedor-v2-es/versao-cover-3.png',
  },
  default: {
    pt: '/sales-pages/provedor-v2/versao-cover-6.png',
    es: '/sales-pages/provedor-v2-es/versao-cover-1.png',
  },
}

const THEME_NAMES: Record<ProvedorThemeName, { pt: string; es: string }> = {
  azul: { pt: 'Edição Azul', es: 'Edición Azul' },
  vermelho: { pt: 'Edição Vermelho', es: 'Edición Rojo' },
  verde: { pt: 'Edição Verde', es: 'Edición Verde' },
  amarelo: { pt: 'Edição Amarelo', es: 'Edición Amarillo' },
  laranja: { pt: 'Edição Laranja', es: 'Edición Naranja' },
  roxo: { pt: 'Edição Roxo', es: 'Edición Morado' },
  'azul-laranja': { pt: 'Edição Azul e Laranja', es: 'Edición Azul y Naranja' },
  default: { pt: 'Artes Editáveis', es: 'Diseños Editables' },
}

export function buildProvedorMetadata({
  lang,
  theme = 'default',
}: {
  lang: string
  theme?: ProvedorThemeName
}): Metadata {
  const isEs = lang === 'es'
  const content = getProvedorContent(lang)
  const coverEntry = THEME_COVERS[theme] || THEME_COVERS.default
  const coverUrl = isEs ? coverEntry.es : coverEntry.pt
  const themeName = THEME_NAMES[theme] || THEME_NAMES.default
  const edition = isEs ? themeName.es : themeName.pt

  const title =
    theme === 'default'
      ? content.metadata.title
      : isEs
      ? `Pack de Diseños para Proveedor de Internet | ${edition}`
      : `Pack de Artes para Provedor de Internet | ${edition}`

  const description =
    theme === 'default'
      ? content.metadata.description
      : isEs
      ? 'Pack de Diseños Editables para Proveedor de Internet. Un paquete completo listo para abrir desde tu celular o computadora, agregar tu logo y tus planes, y descargar para publicar en pocos clics.'
      : 'Pack de Artes Editáveis para Provedor de Internet. Um pacote completo pronto para você abrir no celular ou computador, colocar a sua logo e os seus planos e baixar para postar em menos de 5 minutos.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Biblioteca de Packs',
      locale: isEs ? 'es_ES' : 'pt_BR',
      type: 'website',
      images: [
        {
          url: coverUrl,
          width: 980,
          height: 745,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [coverUrl],
    },
  }
}
