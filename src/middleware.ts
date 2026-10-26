import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['pt', 'es', 'en']
const defaultLocale = 'pt'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lógica de detecção do idioma do navegador e cookie
  const memberLangCookie = request.cookies.get('member_lang')?.value
  const acceptLanguage = request.headers.get('accept-language') || ''
  
  // Se o usuário já fez login, forçamos o idioma dele. Caso contrário, detecção normal.
  const preferredLocale = memberLangCookie || (
    acceptLanguage.toLowerCase().includes('es') ? 'es' :
    acceptLanguage.toLowerCase().includes('en') ? 'en' : defaultLocale
  )

  // Se a rota já tem um locale suportado
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Páginas que não devem ser internacionalizadas
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/lp') ||
    pathname.startsWith('/customize') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  if (pathnameHasLocale) {
    // Se o usuário acessou uma rota com idioma X, mas o idioma registrado no banco/cookie é Y,
    // e ele ESTÁ logado (tem o cookie member_lang), nós o redirecionamos para o idioma correto dele.
    // EXCETO para as páginas de vendas (/packs/), onde a pessoa deve poder navegar livremente em qualquer idioma.
    if (memberLangCookie && !pathname.includes('/packs/')) {
      const currentLocale = locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)
      if (currentLocale && currentLocale !== memberLangCookie) {
        // Troca o locale incorreto pelo correto na URL
        const newPathname = pathname.replace(`/${currentLocale}`, `/${memberLangCookie}`)
        request.nextUrl.pathname = newPathname
        return NextResponse.redirect(request.nextUrl)
      }
    }
    return NextResponse.next()
  }

  // Redireciona adicionando o locale para rotas que não têm locale (ex: '/')
  request.nextUrl.pathname = `/${preferredLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // Executa o middleware apenas nas rotas necessárias, ignorando:
  // api, admin, customize, lp, _next/static, _next/image, favicon.ico e arquivos com extensão (como .png, .css)
  matcher: [
    '/((?!api|admin|customize|lp|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
