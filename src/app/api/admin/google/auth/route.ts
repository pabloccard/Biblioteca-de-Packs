import { NextRequest, NextResponse } from 'next/server'
import { generateGoogleAuthUrl } from '@/lib/google-oauth'
import { isAdminAuthenticated } from '@/app/admin/actions'

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const origin = request.nextUrl.origin
    const authUrl = generateGoogleAuthUrl(origin)
    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    return NextResponse.json(
      { error: `Erro ao iniciar autenticação Google: ${error.message}` },
      { status: 500 }
    )
  }
}
