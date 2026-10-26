import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from './actions'
import { getPackArtCount } from '@/lib/pack-arts'
import AdminPacksTable from '@/components/admin/AdminPacksTable'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  // Fetch packs with versions and complements
  const { data: packs } = await supabase
    .from('packs')
    .select('*, pack_versions(id), pack_complements(id, type, is_active)')
    .order('created_at', { ascending: false })

  const allPacks = packs || []

  // Main packs (filter out legacy child packs if any)
  const parentPacks = allPacks.filter((p) => !p.parent_pack_id)
  const legacyChildPacks = allPacks.filter((p) => !!p.parent_pack_id)

  const sortedPacks = [...parentPacks, ...legacyChildPacks]

  const packRows = await Promise.all(
    sortedPacks.map(async (pack: any) => {
      const artCount = await getPackArtCount(pack)
      const versionCount = pack.pack_versions?.length || 0
      const hasStories = pack.pack_complements?.some((c: any) => c.type === 'stories' && c.is_active)
      const hasCustom = pack.pack_complements?.some((c: any) => c.type === 'custom' && c.is_active)

      return {
        id: pack.id,
        name: pack.name,
        version: pack.version,
        hotmart_id: pack.hotmart_id,
        cover_image_url: pack.cover_image_url,
        arts_folder: pack.arts_folder,
        drive_arts_folder_id: pack.drive_arts_folder_id,
        parent_pack_id: pack.parent_pack_id,
        artCount,
        versionCount,
        hasStories,
        hasCustom,
      }
    })
  )

  return (
    <div className="admin-page-container">
      {/* Top Header Bar */}
      <header className="admin-view-header">
        <div className="admin-view-header-text">
          <h1 className="admin-view-title">Packs & Conteúdo</h1>
          <p className="admin-view-subtitle">
            Gerencie todos os packs cadastrados, suas versões de cores, links de Feed e Stories, e complementos.
          </p>
        </div>

        <div className="admin-view-header-actions">
          <Link href="/admin/pack/new" className="admin-btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Novo Pack</span>
          </Link>
        </div>
      </header>

      {/* Table Section */}
      <section className="admin-content-section">
        <AdminPacksTable packs={packRows} />
      </section>
    </div>
  )
}
