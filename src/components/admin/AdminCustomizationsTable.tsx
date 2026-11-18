'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

export interface CustomizationOrderRow {
  id: string
  status: 'waiting' | 'pending' | 'in_progress' | 'delivered' | string
  client_name: string | null
  client_email: string | null
  pack_name: string
  chosen_version_name?: string | null
  created_at: string
}

interface AdminCustomizationsTableProps {
  orders: CustomizationOrderRow[]
}

type StatusFilter = 'all' | 'waiting' | 'pending' | 'in_progress' | 'delivered'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  waiting: { label: 'Aguardando Cliente', className: 'status-waiting' },
  pending: { label: 'Pendente', className: 'status-pending' },
  in_progress: { label: 'Em Produção', className: 'status-progress' },
  delivered: { label: 'Entregue', className: 'status-delivered' },
}

export default function AdminCustomizationsTable({ orders }: AdminCustomizationsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false
      }

      // Search filter
      if (!search.trim()) return true
      const query = search.toLowerCase()
      const matchClient = order.client_name?.toLowerCase().includes(query) || false
      const matchEmail = order.client_email?.toLowerCase().includes(query) || false
      const matchPack = order.pack_name.toLowerCase().includes(query)

      return matchClient || matchEmail || matchPack
    })
  }, [orders, search, statusFilter])

  const totalCount = orders.length
  const waitingCount = orders.filter((o) => o.status === 'waiting').length
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const progressCount = orders.filter((o) => o.status === 'in_progress').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length

  return (
    <div className="admin-table-container">
      {/* Toolbar: Search and Filter Pills */}
      <div className="admin-table-toolbar">
        {/* Search */}
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
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-table-search"
            placeholder="Buscar por cliente, email ou pack..."
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
            className={`admin-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Todos ({totalCount})
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${statusFilter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in_progress')}
          >
            Em Produção ({progressCount})
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${statusFilter === 'waiting' ? 'active' : ''}`}
            onClick={() => setStatusFilter('waiting')}
          >
            Aguardando ({waitingCount})
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            Entregues ({deliveredCount})
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="admin-table-scroll">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>PACK</th>
              <th style={{ width: '30%' }}>CLIENTE</th>
              <th style={{ width: '18%' }}>STATUS</th>
              <th style={{ width: '12%' }}>DATA</th>
              <th style={{ width: '10%', textAlign: 'right' }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const info = STATUS_CONFIG[order.status] || {
                label: order.status,
                className: 'status-waiting',
              }

              const formattedDate = new Date(order.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })

              return (
                <tr key={order.id}>
                  {/* Pack Name */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                      <span className="admin-pack-title-text primary" style={{ fontWeight: 600 }}>
                        {order.pack_name}
                      </span>
                      {order.chosen_version_name && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.12)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                          }}
                        >
                          {order.chosen_version_name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Client Info */}
                  <td>
                    {order.client_name ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>
                          {order.client_name}
                        </span>
                        {order.client_email && (
                          <span style={{ fontSize: '12px', color: '#666666' }}>
                            {order.client_email}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#4D4D4D', fontStyle: 'italic' }}>
                        Aguardando preenchimento...
                      </span>
                    )}
                  </td>

                  {/* Status Pill Badge */}
                  <td>
                    <span className={`admin-status-pill ${info.className}`}>
                      <span className="admin-status-dot" />
                      <span>{info.label}</span>
                    </span>
                  </td>

                  {/* Date */}
                  <td>
                    <span style={{ fontSize: '12px', color: '#666666' }}>
                      {formattedDate}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/admin/customizations/${order.id}`}
                      className="admin-action-btn edit"
                      style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                    >
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="admin-table-empty">
            <span className="admin-empty-icon">🎨</span>
            <p className="admin-empty-title">Nenhum pedido encontrado</p>
            <p className="admin-empty-subtitle">
              {search
                ? 'Nenhum resultado corresponde à sua pesquisa.'
                : 'Não há pedidos para este filtro no momento.'}
            </p>
            <Link
              href="/admin/customizations/new"
              className="admin-btn-primary"
              style={{ marginTop: '16px' }}
            >
              + Novo Pedido
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
