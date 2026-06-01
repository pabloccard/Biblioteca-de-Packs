import { createClient } from '@/lib/supabase/server'

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token } = await searchParams
  let status: 'success' | 'error' | 'no-token' = 'no-token'

  if (token) {
    const supabase = await createClient()
    const { data: member } = await supabase
      .from('members')
      .select('id, marketing_opt_out')
      .eq('unsubscribe_token', token)
      .single()

    if (member) {
      if (member.marketing_opt_out) {
        status = 'success' // Já estava desinscrito
      } else {
        const { error } = await supabase
          .from('members')
          .update({ marketing_opt_out: true })
          .eq('id', member.id)

        status = error ? 'error' : 'success'
      }
    } else {
      status = 'error'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#f5f5f7',
      fontFamily: "'Poppins', sans-serif",
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        padding: '48px 32px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>Desinscrição confirmada</h1>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Você foi removido da nossa lista de emails de marketing. Você não receberá mais nossas comunicações.
            </p>
            <p style={{ color: '#71717a', fontSize: '0.8rem', marginTop: '16px' }}>
              Caso mude de ideia, entre em contato conosco.
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>Link inválido</h1>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Este link de desinscrição é inválido ou já expirou. Se você está tendo problemas, entre em contato com nosso suporte.
            </p>
          </>
        )}
        {status === 'no-token' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>Desinscrição</h1>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Para se desinscrever, use o link presente no email que você recebeu.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
