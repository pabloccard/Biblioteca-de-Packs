import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeAndSaveTokens } from '@/lib/google-oauth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')

  const origin = request.nextUrl.origin

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/admin/customizations?google_error=${encodeURIComponent(errorParam)}`, origin)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/admin/customizations?google_error=Código+de+autorização+ausente', origin)
    )
  }

  try {
    await exchangeCodeAndSaveTokens(code, origin)
    return NextResponse.redirect(
      new URL('/admin/customizations?google_success=true', origin)
    )
  } catch (err: any) {
    console.error('Erro no callback do Google OAuth:', err)
    return NextResponse.redirect(
      new URL(`/admin/customizations?google_error=${encodeURIComponent(err.message || 'Erro ao conectar')}`, origin)
    )
  }
}
