'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface CustomizationCoverUploaderProps {
  orderId: string
  coverUrl: string
  defaultPackCoverUrl: string | null
  onCoverChange: (newUrl: string) => void
  onFolderCreated?: (folderUrl: string) => void
}

export default function CustomizationCoverUploader({
  orderId,
  coverUrl,
  defaultPackCoverUrl,
  onCoverChange,
  onFolderCreated,
}: CustomizationCoverUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showManualInput, setShowManualInput] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const effectiveDisplayCover = coverUrl || defaultPackCoverUrl || '/herocover.png'
  const isCustom = !!coverUrl

  async function handleUploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (PNG, JPG ou WEBP).')
      return
    }

    setUploading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('order_id', orderId)

      const res = await fetch('/api/admin/customization-cover', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Erro ao enviar a capa para o Google Drive.')
      } else if (data.url) {
        onCoverChange(data.url)
        setSuccessMsg('✓ Capa personalizada enviada com sucesso para o Google Drive!')
        if (data.deliveryFolderId && onFolderCreated) {
          onFolderCreated(`https://drive.google.com/drive/folders/${data.deliveryFolderId}`)
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão ao enviar a imagem.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemoveCover() {
    if (!confirm('Deseja remover a capa personalizada? A página do cliente voltará a exibir a capa padrão do pack.')) {
      return
    }

    setRemoving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/admin/customization-cover', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Erro ao remover a capa.')
      } else {
        onCoverChange('')
        setSuccessMsg('Capa personalizada removida. Agora o cliente verá a capa original do pack.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao comunicar com o servidor.')
    } finally {
      setRemoving(false)
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFile(e.dataTransfer.files[0])
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFile(e.target.files[0])
    }
  }

  return (
    <div className="admin-form-section" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 className="admin-form-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🖼️</span> Capa do Pack Personalizado
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
            Substitui a capa original do pack na visão deste cliente (na lista de versões e no topo da página personalizada). O arquivo é enviado diretamente ao Google Drive na resolução original sem compressão.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {showManualInput ? 'Ocultar URL manual' : 'Inserir URL manualmente'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '0.85rem', marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}

      {showManualInput && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            URL da Capa Personalizada
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="https://... ou /api/drive/proxy-thumbnail?fileId=..."
            value={coverUrl}
            onChange={(e) => onCoverChange(e.target.value.trim())}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
        
        {/* Preview da Capa Atual */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: isCustom ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Visualização Atual
              </span>
              {isCustom ? (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  ✓ Capa do Cliente Ativa
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-muted)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Padrão do Pack
                </span>
              )}
            </div>

            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#09090b',
                position: 'relative',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <img
                src={effectiveDisplayCover}
                alt="Capa do Pack"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </div>

          {isCustom && (
            <button
              type="button"
              onClick={handleRemoveCover}
              disabled={removing}
              className="btn-admin-action btn-delete"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '0.82rem',
                justifyContent: 'center',
                cursor: removing ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{removing ? '⏳' : '🗑️'}</span>
              {removing ? 'Removendo...' : 'Remover Capa Personalizada (Voltar ao Padrão)'}
            </button>
          )}
        </div>

        {/* Zona de Upload / Drag & Drop */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: dragActive
              ? '2px dashed #4ade80'
              : '2px dashed rgba(255, 255, 255, 0.15)',
            background: dragActive
              ? 'rgba(34, 197, 94, 0.08)'
              : 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            minHeight: '200px',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                  borderTopColor: '#4ade80',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f4f4f5' }}>
                Subindo capa original para o Google Drive...
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Salvando na pasta do cliente sem compressão
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  marginBottom: '12px',
                }}
              >
                📤
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '4px' }}>
                {isCustom ? 'Clique ou arraste para substituir a capa' : 'Arraste a capa personalizada ou clique aqui'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.4 }}>
                Aceita WEBP, PNG ou JPG • O arquivo original é gravado direto no Google Drive sem nenhuma perda de qualidade.
              </span>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
