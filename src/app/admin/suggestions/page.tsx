import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '../actions'
import SuggestionsList from './SuggestionsList'

export const dynamic = 'force-dynamic'

export default async function AdminSuggestionsPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()
  const { data: suggestions } = await supabase
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header" style={{ marginBottom: '24px' }}>
          <h1 className="pack-name">Sugestões dos Membros</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {suggestions?.length || 0} sugestões recebidas
          </p>
        </header>

        <SuggestionsList suggestions={suggestions || []} />
      </div>
    </div>
  )
}
