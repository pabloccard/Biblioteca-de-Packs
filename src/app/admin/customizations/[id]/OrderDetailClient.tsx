'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  saveCustomizationDeliveryLinksAction,
  deleteCustomizationOrderAction,
  generateDriveFoldersForOrderAction,
} from '../../customization-actions'
import DriveFolderUploader from './DriveFolderUploader'
import CustomizationCoverUploader from './CustomizationCoverUploader'
import GoogleDriveConnectionCard from '../GoogleDriveConnectionCard'

interface Order {
  id: string
  status: string
  client_name: string | null
  client_email: string | null
  client_whatsapp: string | null
  general_notes: string | null
  custom_cover_url?: string | null
  chosen_version_id?: string | null
  chosen_version_name?: string | null
  delivery_links: {
    feed_url?: string
    stories_url?: string
    canva_feed_url?: string
    canva_stories_url?: string
    canva_url?: string
    client_folder_url?: string
    feed_folder_id?: string
    stories_folder_id?: string
    custom_cover_url?: string
  } | null
  pack_id: string
  packs?: { id?: string; name: string; version?: string; cover_image_url?: string | null } | any
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { label: string; emoji: string; className: string }> = {
  pending: { label: 'Pendente', emoji: '⏳', className: 'status-pending' },
  in_progress: { label: 'Em Produção', emoji: '🎨', className: 'status-progress' },
  delivered: { label: 'Entregue', emoji: '✅', className: 'status-delivered' },
  waiting: { label: 'Aguardando', emoji: '⏳', className: 'status-waiting' },
}

interface ArtItem {
  id: string
  drive_file_id: string
  file_name: string
  thumbnail_url: string | null
  display_order: number
  client_instructions: string | null
}

interface OrderDetailClientProps {
  order: Order
  initialArts?: ArtItem[]
  customizeLink?: string
}

export default function OrderDetailClient({
  order,
  initialArts = [],
  customizeLink,
}: OrderDetailClientProps) {
  const router = useRouter()

  const [status, setStatus] = useState(order.status || 'waiting')
  const [arts, setArts] = useState<ArtItem[]>(initialArts)
  const [syncingArts, setSyncingArts] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [feedUrl, setFeedUrl] = useState(order.delivery_links?.feed_url || '')
  const [storiesUrl, setStoriesUrl] = useState(order.delivery_links?.stories_url || '')
  const [canvaFeedUrl, setCanvaFeedUrl] = useState(
    order.delivery_links?.canva_feed_url || order.delivery_links?.canva_url || ''
  )
  const [canvaStoriesUrl, setCanvaStoriesUrl] = useState(order.delivery_links?.canva_stories_url || '')
  const [clientFolderUrl, setClientFolderUrl] = useState(order.delivery_links?.client_folder_url || '')
  const [customCoverUrl, setCustomCoverUrl] = useState(
    order.custom_cover_url || order.delivery_links?.custom_cover_url || ''
  )
  const [generalNotes, setGeneralNotes] = useState(order.general_notes || '')

  const [saving, setSaving] = useState(false)
  const [generatingFolders, setGeneratingFolders] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const currentStatusInfo = statusConfig[status] || statusConfig.waiting

  // Format WhatsApp link
  const rawPhone = order.client_whatsapp ? order.client_whatsapp.replace(/\D/g, '') : ''
  const clientFirstName = order.client_name ? order.client_name.split(' ')[0] : 'Cliente'
  const packTitle = order.packs?.name || 'Pack'

  // Mensagem humanizada e atenciosa com o link do formulário
  const whatsappCustomMessage = `Olá, ${clientFirstName}! Tudo bem? Aqui é o Pablo!

Estou entrando em contato para darmos início à personalização das suas artes. 😊

Para começarmos, preciso que me envie *seu logotipo na melhor qualidade possível*.

Também preparei um link exclusivo para você preencher as informações que deverão aparecer nas artes.

É bem simples: basta clicar em cada arte e preencher os campos solicitados.

*Uma dica:* se alguma informação se repetir em todas as artes, como o número do WhatsApp, por exemplo, não precisa preencher várias vezes. Basta informar em uma delas!

*Acesse aqui para preencher:*
${customizeLink || ''}

Assim que receber seu logotipo e você finalizar o preenchimento, já daremos início à personalização das artes! 😊`

  const whatsappSendFormUrl = rawPhone
    ? `https://wa.me/${rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`}?text=${encodeURIComponent(whatsappCustomMessage)}`
    : null

  const whatsappDirectChatUrl = rawPhone
    ? `https://wa.me/${rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`}`
    : null

