'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  searchMemberByEmail,
  updateMemberAction,
  assignPackToMemberAction,
  removePackFromMemberAction,
  assignComplementToMemberAction,
  removeComplementFromMemberAction,
} from '../../actions'

interface Pack {
  id: string
  name: string
  version: string
}

interface ComplementOption {
  id: string
  pack_id: string
  type: 'stories' | 'custom'
  packs: { id: string; name: string; version: string }
}

interface MemberPurchase {
  id: string
  pack_id: string
  packs: { id: string; name: string; cover_image_url: string | null; version: string } | any
}

interface MemberComplementPurchase {
  id: string
  complement_id: string
  purchased_at: string
  pack_complements: {
    id: string
    pack_id: string
    type: 'stories' | 'custom'
    price: number | null
    buy_link: string | null
    packs: { id: string; name: string; version: string } | any
  } | any
}

interface MemberData {
  id: string
  name: string
  email: string
  language: string
  created_at: string
}

export default function SearchMemberForm({
  allPacks,
  allComplements,
}: {
  allPacks: Pack[]
  allComplements: ComplementOption[]
}) {
  const [searchEmail, setSearchEmail] = useState('')
  const [member, setMember] = useState<MemberData | null>(null)
  const [purchases, setPurchases] = useState<MemberPurchase[]>([])
  const [complementPurchases, setComplementPurchases] = useState<MemberComplementPurchase[]>([])
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editLanguage, setEditLanguage] = useState('pt')
  const [newPackId, setNewPackId] = useState('')
  const [newComplementId, setNewComplementId] = useState('')
  const [searching, setSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchEmail.trim()) return
    setSearching(true)
    setNotFound(false)
    setError(null)
    setSuccess(null)
    setMember(null)
    setPurchases([])
    setComplementPurchases([])

    const result = await searchMemberByEmail(searchEmail)
    if (result) {
      setMember(result.member)
      setPurchases((result.purchases || []) as unknown as MemberPurchase[])
      setComplementPurchases((result.complementPurchases || []) as unknown as MemberComplementPurchase[])
      setEditName(result.member.name || '')
      setEditEmail(result.member.email)
      setEditLanguage(result.member.language || 'pt')
    } else {
      setNotFound(true)
    }
    setSearching(false)
  }

  async function handleUpdateMember(e: React.FormEvent) {
    e.preventDefault()
    if (!member) return
    setError(null)
    setSuccess(null)

    const fd = new FormData()
    fd.set('member_id', member.id)
    fd.set('name', editName)
    fd.set('email', editEmail)
    fd.set('language', editLanguage)

    const result = await updateMemberAction(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Membro atualizado!')
      setMember({ ...member, name: editName, email: editEmail, language: editLanguage })
    }
  }

  async function handleAssignPack() {
    if (!member || !newPackId) return
    setError(null)
    setSuccess(null)

    const fd = new FormData()
    fd.set('member_id', member.id)
    fd.set('pack_id', newPackId)

    const result = await assignPackToMemberAction(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Pack atribuído com sucesso!')
      setNewPackId('')
      const updated = await searchMemberByEmail(editEmail)
      if (updated) {
        setPurchases((updated.purchases || []) as unknown as MemberPurchase[])
        setComplementPurchases((updated.complementPurchases || []) as unknown as MemberComplementPurchase[])
      }
    }
  }

  async function handleRemovePack(packId: string) {
    if (!member || !confirm('Remover este pack do membro?')) return
    setError(null)
    setSuccess(null)

    const fd = new FormData()
    fd.set('member_id', member.id)
    fd.set('pack_id', packId)

    const result = await removePackFromMemberAction(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Pack removido!')
      setPurchases(prev => prev.filter(p => p.packs?.id !== packId))
    }
  }

  async function handleAssignComplement() {
    if (!member || !newComplementId) return
    setError(null)
    setSuccess(null)

    const fd = new FormData()
    fd.set('member_id', member.id)
    fd.set('complement_id', newComplementId)

    const result = await assignComplementToMemberAction(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Complemento atribuído com sucesso!')
      setNewComplementId('')
      const updated = await searchMemberByEmail(editEmail)
      if (updated) {
        setPurchases((updated.purchases || []) as unknown as MemberPurchase[])
        setComplementPurchases((updated.complementPurchases || []) as unknown as MemberComplementPurchase[])
      }
    }
  }

  async function handleRemoveComplement(complementId: string) {
    if (!member || !confirm('Remover este complemento do membro?')) return
    setError(null)
    setSuccess(null)

    const fd = new FormData()
    fd.set('member_id', member.id)
    fd.set('complement_id', complementId)

    const result = await removeComplementFromMemberAction(fd)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Complemento removido com sucesso!')
      setComplementPurchases(prev => prev.filter(cp => cp.complement_id !== complementId))
    }
  }

  const availablePacks = allPacks.filter(p => !purchases.some(pp => pp.packs?.id === p.id))
  const availableComplements = allComplements.filter(
    c => !complementPurchases.some(cp => cp.complement_id === c.id)
  )

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className="pack-back-btn">← Voltar ao painel</Link>
        <header className="pack-header"><h1 className="pack-name">Gerenciar Membro</h1></header>

        {/* Busca */}
        <form className="admin-form" onSubmit={handleSearch} style={{ marginBottom: '0' }}>
          <div className="admin-form-section">
            <h2 className="admin-form-section-title">Buscar por Email</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Email do membro</label>
                <input
                  type="email"
                  className="input-field"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-admin-primary"
                style={{ height: '48px', marginBottom: '0' }}
                disabled={searching}
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {notFound && (
              <p style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '12px' }}>
                ❌ Membro não encontrado.
              </p>
            )}
          </div>
        </form>

        {member && (
          <div className="admin-form" style={{ marginTop: 'var(--space-lg)' }}>
            {error && <div className="login-error">{error}</div>}
            {success && <div className="admin-success">{success}</div>}

            {/* Editar dados */}
            <div className="admin-form-section">
              <h2 className="admin-form-section-title">Dados do Membro</h2>
              <form onSubmit={handleUpdateMember}>
                <div className="admin-form-grid">
                  <div className="input-group">
                    <label>Nome</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nome"
                    />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Idioma</label>
                    <select
                      className="input-field"
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                    >
                      <option value="pt">Português (PT-BR)</option>
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-admin-secondary" style={{ marginTop: '16px' }}>
                  Salvar Dados
                </button>
              </form>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Cadastrado em: {new Date(member.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {/* Packs do membro */}
            <div className="admin-form-section">
              <h2 className="admin-form-section-title">Packs do Membro ({purchases.length})</h2>
              {purchases.length > 0 ? (
                <div className="member-packs-manage">
                  {purchases.map((p) => (
                    <div key={p.packs?.id || p.id} className="member-pack-row">
                      <div className="member-pack-info">
                        <span className="member-pack-tag">
                          📦 {p.packs?.name || 'Pack'}{' '}
                          <span className="admin-version-badge" style={{ marginLeft: '6px' }}>
                            {p.packs?.version || '1.0'}
                          </span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePack(p.packs?.id || p.pack_id)}
                        className="btn-admin-action btn-delete"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum pack atribuído.</p>
              )}
            </div>

            {/* Atribuir novo pack */}
            {availablePacks.length > 0 && (
              <div className="admin-form-section">
                <h2 className="admin-form-section-title">Atribuir Novo Pack</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Pack</label>
                    <select
                      className="input-field"
                      value={newPackId}
                      onChange={(e) => setNewPackId(e.target.value)}
                    >
                      <option value="">Selecione um pack...</option>
                      {availablePacks.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.version || '1.0'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAssignPack}
                    className="btn-admin-primary"
                    style={{ height: '48px' }}
                    disabled={!newPackId}
                  >
                    Atribuir Pack
                  </button>
                </div>
              </div>
            )}

            {/* Complementos do membro */}
            <div className="admin-form-section">
              <h2 className="admin-form-section-title">
                Complementos do Membro ({complementPurchases.length})
              </h2>
              {complementPurchases.length > 0 ? (
                <div className="member-packs-manage">
                  {complementPurchases.map((cp) => {
                    const comp = cp.pack_complements
                    const isStories = comp?.type === 'stories'
                    return (
                      <div key={cp.id} className="member-pack-row">
                        <div className="member-pack-info">
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isStories ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: isStories ? '#a5b4fc' : '#fbbf24',
                              border: isStories
                                ? '1px solid rgba(99, 102, 241, 0.3)'
                                : '1px solid rgba(245, 158, 11, 0.3)',
                            }}
                          >
                            {isStories ? '📱 STORIES' : '👑 PERSONALIZADO'}
                          </span>
                          <span className="member-pack-tag">
                            Pack: {comp?.packs?.name || 'Pack vinculado'}
                            {comp?.packs?.version && (
                              <span className="admin-version-badge" style={{ marginLeft: '6px' }}>
                                {comp.packs.version}
                              </span>
                            )}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveComplement(cp.complement_id)}
                          className="btn-admin-action btn-delete"
                        >
                          Remover
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Nenhum complemento atribuído.
                </p>
              )}
            </div>

            {/* Atribuir novo complemento */}
            {availableComplements.length > 0 && (
              <div className="admin-form-section">
                <h2 className="admin-form-section-title">Atribuir Novo Complemento</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Complemento</label>
                    <select
                      className="input-field"
                      value={newComplementId}
                      onChange={(e) => setNewComplementId(e.target.value)}
                    >
                      <option value="">Selecione um complemento...</option>
                      {availableComplements.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.type === 'stories' ? '📱 [Stories]' : '👑 [Personalizado]'} — {c.packs?.name} ({c.packs?.version || '1.0'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAssignComplement}
                    className="btn-admin-primary"
                    style={{ height: '48px' }}
                    disabled={!newComplementId}
                  >
                    Atribuir Complemento
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
