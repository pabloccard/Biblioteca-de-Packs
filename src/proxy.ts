import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['pt', 'es', 'en']
const defaultLocale = 'pt'

function detectPreferredLocale(acceptLanguage: string): string {
  if (!acceptLanguage) return defaultLocale

  const preferences = acceptLanguage
    .split(',')
    .map((item) => {
      const [langTag, qPart] = item.trim().split(';')
      const lang = langTag.trim().toLowerCase().split('-')[0]
      let q = 1.0
      if (qPart && qPart.trim().startsWith('q=')) {
        const parsedQ = parseFloat(qPart.trim().substring(2))
        if (!isNaN(parsedQ)) q = parsedQ
      }
      return { lang, q }
    })
    .sort((a, b) => b.q - a.q)

  for (const pref of preferences) {
    if (locales.includes(pref.lang)) {
      return pref.lang
    }
  }

  return defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Salto imediato: rotas que não devem ser internacionalizadas nem processadas
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/customize') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // 2. Se a rota já tem um locale suportado
  const currentLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  const memberLangCookie = request.cookies.get('member_lang')?.value

  if (currentLocale) {
    // Se o usuário acessou uma rota com idioma X, mas o idioma registrado no cookie é Y,
    // e ele ESTÁ logado, redirecionamos para o idioma correto dele (exceto páginas de vendas /packs/).
    if (memberLangCookie && memberLangCookie !== currentLocale && !pathname.includes('/packs/') && !pathname.includes('provedor')) {
      request.nextUrl.pathname = pathname.replace(`/${currentLocale}`, `/${memberLangCookie}`)
      return NextResponse.redirect(request.nextUrl)
    }
    return NextResponse.next()
  }

  // 3. Detecção do idioma para rotas na raiz ou sem locale (ex: '/')
  const acceptLanguage = request.headers.get('accept-language') || ''
  const isSalesPage = pathname.includes('/packs/') || pathname.includes('provedor')

  // Para páginas de vendas, prioriza o idioma real do navegador do visitante (evita cookie de teste antigo)
  const preferredLocale = isSalesPage
    ? detectPreferredLocale(acceptLanguage)
    : (memberLangCookie || detectPreferredLocale(acceptLanguage))

  request.nextUrl.pathname = `/${preferredLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // Executa o proxy apenas nas rotas de páginas necessárias, ignorando:
  // api, admin, customize, lp, _next/static, _next/image, favicon.ico e arquivos estáticos com extensão
  matcher: [
    '/((?!api|admin|customize|lp|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
