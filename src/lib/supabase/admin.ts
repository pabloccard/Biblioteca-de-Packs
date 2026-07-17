import { createClient } from '@supabase/supabase-js'

// Admin client with service_role key — bypasses RLS
// ONLY use this server-side (API routes, server actions)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fallback.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback_key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
