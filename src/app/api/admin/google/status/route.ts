import { NextResponse } from 'next/server'
import { getGoogleOAuthTokens } from '@/lib/google-oauth'
import { isAdminAuthenticated } from '@/app/admin/actions'

export async function GET() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const tokens = await getGoogleOAuthTokens()

  if (!tokens?.refresh_token) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({
    connected: true,
    email: tokens.email || 'Conta Google Conectada',
    connectedAt: tokens.connected_at,
  })
}
