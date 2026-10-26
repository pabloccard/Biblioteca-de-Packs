import { NextResponse } from 'next/server'
import { deleteGoogleOAuthTokens } from '@/lib/google-oauth'
import { isAdminAuthenticated } from '@/app/admin/actions'

export async function POST() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await deleteGoogleOAuthTokens()
    return NextResponse.json({ success: true, message: 'Conta Google desconectada.' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao desconectar' }, { status: 500 })
  }
}