  function handleCopyCustomizeLink() {
    if (!customizeLink) return
    navigator.clipboard.writeText(customizeLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  async function handleSyncArts() {
    setSyncingArts(true)
    setFeedback(null)
    try {
      const { syncOrderArtsFromPackAction } = await import('../../customization-actions')
      const res = await syncOrderArtsFromPackAction(order.id)
      if (res?.error) {
        setFeedback({ type: 'error', message: res.error })
      } else {
        setFeedback({
          type: 'success',
          message: `Artes do pack sincronizadas com sucesso! (${res.count} artes carregadas)`,
        })
        router.refresh()
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Erro ao sincronizar artes' })
    } finally {
      setSyncingArts(false)
    }
  }

  async function handleGenerateDriveFolders() {
    if (feedUrl || storiesUrl) {
      if (!confirm('Já existem links de pastas cadastrados. Deseja criar novas pastas no Google Drive para este cliente mesmo assim?')) return
    }

    setGeneratingFolders(true)
    setFeedback(null)

    try {
      const res = await generateDriveFoldersForOrderAction(order.id)
      if (res?.error) {
        setFeedback({ type: 'error', message: res.error })
      } else if (res?.folders) {
        setFeedUrl(res.folders.feedFolderUrl)
        setStoriesUrl(res.folders.storiesFolderUrl)
        setClientFolderUrl(res.folders.clientFolderUrl)
        setFeedback({
          type: 'success',
          message: '📁 Pastas no Google Drive geradas com sucesso para o cliente!',
        })
        router.refresh()
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao conectar ao Google Drive' })
    } finally {
      setGeneratingFolders(false)
    }
  }

  async function handleSave(newStatus?: string) {
    setSaving(true)
    setFeedback(null)

    const targetStatus = newStatus || status

    const fd = new FormData()
    fd.set('order_id', order.id)
    fd.set('status', targetStatus)
    fd.set('feed_url', feedUrl)
    fd.set('stories_url', storiesUrl)
    fd.set('canva_feed_url', canvaFeedUrl)
    fd.set('canva_stories_url', canvaStoriesUrl)
    fd.set('custom_cover_url', customCoverUrl)
    fd.set('general_notes', generalNotes)

    const res = await saveCustomizationDeliveryLinksAction(fd)

    if (res?.error) {
      setFeedback({ type: 'error', message: res.error })
    } else {
      if (newStatus) setStatus(newStatus)
      setFeedback({
        type: 'success',
        message: targetStatus === 'delivered'
          ? 'Pedido marcado como Entregue! Os links já estão liberados para o cliente.'
          : 'Alterações salvas com sucesso!',
      })
      router.refresh()
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este pedido? Essa ação não pode ser desfeita.')) return
    await deleteCustomizationOrderAction(order.id)
  }

  return (
    <div className="admin-form" style={{ gap: '24px' }}>
      <Suspense fallback={null}>
        <GoogleDriveConnectionCard />
      </Suspense>

      {/* Header bar with status and delete */}
      <div className="admin-form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              className={`cust-status-badge ${currentStatusInfo.className}`}
              style={{ fontSize: '0.95rem', padding: '8px 18px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{currentStatusInfo.emoji}</span>
              <span>{currentStatusInfo.label}</span>
            </span>

            {status === 'delivered' ? (
              <span style={{ fontSize: '0.82rem', color: '#4ade80' }}>
                ✅ Liberado na área de membros do cliente
              </span>
            ) : (
              <span style={{ fontSize: '0.82rem', color: '#fbbf24' }}>
                ⏳ Cliente vê tela de artes em produção
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="btn-admin-action btn-delete"
            style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🗑️</span> Excluir Pedido
          </button>
        </div>
      </div>

      {feedback && (
        <div className={feedback.type === 'success' ? 'admin-success' : 'login-error'}>
          {feedback.message}
        </div>
      )}

      {/* Chosen Version Color Card */}
      {order.chosen_version_name ? (
        <div
          className="admin-form-section"
          style={{
            border: '1px solid rgba(56, 189, 248, 0.4)',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(14, 165, 233, 0.04) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '20px 24px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#38bdf8',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Versão de Cor Escolhida pelo Cliente
            </span>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF' }}>
              {order.chosen_version_name}
            </h2>
          </div>

          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#bae6fd',
              background: 'rgba(56, 189, 248, 0.15)',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            Aplicar esta paleta na personalização
          </span>
        </div>
      ) : (
        <div
          className="admin-form-section"
          style={{
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            background: 'rgba(255, 255, 255, 0.01)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            O cliente ainda não escolheu a versão de cores (aguardando envio do formulário).
          </span>
        </div>
      )}

      {/* Client Data Card */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">👤 Dados do Cliente</h2>
        <div className="admin-form-grid">
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nome do Cliente</span>
            <p style={{ fontWeight: 600, fontSize: '1rem', marginTop: '4px' }}>{order.client_name || 'Não informado'}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Email</span>
            <p style={{ fontWeight: 500, fontSize: '0.95rem', marginTop: '4px' }}>{order.client_email || 'Não informado'}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>WhatsApp</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontWeight: 500 }}>{order.client_whatsapp || 'Não informado'}</span>
              {whatsappDirectChatUrl && (
                <a
                  href={whatsappDirectChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-admin-action btn-view"
                  style={{ padding: '4px 10px', fontSize: '0.8rem', textDecoration: 'none', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                >
                  💬 Conversar
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Form Sharing Card */}
      <div className="admin-form-section" style={{ border: '1px solid rgba(34, 197, 94, 0.35)', background: 'rgba(34, 197, 94, 0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="admin-form-section-title" style={{ margin: 0, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📲</span> Formulário de Personalização (Link do Cliente)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px', margin: 0 }}>
              Mande o link direto no WhatsApp para o cliente preencher o que quer em cada arte do pack.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {whatsappSendFormUrl && (
              <a
                href={whatsappSendFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-admin-action"
                style={{
                  padding: '10px 18px',
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 600,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
                }}
              >
                <span>💬</span> Enviar no WhatsApp do Cliente
              </a>
            )}

            {customizeLink && (
              <button
                type="button"
                onClick={handleCopyCustomizeLink}
                className="btn-admin-action"
                style={{
                  padding: '10px 16px',
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: copiedLink ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: copiedLink ? '#4ade80' : '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <span>{copiedLink ? '✓' : '📋'}</span>
                {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
              </button>
            )}

            <button
              type="button"
              onClick={handleSyncArts}
              disabled={syncingArts}
              className="btn-admin-action"
              style={{
                padding: '10px 16px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '8px',
                cursor: syncingArts ? 'not-allowed' : 'pointer',
              }}
              title="Puxa ou atualiza as artes originais do pack para este pedido"
            >
              <span>{syncingArts ? '⏳' : '🔄'}</span>
              {syncingArts ? 'Puxando Artes...' : 'Sincronizar Artes do Pack'}
            </button>
          </div>
        </div>
      </div>

      {/* Client Instructions Section (Arte por Arte) */}
      <div className="admin-form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="admin-form-section-title" style={{ margin: 0 }}>
              📋 Instruções do Cliente ({arts.length} artes)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
              {status === 'waiting'
                ? '⏳ O cliente ainda não enviou as respostas pelo formulário do WhatsApp.'
                : 'Instruções e dados que o cliente solicitou para cada arte do pack.'}
            </p>
          </div>
        </div>

        {arts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
              Nenhuma arte vinculada a este pedido ainda.
            </p>
            <button
              type="button"
              onClick={handleSyncArts}
              disabled={syncingArts}
              className="btn-admin-action"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              🔄 Puxar artes originais do Pack agora
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {arts.map((art, index) => {
              const hasInstruction = !!art.client_instructions?.trim()
              return (
                <div
                  key={art.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: hasInstruction ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(0, 0, 0, 0.2)' }}>
                    <div style={{ width: '64px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#09090b', flexShrink: 0 }}>
                      <img
                        src={`/api/drive/proxy-thumbnail?fileId=${art.drive_file_id}`}
                        alt={art.file_name}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        ARTE #{index + 1}
                      </span>
                      <span
                        style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={art.file_name}
                      >
                        {art.file_name.replace(/\.[^.]+$/, '')}
                      </span>
                      {hasInstruction ? (
                        <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600, marginTop: '4px' }}>
                          ✓ Instrução preenchida
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px' }}>
                          — Sem alteração informada
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      O que o cliente pediu:
                    </span>
                    <div
                      style={{
                        padding: '10px 12px',
                        background: hasInstruction ? 'rgba(34, 197, 94, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid',
                        borderColor: hasInstruction ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: hasInstruction ? '#f4f4f5' : '#71717a',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.45,
                        flex: 1,
                        minHeight: '48px',
                      }}
                    >
                      {art.client_instructions || 'Nenhuma instrução específica informada para esta arte.'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Capa do Pack Personalizado */}
      <CustomizationCoverUploader
        orderId={order.id}
        coverUrl={customCoverUrl}
        defaultPackCoverUrl={order.packs?.cover_image_url || null}
        onCoverChange={setCustomCoverUrl}
        onFolderCreated={setClientFolderUrl}
      />

      {/* Google Drive & Upload Direto de Artes */}
      <div className="admin-form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h2 className="admin-form-section-title" style={{ margin: 0 }}>📁 Google Drive & Upload Direto de Artes</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
              As pastas geradas no Drive são públicas com link de visualização. Faça o upload das artes diretamente por aqui para salvar na nuvem do cliente!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {clientFolderUrl && (
              <a
                href={clientFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-admin-action"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                }}
              >
                <span>📂</span> Pasta do Cliente no Drive ↗
              </a>
            )}

            <button
              type="button"
              onClick={handleGenerateDriveFolders}
              disabled={generatingFolders}
              className="btn-admin-action"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(250, 204, 21, 0.12)',
                color: '#facc15',
                borderColor: 'rgba(250, 204, 21, 0.3)',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: generatingFolders ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{generatingFolders ? '⏳' : '⚡'}</span>
              {generatingFolders ? 'Criando Pastas no Drive...' : (!feedUrl && !storiesUrl ? 'Criar Pastas no Google Drive' : 'Recriar Pastas no Drive')}
            </button>
          </div>
        </div>

        {/* Two uploaders grid: Feed and Stories */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '12px' }}>
          <DriveFolderUploader
            title="Artes para Feed"
            icon="🖼️"
            folderUrl={feedUrl}
            aspectRatioLabel="1080×1440"
            onFolderUrlChange={setFeedUrl}
          />

          <DriveFolderUploader
            title="Artes para Stories"
            icon="📱"
            folderUrl={storiesUrl}
            aspectRatioLabel="1080×1920"
            onFolderUrlChange={setStoriesUrl}
          />
        </div>
      </div>

      {/* Canva Templates */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🎨 Templates Editáveis no Canva</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Insira aqui os links de template do Canva para o cliente poder editar se desejar (opcional).
        </p>

        <div className="admin-form-grid">
          {/* Canva Template - Feed */}
          <div className="input-group">
            <label htmlFor="canva_feed_url" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎨 Template no Canva (Feed 1080×1440)
            </label>
            <input
              id="canva_feed_url"
              type="url"
              className="input-field"
              placeholder="https://www.canva.com/design/..."
              value={canvaFeedUrl}
              onChange={e => setCanvaFeedUrl(e.target.value)}
            />
          </div>

          {/* Canva Template - Stories */}
          <div className="input-group">
            <label htmlFor="canva_stories_url" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎨 Template no Canva (Stories 1080×1920)
            </label>
            <input
              id="canva_stories_url"
              type="url"
              className="input-field"
              placeholder="https://www.canva.com/design/..."
              value={canvaStoriesUrl}
              onChange={e => setCanvaStoriesUrl(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status & Observações */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">⚙️ Status e Anotações Internas</h2>

        <div className="admin-form-grid" style={{ marginBottom: '16px' }}>
          <div className="input-group">
            <label htmlFor="order_status">Status do Pedido</label>
            <select
              id="order_status"
              className="input-field"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="waiting">⏳ Aguardando Cliente (Enviar Formulário no WhatsApp)</option>
              <option value="pending">📩 Dados Recebidos (Pendente)</option>
              <option value="in_progress">🎨 Em Produção</option>
              <option value="delivered">✅ Entregue (Liberado para o cliente)</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="general_notes">Observações / Anotações Internas (Briefing, cores, pedidos)</label>
          <textarea
            id="general_notes"
            className="input-field"
            rows={4}
            placeholder="Ex: Cliente pediu fundo escuro, logotipo enviado por WhatsApp, planos de 500MB por R$99..."
            value={generalNotes}
            onChange={e => setGeneralNotes(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="btn-admin-secondary"
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          {saving ? 'Salvando...' : '💾 Salvar Alterações'}
        </button>

        {status !== 'delivered' && (
          <button
            type="button"
            onClick={() => handleSave('delivered')}
            disabled={saving}
            className="btn-admin-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {saving ? 'Salvando...' : '🚀 Salvar e Marcar como Entregue'}
          </button>
        )}
      </div>

      {/* Metadata */}
      <div style={{ padding: '16px 0', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Criado em {new Date(order.created_at).toLocaleString('pt-BR')} • Atualizado em {new Date(order.updated_at).toLocaleString('pt-BR')}
      </div>
    </div>
  )
}
