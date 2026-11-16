import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['pt', 'es', 'en']
const defaultLocale = 'pt'

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
    if (memberLangCookie && memberLangCookie !== currentLocale && !pathname.includes('/packs/')) {
      request.nextUrl.pathname = pathname.replace(`/${currentLocale}`, `/${memberLangCookie}`)
      return NextResponse.redirect(request.nextUrl)
    }
    return NextResponse.next()
  }

  // 3. Detecção do idioma para rotas na raiz ou sem locale (ex: '/')
  const acceptLanguage = request.headers.get('accept-language') || ''
  const preferredLocale = memberLangCookie || (
    acceptLanguage.toLowerCase().includes('es') ? 'es' :
    acceptLanguage.toLowerCase().includes('en') ? 'en' : defaultLocale
  )

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
