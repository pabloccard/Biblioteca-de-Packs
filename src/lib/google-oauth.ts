import { OAuth2Client } from 'google-auth-library'
import { supabaseAdmin } from '@/lib/supabase/admin'

const SETTINGS_KEY = 'google_oauth'

export function getGoogleOAuthClient(customRedirectUri?: string): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()

  const defaultRedirect = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/google/callback`
  const redirectUri = customRedirectUri || defaultRedirect

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configurados no ambiente')
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri)
}

export function generateGoogleAuthUrl(origin?: string): string {
  const redirectUri = origin ? `${origin}/api/admin/google/callback` : undefined
  const client = getGoogleOAuthClient(redirectUri)

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent', // Garante que o Google sempre retorne o refresh_token
  })
}

export async function exchangeCodeAndSaveTokens(code: string, origin?: string) {
  const redirectUri = origin ? `${origin}/api/admin/google/callback` : undefined
  const client = getGoogleOAuthClient(redirectUri)

  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)

  // Buscar e-mail do usuário conectado para exibir no painel
  let email: string | null = null
  try {
    const userInfoRes = await client.request<{ email?: string }>({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    })
    email = userInfoRes.data.email || null
  } catch (err) {
    console.warn('Não foi possível obter e-mail do perfil Google:', err)
  }

  // Buscar token anterior para preservar o refresh_token caso o Google não tenha reenviado
  const existing = await getGoogleOAuthTokens()
  const finalRefreshToken = tokens.refresh_token || existing?.refresh_token

  if (!finalRefreshToken) {
    throw new Error('Nenhum refresh_token retornado pelo Google. Tente reconectar novamente.')
  }

  const tokenPayload = {
    refresh_token: finalRefreshToken,
    access_token: tokens.access_token,
    expiry_date: tokens.expiry_date,
    email: email || existing?.email || 'Conta Google',
    connected_at: new Date().toISOString(),
  }

  const { error } = await supabaseAdmin
    .from('system_settings')
    .upsert({
      key: SETTINGS_KEY,
      value: tokenPayload,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    throw new Error(`Erro ao salvar tokens no banco: ${error.message}`)
  }

  clearPersonalGoogleTokenCache()
  return tokenPayload
}

export async function getGoogleOAuthTokens(): Promise<{
  refresh_token: string
  access_token?: string
  expiry_date?: number
  email?: string
  connected_at?: string
} | null> {
  const { data, error } = await supabaseAdmin
    .from('system_settings')
    .select('value')
    .eq('key', SETTINGS_KEY)
    .maybeSingle()

  if (error || !data) return null
  return data.value as any
}

interface CachedToken {
  token: string
  email?: string
  expiresAt: number
}

let inMemoryTokenCache: CachedToken | null = null

export function clearPersonalGoogleTokenCache(): void {
  inMemoryTokenCache = null
}

export async function deleteGoogleOAuthTokens(): Promise<void> {
  clearPersonalGoogleTokenCache()
  await supabaseAdmin
    .from('system_settings')
    .delete()
    .eq('key', SETTINGS_KEY)
}

/**
 * Obtém um token de acesso OAuth válido da conta pessoal com cache em memória (50 min).
 * Evita consultas repetidas ao Supabase e chamadas à API do Google a cada carregamento de arte.
 */
export async function getPersonalGoogleAccessToken(): Promise<{ token: string; email?: string } | null> {
  const now = Date.now()

  // Retorna do cache em memória se ainda tiver mais de 2 minutos de validade
  if (inMemoryTokenCache && inMemoryTokenCache.expiresAt > now + 120 * 1000) {
    return {
      token: inMemoryTokenCache.token,
      email: inMemoryTokenCache.email,
    }
  }

  const savedTokens = await getGoogleOAuthTokens()
  if (!savedTokens?.refresh_token) return null

  try {
    const client = getGoogleOAuthClient()
    client.setCredentials({
      refresh_token: savedTokens.refresh_token,
      access_token: savedTokens.access_token,
      expiry_date: savedTokens.expiry_date,
    })

    const tokenResponse = await client.getAccessToken()
    if (!tokenResponse.token) return null

    // Cacheia o token por até 50 minutos ou até a data oficial de expiração
    const expiresAt = savedTokens.expiry_date && savedTokens.expiry_date > now
      ? savedTokens.expiry_date
      : now + 50 * 60 * 1000

    inMemoryTokenCache = {
      token: tokenResponse.token,
      email: savedTokens.email,
      expiresAt,
    }

    return {
      token: tokenResponse.token,
      email: savedTokens.email,
    }
  } catch (err: any) {
    console.error('Erro ao renovar token OAuth do Google:', err.message)
    if (err.message?.includes('invalid_grant')) {
      console.warn('Google OAuth refresh_token expirado ou revogado (invalid_grant). Removendo credenciais inválidas para liberar reconexão no painel admin.')
      await deleteGoogleOAuthTokens().catch(() => {})
    }
    return null
  }
}
