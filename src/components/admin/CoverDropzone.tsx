'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface CoverDropzoneProps {
  value: string
  onChange: (url: string) => void
  packId?: string
  versionId?: string
  label?: string
}

export default function CoverDropzone({
  value,
  onChange,
  packId = 'temp',
  versionId = 'default',
  label = 'Capa da Versão',
}: CoverDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor envie um arquivo de imagem (PNG, JPG, WEBP).')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pack_id', packId)
      formData.append('version_id', versionId)

      const res = await fetch('/api/admin/upload-cover', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setUploadError(data.error || 'Erro no upload da imagem.')
      } else if (data.url) {
        onChange(data.url)
      }
    } catch {
      setUploadError('Erro de conexão ao enviar imagem.')
    } finally {
      setUploading(false)
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0])
    }
  }

  return (
    <div className="admin-cover-uploader-wrap" style={{ marginTop: '6px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {showUrlInput ? 'Ocultar campo de URL' : 'Inserir URL manualmente'}
        </button>
      </div>

      {showUrlInput && (
        <div style={{ marginBottom: '8px' }}>
          <input
            type="url"
            className="input-field"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... URL da imagem"
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />

      {value ? (
        /* Preview da imagem com botões */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
          }}
        >
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#1a1a1a',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <img
              src={value}
              alt="Capa"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>✅ Capa carregada</span>
            </div>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: '0 0 10px 0',
              }}
              title={value}
            >
              {value}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-admin-secondary"
                style={{ fontSize: '0.75rem', padding: '5px 12px' }}
              >
                {uploading ? 'Enviando...' : '🔄 Trocar Imagem'}
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={uploading}
                className="btn-admin-action btn-delete"
                style={{ fontSize: '0.75rem', padding: '5px 12px' }}
              >
                ✕ Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone para arrastar ou clicar */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed #0088ff' : '2px dashed rgba(255, 255, 255, 0.15)',
            background: isDragging ? 'rgba(0, 136, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            padding: '24px 16px',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="loading-spinner" />
              <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 500 }}>
                Enviando imagem para o Supabase Storage...
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontSize: '1.8rem' }}>🖼️</div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f7' }}>
                Arraste e solte a capa aqui, ou <span style={{ color: '#0088ff', textDecoration: 'underline' }}>clique para selecionar</span>
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                PNG, JPG ou WEBP (salvo automaticamente no Supabase)
              </p>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '6px' }}>
          ⚠️ {uploadError}
        </p>
      )}
    </div>
  )
}
