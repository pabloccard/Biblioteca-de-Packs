'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  markRecipientSentAction,
  markRecipientPendingAction,
  deleteWhatsAppCampaignAction,
  updateWhatsAppCampaignMessageAction,
} from '../../whatsapp-actions'
import { formatDisplayPhone, formatFirstName } from '@/lib/phone-sanitizer'

interface RecipientItem {
  id: string
  campaign_id: string
  member_id: string
  phone: string
  status: string
  sent_at: string | null
  created_at: string
  members: {
    id: string
    name: string | null
    email: string
    language: string
    country: string | null
  } | null
}

interface CampaignDetail {
  id: string
  name: string
  niche: string
  language: string
  message_template: string
  created_at: string
  pack: {
    id: string
    name: string
    cover_image_url?: string | null
    buy_link?: string | null
    version?: string | null
  } | null
  totalRecipients: number
  sentRecipients: number
  pendingRecipients: number
  progress: number
  recipients: RecipientItem[]
}

interface CampaignExecutionViewProps {
  campaign: CampaignDetail
}

export default function CampaignExecutionView({ campaign }: CampaignExecutionViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pending' | 'sent'>('pending')
  const [search, setSearch] = useState('')
  const [recipients, setRecipients] = useState<RecipientItem[]>(campaign.recipients)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  const [messageTemplate, setMessageTemplate] = useState(campaign.message_template)
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [savingMessage, setSavingMessage] = useState(false)
  const [messageSavedFeedback, setMessageSavedFeedback] = useState(false)

  const pendingList = recipients.filter((r) => r.status === 'pending')
  const sentList = recipients.filter((r) => r.status === 'sent')

  const total = recipients.length
  const sentCount = sentList.length
  const pendingCount = pendingList.length
  const progressPercent = total > 0 ? Math.round((sentCount / total) * 100) : 0

  const packLink = campaign.pack?.buy_link || ''

  // Gerar mensagem personalizada para o contato usando o modelo atual da campanha
  const generateMessage = (r: RecipientItem) => {
    const firstName = formatFirstName(r.members?.name)
    return messageTemplate
      .replace(/{nome}/g, firstName)
      .replace(/{pack_link}/g, packLink)
      .replace(/{pack_nome}/g, campaign.pack?.name || 'Pack Especial')
  }

  const handleSaveMessage = async () => {
    if (!messageTemplate.trim()) return
    setSavingMessage(true)
    try {
      const res = await updateWhatsAppCampaignMessageAction(campaign.id, messageTemplate)
      if (res?.success) {
        setMessageSavedFeedback(true)
        setIsEditingMessage(false)
        setTimeout(() => setMessageSavedFeedback(false), 3500)
      } else if (res?.error) {
        alert(res.error)
      }
    } finally {
      setSavingMessage(false)
    }
  }

  const insertVariable = (variable: string) => {
    setMessageTemplate((prev) => `${prev} ${variable} `)
  }

  // Ação principal: Abrir WhatsApp e mover para "Já Enviados"
  const handleOpenWhatsApp = async (r: RecipientItem) => {
    const cleanPhone = r.phone.replace(/\D/g, '')
    const msg = generateMessage(r)
    const encodedText = encodeURIComponent(msg)

    // 1. Abrir WhatsApp Web / App em nova aba
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    window.open(waUrl, '_blank')

    // 2. Atualização otimista na tela (move imediatamente para Já Enviados)
    const now = new Date().toISOString()
    setRecipients((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, status: 'sent', sent_at: now } : item))
    )

    // 3. Persistir no banco de dados
    try {
      await markRecipientSentAction(r.id, campaign.id)
    } catch (err) {
      console.error('Erro ao marcar como enviado:', err)
    }
  }

  // Marcar como enviado manualmente sem abrir
  const handleMarkSentManually = async (r: RecipientItem) => {
    setActionInProgress(r.id)
    const now = new Date().toISOString()
    setRecipients((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, status: 'sent', sent_at: now } : item))
    )
    try {
      await markRecipientSentAction(r.id, campaign.id)
    } finally {
      setActionInProgress(null)
    }
  }

  // Reverter para pendente
  const handleMarkPending = async (r: RecipientItem) => {
    setActionInProgress(r.id)
    setRecipients((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, status: 'pending', sent_at: null } : item))
    )
    try {
      await markRecipientPendingAction(r.id, campaign.id)
    } finally {
      setActionInProgress(null)
    }
  }

  // Excluir campanha
  const handleDeleteCampaign = async () => {
    if (!confirm(`Tem certeza que deseja excluir a campanha "${campaign.name}"?`)) return
    setIsDeleting(true)
    await deleteWhatsAppCampaignAction(campaign.id)
    router.push('/admin/whatsapp')
  }

  const currentList = activeTab === 'pending' ? pendingList : sentList
  const filteredList = currentList.filter((r) => {
    const q = search.toLowerCase()
    const nameMatch = r.members?.name?.toLowerCase().includes(q)
    const emailMatch = r.members?.email?.toLowerCase().includes(q)
    const phoneMatch = r.phone.includes(q)
    return nameMatch || emailMatch || phoneMatch
  })

  return (
    <div>
      {/* Header da Campanha */}
      <div
        style={{
          background: '#141416',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '24px 28px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="wa-badge wa-badge-niche">
                {campaign.niche === 'provedor' ? '🌐 Provedor' : campaign.niche === 'hamburgueria' ? '🍔 Hamburgueria' : campaign.niche}
              </span>
              <span className="wa-badge wa-badge-lang">
                {campaign.language.toUpperCase()}
              </span>
              {campaign.pack && (
                <span style={{ fontSize: '13px', color: '#A1A1AA' }}>
                  Pack: <strong>{campaign.pack.name}</strong> {campaign.pack.version ? `(${campaign.pack.version})` : ''}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              {campaign.name}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleDeleteCampaign}
            disabled={isDeleting}
            className="wa-btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px', color: '#F87171' }}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Campanha'}
          </button>
        </div>

        {/* Barra de Progresso */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#FFFFFF' }}>
            <span>
              Progresso dos Disparos: <strong>{sentCount}</strong> de <strong>{total}</strong> contatos ({progressPercent}%)
            </span>
            <span style={{ color: pendingCount === 0 ? '#25D366' : '#A1A1AA' }}>
              {pendingCount === 0 ? '✓ Todos os contatos enviados!' : `${pendingCount} aguardando`}
            </span>
          </div>

          <div className="wa-progress-bar-bg" style={{ height: '12px' }}>
            <div className="wa-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Bloco de Mensagem da Campanha com Edição em Tempo Real */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#25D366' }}>
                💬 Mensagem da Campanha:
              </span>
              {messageSavedFeedback && (
                <span style={{ fontSize: '12px', color: '#25D366', fontWeight: 600 }}>
                  ✓ Mensagem atualizada para todos os contatos aguardando!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsEditingMessage(!isEditingMessage)}
              className="wa-btn-secondary"
              style={{ fontSize: '12px', padding: '5px 12px' }}
            >
              {isEditingMessage ? 'Fechar Editor' : '✏️ Editar Mensagem'}
            </button>
          </div>

          {!isEditingMessage ? (
            <div
              style={{
                fontSize: '13.5px',
                color: '#D4D4D8',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              {messageTemplate}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => insertVariable('{nome}')}
                  className="wa-btn-secondary"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  + Inserir &#123;nome&#125;
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{pack_nome}')}
                  className="wa-btn-secondary"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  + Inserir &#123;pack_nome&#125;
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{pack_link}')}
                  className="wa-btn-secondary"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  + Inserir &#123;pack_link&#125;
                </button>
              </div>

              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  background: '#0B141A',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMessageTemplate(campaign.message_template)
                    setIsEditingMessage(false)
                  }}
                  className="wa-btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveMessage}
                  disabled={savingMessage || !messageTemplate.trim()}
                  className="wa-btn-primary"
                  style={{ fontSize: '12px', padding: '6px 16px' }}
                >
                  {savingMessage ? 'Salvando...' : 'Salvar Nova Mensagem'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Aguardando vs Já Enviados */}
      <div className="wa-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`wa-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
        >
          <span>⏳ Aguardando Envio</span>
          <span className="wa-tab-count">{pendingCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`wa-tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
        >
          <span>✅ Já Enviados</span>
          <span className="wa-tab-count">{sentCount}</span>
        </button>
      </div>

      {/* Barra de Busca de Destinatários */}
      <div style={{ marginBottom: '18px' }}>
        <input
          type="text"
          placeholder="Pesquisar por nome, telefone ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: '#141416',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            padding: '12px 18px',
            color: '#FFFFFF',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Lista de Contatos */}
      {filteredList.length === 0 ? (
        <div
          style={{
            background: '#141416',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#A1A1AA',
          }}
        >
          {activeTab === 'pending' ? (
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#25D366', margin: '0 0 6px 0' }}>
                🎉 Nenhum contato pendente nesta lista!
              </p>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Todos os contatos desta campanha já foram contatados.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '15px', margin: 0 }}>
                Nenhum contato enviado ainda. Acesse a aba <strong>&quot;Aguardando Envio&quot;</strong> para começar.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="wa-recipients-list">
          {filteredList.map((r) => {
            const displayPhone = formatDisplayPhone(r.phone)
            const personalizedMsg = generateMessage(r)

            return (
              <div key={r.id} className="wa-recipient-card">
                <div className="wa-recipient-main">
                  <div className="wa-recipient-header">
                    <span className="wa-recipient-name">
                      {r.members?.name ? r.members.name : 'Cliente'}
                    </span>
                    <span className="wa-recipient-phone">{displayPhone}</span>
                    <span className="wa-recipient-email">• {r.members?.email}</span>
                    {r.members?.country && (
                      <span style={{ fontSize: '11px', color: '#71717A' }}>
                        ({r.members.country})
                      </span>
                    )}
                  </div>

                  {/* Preview da Mensagem */}
                  <div className="wa-recipient-msg-preview">
                    {personalizedMsg}
                  </div>

                  {activeTab === 'sent' && r.sent_at && (
                    <span style={{ fontSize: '11.5px', color: '#71717A' }}>
                      Enviado em {new Date(r.sent_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Ações do Contato */}
                <div className="wa-recipient-actions">
                  {activeTab === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(r)}
                        className="wa-btn-send"
                        title="Abre o WhatsApp com a mensagem pronta e move para Já Enviados"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        <span>Abrir WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkSentManually(r)}
                        disabled={actionInProgress === r.id}
                        className="wa-btn-secondary"
                        style={{ fontSize: '12px', padding: '9px 14px' }}
                        title="Marca como enviado sem abrir a janela do WhatsApp"
                      >
                        Já Enviei
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(r)}
                        className="wa-btn-secondary"
                        style={{ fontSize: '12px', padding: '8px 14px' }}
                        title="Reabrir conversa no WhatsApp"
                      >
                        Reabrir WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkPending(r)}
                        disabled={actionInProgress === r.id}
                        className="wa-btn-secondary"
                        style={{ fontSize: '12px', padding: '8px 12px', color: '#FFB742' }}
                        title="Mover este contato de volta para a lista de Aguardando"
                      >
                        Voltar para Aguardando
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
