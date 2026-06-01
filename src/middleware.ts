import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['pt', 'es']
const defaultLocale = 'pt'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lógica de detecção do idioma do navegador e cookie
  const memberLangCookie = request.cookies.get('member_lang')?.value
  const acceptLanguage = request.headers.get('accept-language') || ''
  
  // Se o usuário já fez login, forçamos o idioma dele. Caso contrário, detecção normal.
  const preferredLocale = memberLangCookie || (acceptLanguage.toLowerCase().includes('es') ? 'es' : defaultLocale)

  // Se a rota já tem um locale suportado
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Páginas que não devem ser internacionalizadas
  if (pathname.startsWith('/admin') || pathname.startsWith('/lp')) return

  if (pathnameHasLocale) {
    // Se o usuário acessou uma rota com idioma X, mas o idioma registrado no banco/cookie é Y,
    // e ele ESTÁ logado (tem o cookie member_lang), nós o redirecionamos para o idioma correto dele.
    if (memberLangCookie) {
      const currentLocale = locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)
      if (currentLocale && currentLocale !== memberLangCookie) {
        // Troca o locale incorreto pelo correto na URL
        const newPathname = pathname.replace(`/${currentLocale}`, `/${memberLangCookie}`)
        request.nextUrl.pathname = newPathname
        return NextResponse.redirect(request.nextUrl)
      }
    }
    return
  }

  // Redireciona adicionando o locale para rotas que não têm locale (ex: '/')
  request.nextUrl.pathname = `/${preferredLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // Executa o middleware em todas as rotas, exceto:
  // api, _next/static, _next/image, favicon.ico e arquivos com extensão (como .png, .css)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
