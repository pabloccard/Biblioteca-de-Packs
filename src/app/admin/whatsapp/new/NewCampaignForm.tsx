'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createWhatsAppCampaignAction,
  getEligibleAudienceForPackAction,
} from '../../whatsapp-actions'
import { detectPackNiche } from '@/lib/phone-sanitizer'

interface PackItem {
  id: string
  name: string
  version?: string | null
  language: string
  buy_link?: string | null
  category_id?: string | null
  pack_categories?: any
}

interface NewCampaignFormProps {
  packs: PackItem[]
}

export default function NewCampaignForm({ packs }: NewCampaignFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedPackId, setSelectedPackId] = useState(packs[0]?.id || '')
  const [campaignName, setCampaignName] = useState('')
  const [excludePurchased, setExcludePurchased] = useState(true)
  const [messageTemplate, setMessageTemplate] = useState(
    'Olá {nome}, tudo bem? Acabamos de lançar novas artes para o seu segmento! Dá uma conferida aqui: {pack_link}'
  )

  const [audienceCount, setAudienceCount] = useState<number | null>(null)
  const [calculatingAudience, setCalculatingAudience] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPack = packs.find((p) => p.id === selectedPackId)
  const niche = selectedPack
    ? detectPackNiche(selectedPack.name, selectedPack.pack_categories?.tag)
    : 'geral'
  const language = selectedPack?.language || 'pt'

  // Atualizar contagem de audiência quando o pack ou o checkbox mudar
  useEffect(() => {
    if (!selectedPackId) return

    let isMounted = true
    setCalculatingAudience(true)

    getEligibleAudienceForPackAction(selectedPackId, excludePurchased)
      .then((res) => {
        if (isMounted) {
          setAudienceCount(res.count)
          setCalculatingAudience(false)
        }
      })
      .catch(() => {
        if (isMounted) setCalculatingAudience(false)
      })

    // Sugerir nome da campanha se estiver vazio
    if (!campaignName && selectedPack) {
      const nicheLabel = niche === 'provedor' ? 'Provedor' : niche === 'hamburgueria' ? 'Hamburgueria' : 'Geral'
      setCampaignName(`Lançamento ${selectedPack.name} (${nicheLabel} ${language.toUpperCase()})`)
    }

    return () => {
      isMounted = false
    }
  }, [selectedPackId, excludePurchased])

  const insertVariable = (variable: string) => {
    setMessageTemplate((prev) => `${prev} ${variable} `)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!campaignName.trim()) {
      setError('Por favor, informe um nome para a campanha.')
      return
    }

    if (!selectedPackId) {
      setError('Selecione um pack.')
      return
    }

    if (!messageTemplate.trim()) {
      setError('Por favor, digite o modelo da mensagem.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', campaignName.trim())
      formData.append('pack_id', selectedPackId)
      formData.append('message_template', messageTemplate.trim())
      formData.append('exclude_already_purchased', excludePurchased ? 'true' : 'false')

      const res = await createWhatsAppCampaignAction(formData)

      if (res?.error) {
        setError(res.error)
      } else if (res?.campaignId) {
        router.push(`/admin/whatsapp/${res.campaignId}`)
      }
    })
  }

  // Preview da mensagem no balão do WhatsApp
  const sampleLink = selectedPack?.buy_link || 'https://suaplataforma.com/pack/...'
  const previewText = messageTemplate
    .replace(/{nome}/g, 'Carlos')
    .replace(/{pack_link}/g, sampleLink)
    .replace(/{pack_nome}/g, selectedPack?.name || 'Pack Especial')

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '32px' }}>
      {/* Coluna da Esquerda: Configurações */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Nome da Campanha */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#A1A1AA', marginBottom: '8px' }}>
            Nome da Campanha
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Ex: Lançamento Stories Hamburgueria PT"
            required
            style={{
              width: '100%',
              background: '#141416',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '12px 16px',
              color: '#FFFFFF',
              fontSize: '15px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Seleção do Pack */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#A1A1AA', marginBottom: '8px' }}>
            Selecione o Pack da Campanha
          </label>
          <select
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
            style={{
              width: '100%',
              background: '#141416',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '12px 16px',
              color: '#FFFFFF',
              fontSize: '15px',
              boxSizing: 'border-box',
            }}
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.version ? `(${p.version})` : ''} — [{p.language.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>

        {/* Badges de Nicho e Idioma Detectados */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#A1A1AA', fontWeight: 600 }}>Segmentação Automática:</span>
            <span className="wa-badge wa-badge-niche">
              {niche === 'provedor' ? '🌐 Nicho: Provedor de Internet' : niche === 'hamburgueria' ? '🍔 Nicho: Hamburgueria' : `Nicho: ${niche}`}
            </span>
            <span className="wa-badge wa-badge-lang">
              Idioma: {language.toUpperCase()}
            </span>
          </div>

          <div style={{ fontSize: '13.5px', color: '#D4D4D8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {calculatingAudience ? (
              <span style={{ color: '#A1A1AA' }}>Calculando clientes qualificados com WhatsApp...</span>
            ) : (
              <span>
                👥 <strong>{audienceCount ?? 0} clientes</strong> qualificados neste nicho com WhatsApp cadastrado e prontos para receber.
              </span>
            )}
          </div>
        </div>

        {/* Checkbox de Exclusão de quem já comprou */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#141416',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px 18px',
            cursor: 'pointer',
            fontSize: '13.5px',
            color: '#FFFFFF',
          }}
        >
          <input
            type="checkbox"
            checked={excludePurchased}
            onChange={(e) => setExcludePurchased(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
          />
          <div>
            <strong>Excluir compradores que já possuem este pack específico</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#A1A1AA' }}>
              Recomendado para campanhas de novidade ou upsell para evitar enviar para quem já tem.
            </p>
          </div>
        </label>

        {/* Template da Mensagem */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#A1A1AA' }}>
              Mensagem Personalizada do WhatsApp
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => insertVariable('{nome}')}
                className="wa-btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                + Inserir &#123;nome&#125;
              </button>
              <button
                type="button"
                onClick={() => insertVariable('{pack_link}')}
                className="wa-btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                + Inserir &#123;pack_link&#125;
              </button>
            </div>
          </div>

          <textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            rows={5}
            required
            style={{
              width: '100%',
              background: '#141416',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '14px 16px',
              color: '#FFFFFF',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ fontSize: '12px', color: '#71717A', marginTop: '4px', display: 'block' }}>
            A tag <code>&#123;nome&#125;</code> será substituída pelo primeiro nome do cliente na hora de abrir o WhatsApp.
          </span>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '12px 16px', color: '#F87171', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || audienceCount === 0}
          className="wa-btn-primary"
          style={{ padding: '14px 28px', fontSize: '16px', justifyContent: 'center' }}
        >
          {isPending ? 'Criando Campanha...' : 'Criar Campanha e Listar Contatos →'}
        </button>
      </div>

      {/* Coluna da Direita: Preview do WhatsApp */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#A1A1AA', marginBottom: '8px' }}>
          Prévia em Tempo Real no WhatsApp
        </label>

        {/* Mockup do WhatsApp */}
        <div
          style={{
            background: '#0B141A',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Header do WhatsApp Mockup */}
          <div
            style={{
              background: '#202C33',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#2A3942',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#25D366',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              C
            </div>
            <div>
              <div style={{ color: '#E9EDEF', fontSize: '15px', fontWeight: 600 }}>Carlos (Comprador)</div>
              <div style={{ color: '#8696A0', fontSize: '12px' }}>online</div>
            </div>
          </div>

          {/* Área de Conversa com Wallpaper WhatsApp */}
          <div
            style={{
              padding: '24px 18px',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Balão da Mensagem */}
            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: '85%',
                background: '#005C4B',
                color: '#E9EDEF',
                padding: '12px 16px',
                borderRadius: '16px 4px 16px 16px',
                fontSize: '14px',
                lineHeight: '1.5',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {previewText}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '6px',
                }}
              >
                <span>10:45</span>
                <span style={{ color: '#53BDEB' }}>✓✓</span>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '12.5px', color: '#71717A', marginTop: '12px', lineHeight: '1.5' }}>
          💡 Ao clicar em <strong>&quot;Abrir WhatsApp&quot;</strong> na tela de disparos, o WhatsApp Web ou aplicativo oficial será aberto com esta exata mensagem já digitada para o número do cliente!
        </p>
      </div>
    </form>
  )
}
