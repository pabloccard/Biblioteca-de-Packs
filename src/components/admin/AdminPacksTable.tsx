'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import DeletePackForm from '@/app/admin/DeletePackForm'

interface PackRow {
  id: string
  name: string
  version: string | null
  hotmart_id: string | null
  cover_image_url: string | null
  arts_folder: string | null
  drive_arts_folder_id?: string | null
  parent_pack_id: string | null
  artCount: number
  versionCount?: number
  hasStories?: boolean
  hasCustom?: boolean
}

interface AdminPacksTableProps {
  packs: PackRow[]
}

type FilterType = 'all' | 'parent' | 'stories' | 'custom'

export default function AdminPacksTable({ packs }: AdminPacksTableProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')

  const filteredPacks = useMemo(() => {
    return packs.filter((pack) => {
      // Type filter
      if (filterType === 'parent' && pack.parent_pack_id) return false
      if (filterType === 'stories' && !pack.hasStories) return false
      if (filterType === 'custom' && !pack.hasCustom) return false

      // Search filter
      if (!search.trim()) return true
      const query = search.toLowerCase()
      const matchName = pack.name.toLowerCase().includes(query)
      const matchHotmart = pack.hotmart_id?.toLowerCase().includes(query) || false
      const matchVersion = pack.version?.toLowerCase().includes(query) || false

      return matchName || matchHotmart || matchVersion
    })
  }, [packs, search, filterType])

  const totalCount = packs.length
  const parentCount = packs.filter((p) => !p.parent_pack_id).length
  const storiesCount = packs.filter((p) => p.hasStories).length
  const customCount = packs.filter((p) => p.hasCustom).length

  return (
    <div className="admin-table-container">
      {/* Search and Filters Bar */}
      <div className="admin-table-toolbar">
        {/* Search input */}
        <div className="admin-table-search-wrap">
          <svg
            className="admin-table-search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            className="admin-table-search"
            placeholder="Buscar pack por nome, Hotmart ID ou versão..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="admin-table-search-clear"
              onClick={() => setSearch('')}
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="admin-table-filters">
          <button
            type="button"
            className={`admin-filter-pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todos ({totalCount})
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterType === 'parent' ? 'active' : ''}`}
            onClick={() => setFilterType('parent')}
          >
            Principais ({parentCount})
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterType === 'stories' ? 'active' : ''}`}
            onClick={() => setFilterType('stories')}
          >
            📱 Stories ({storiesCount})
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterType === 'custom' ? 'active' : ''}`}
            onClick={() => setFilterType('custom')}
          >
            🎨 Personalizados ({customCount})
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="admin-table-scroll">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Capa</th>
              <th>Nome do Pack</th>
              <th style={{ width: '130px' }}>Versões</th>
              <th style={{ width: '160px' }}>Complementos</th>
              <th style={{ width: '120px' }}>Hotmart ID</th>
              <th style={{ width: '80px' }}>Artes</th>
              <th style={{ width: '160px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPacks.map((pack) => {
              const isLegacyChild = !!pack.parent_pack_id

              return (
                <tr key={pack.id} className={isLegacyChild ? 'admin-row-child' : ''}>
                  <td>
                    <div className="admin-pack-thumb">
                      {pack.cover_image_url ? (
                        <img src={pack.cover_image_url} alt="" loading="lazy" />
                      ) : (
                        <span className="admin-pack-thumb-fallback">📦</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="admin-pack-name-col">
                      <span className="admin-pack-title-text primary">{pack.name}</span>
                      {pack.version && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Versão {pack.version}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    {pack.versionCount && pack.versionCount > 0 ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          background: 'rgba(0, 136, 255, 0.15)',
                          color: '#60a5fa',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        📁 {pack.versionCount} {pack.versionCount === 1 ? 'versão' : 'versões'}
                      </span>
                    ) : (
                      <span className="admin-text-muted" style={{ fontSize: '0.8rem' }}>
                        Padrão
                      </span>
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {pack.hasStories && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 7px',
                            borderRadius: '8px',
                            background: 'rgba(249, 115, 22, 0.15)',
                            color: '#fb923c',
                            fontWeight: 600,
                          }}
                          title="Complemento Stories ativo"
                        >
                          📱 Stories
                        </span>
                      )}
                      {pack.hasCustom && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 7px',
                            borderRadius: '8px',
                            background: 'rgba(168, 85, 247, 0.15)',
                            color: '#c084fc',
                            fontWeight: 600,
                          }}
                          title="Complemento Personalização ativo"
                        >
                          🎨 Custom
                        </span>
                      )}
                      {!pack.hasStories && !pack.hasCustom && (
                        <span className="admin-text-muted" style={{ fontSize: '0.8rem' }}>
                          —
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    {pack.hotmart_id ? (
                      <code className="admin-code-tag">{pack.hotmart_id}</code>
                    ) : (
                      <span className="admin-text-muted">—</span>
                    )}
                  </td>

                  <td>
                    <div className="admin-art-count-badge" title={pack.drive_arts_folder_id ? 'Artes hospedadas no Google Drive' : 'Artes locais (public/)'}>
                      <span className="admin-art-num">{pack.artCount}</span>
                      <span className="admin-art-label">
                        {pack.drive_arts_folder_id ? '☁️ Drive' : 'artes'}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="admin-actions-cell">
                      <Link
                        href={`/admin/pack/${pack.id}`}
                        className="admin-btn-action btn-subtle"
                        title="Ver detalhes"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/pack/${pack.id}/edit`}
                        className="admin-btn-action btn-solid"
                        title="Editar pack"
                      >
                        Editar
                      </Link>
                      <DeletePackForm packId={pack.id} packName={pack.name} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredPacks.length === 0 && (
          <div className="admin-table-empty">
            <span className="admin-empty-icon">📦</span>
            <p className="admin-empty-title">Nenhum pack encontrado</p>
            <p className="admin-empty-subtitle">
              {search ? 'Tente buscar com outro termo ou limpe os filtros.' : 'Cadastre seu primeiro pack para começar.'}
            </p>
            <Link href="/admin/pack/new" className="admin-btn-primary" style={{ marginTop: '16px' }}>
              + Novo Pack
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
