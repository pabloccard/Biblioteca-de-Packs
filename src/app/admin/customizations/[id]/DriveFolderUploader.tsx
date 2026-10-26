'use client'

import { useState, useEffect, useRef } from 'react'
import { extractDriveFolderId, formatFileSize } from '@/lib/drive-utils'

interface DriveFileItem {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  size?: string
}

interface DriveFolderUploaderProps {
  title: string
  icon: string
  folderUrl: string
  aspectRatioLabel: string
  onFolderUrlChange?: (newUrl: string) => void
}

interface UploadProgressState {
  active: boolean
  total: number
  processed: number
  currentFileName: string
  percent: number
}

function sortFilesNaturally(fileList: File[]): File[] {
  return [...fileList].sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  })
}

export default function DriveFolderUploader({
  title,
  icon,
  folderUrl,
  aspectRatioLabel,
  onFolderUrlChange,
}: DriveFolderUploaderProps) {
  const [files, setFiles] = useState<DriveFileItem[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadState, setUploadState] = useState<UploadProgressState>({
    active: false,
    total: 0,
    processed: 0,
    currentFileName: '',
    percent: 0,
  })
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderId = extractDriveFolderId(folderUrl)

  async function loadFiles(targetId: string) {
    setLoadingFiles(true)
    setErrorMessage(null)
    try {
      const res = await fetch(`/api/drive/list-files?folderId=${encodeURIComponent(targetId)}`)
      const data = await res.json()
      if (res.ok) {
        setFiles(data.files || [])
      } else {
        setErrorMessage(data.error || 'Erro ao carregar arquivos da pasta')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na conexão com Google Drive')
    } finally {
      setLoadingFiles(false)
    }
  }

  useEffect(() => {
    if (folderId) {
      loadFiles(folderId)
    } else {
      setFiles([])
    }
  }, [folderId])

  async function handleUpload(selectedFiles: FileList | File[]) {
    if (!folderId) {
      setErrorMessage('Pasta do Google Drive não identificada.')
      return
    }

    if (!selectedFiles || selectedFiles.length === 0) return

    const sortedFiles = sortFilesNaturally(Array.from(selectedFiles))
    const total = sortedFiles.length

    setUploading(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    setUploadProgress(`Iniciando envio de ${total} arquivo(s)...`)
    setUploadState({
      active: true,
      total,
      processed: 0,
      currentFileName: sortedFiles[0]?.name || '',
      percent: 0,
    })

    const failedFiles: string[] = []
    let processedCount = 0

    async function uploadSingleFile(file: File) {
      try {
        setUploadState(prev => ({
          ...prev,
          currentFileName: file.name,
        }))
        setUploadProgress(`Enviando ${processedCount + 1} de ${total}: ${file.name}`)

        const fd = new FormData()
        fd.set('folderId', folderId!)
        fd.append('files', file)

        const res = await fetch('/api/drive/upload', {
          method: 'POST',
          body: fd,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Falha no upload de ${file.name}`)
        }

        processedCount++
        const pct = Math.round((processedCount / total) * 100)
        setUploadState(prev => ({
          ...prev,
          processed: processedCount,
          percent: pct,
        }))
        setUploadProgress(`Enviando (${pct}%): ${processedCount} de ${total} concluídos`)
      } catch (err: any) {
        console.error(`Erro ao enviar ${file.name}:`, err)
        failedFiles.push(file.name)
        processedCount++
        const pct = Math.round((processedCount / total) * 100)
        setUploadState(prev => ({
          ...prev,
          processed: processedCount,
          percent: pct,
        }))
      }
    }

    try {
      // 2 uploads simultâneos para rapidez e fluidez no progresso
      let fileIdx = 0
      async function worker() {
        while (fileIdx < sortedFiles.length) {
          const file = sortedFiles[fileIdx++]
          await uploadSingleFile(file)
        }
      }

      await Promise.all([worker(), worker()])

      if (failedFiles.length > 0) {
        setErrorMessage(
          `Aviso: ${failedFiles.length} de ${total} arquivo(s) não foram enviados (${failedFiles.join(', ')}). Os demais foram salvos com sucesso.`
        )
      } else {
        setSuccessMessage(`✅ ${total} arquivo(s) enviado(s) com sucesso para o Google Drive!`)
      }

      await loadFiles(folderId)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha no envio de arquivos')
    } finally {
      setUploading(false)
      setUploadProgress('')
      setUploadState(prev => ({ ...prev, active: false }))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeleteFile(fileId: string, fileName: string) {
    if (!confirm(`Deseja realmente excluir "${fileName}" do Google Drive?`)) return

    try {
      const res = await fetch('/api/drive/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      })

      if (res.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        setSuccessMessage(`Arquivo "${fileName}" removido do Drive.`)
        setTimeout(() => setSuccessMessage(null), 4000)
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir arquivo')
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir')
    }
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>{icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{title}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Proporção recomendada: {aspectRatioLabel}</span>
          </div>
        </div>

        {folderUrl && (
          <a
            href={folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-admin-action"
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#60a5fa',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              textDecoration: 'none',
              borderRadius: '6px',
            }}
          >
            <span>↗</span> Abrir no Drive
          </a>
        )}
      </div>

      {/* Input de URL manual (editável se necessário) */}
      <div className="input-group" style={{ margin: 0 }}>
        <input
          type="url"
          className="input-field"
          style={{ fontSize: '0.82rem', padding: '8px 12px' }}
          placeholder="https://drive.google.com/drive/folders/..."
          value={folderUrl}
          onChange={e => onFolderUrlChange?.(e.target.value)}
        />
      </div>

      {/* Feedback Messages */}
      {errorMessage && (
        <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '0.8rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          {successMessage}
        </div>
      )}

      {/* Upload Zone (Only visible when folderId is valid) */}
      {folderId ? (
        <>
          <div
            onDragOver={e => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => {
              e.preventDefault()
              setDragActive(false)
              if (e.dataTransfer.files?.length) {
                handleUpload(e.dataTransfer.files)
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? '#facc15' : 'rgba(255, 255, 255, 0.15)'}`,
              background: dragActive ? 'rgba(250, 204, 21, 0.05)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '10px',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,application/zip"
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files?.length) {
                  handleUpload(e.target.files)
                }
              }}
              disabled={uploading}
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.8rem' }}>{uploading ? '⏳' : '📤'}</span>
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 500, color: '#e4e4e7' }}>
                {uploading
                  ? uploadProgress
                  : 'Clique ou arraste as artes aqui para enviar ao Drive'}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Formatos aceitos: PNG, JPG, WEBP, ZIP • Upload direto para a pasta do cliente
              </span>
            </div>
          </div>

          {/* Visual Progress Bar during Upload */}
          {uploadState.active && (
            <div
              style={{
                background: 'rgba(24, 24, 27, 0.95)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="loading-spinner" style={{ width: '16px', height: '16px', borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f4f4f5' }}>
                    Enviando arquivo {Math.min(uploadState.processed + 1, uploadState.total)} de {uploadState.total} para o Drive
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.92rem', color: '#60a5fa', fontWeight: 700 }}>
                    {uploadState.percent}%
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ({uploadState.processed}/{uploadState.total})
                  </span>
                </div>
              </div>

              {/* Animated Glowing Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${uploadState.percent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)',
                  }}
                />
              </div>

              {uploadState.currentFileName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                    📄 {uploadState.currentFileName}
                  </span>
                  <span>Aguarde o envio...</span>
                </div>
              )}
            </div>
          )}

          {/* Files Gallery in Drive */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Arquivos na Pasta ({files.length})
              </span>
              <button
                type="button"
                onClick={() => folderId && loadFiles(folderId)}
                disabled={loadingFiles}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                {loadingFiles ? 'Atualizando...' : '🔄 Atualizar'}
              </button>
            </div>

            {loadingFiles && files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Carregando arquivos do Google Drive...
              </div>
            ) : files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Nenhum arquivo enviado nesta pasta ainda. Faça o upload acima!
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '10px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  padding: '4px',
                }}
              >
                {files.map(file => (
                  <div
                    key={file.id}
                    style={{
                      background: '#121214',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '110px',
                        background: '#09090b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={`/api/drive/proxy-thumbnail?fileId=${file.id}`}
                        alt={file.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteFile(file.id, file.name)
                        }}
                        title="Excluir do Drive"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: 'none',
                          color: '#fff',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span
                        title={file.name}
                        style={{
                          fontSize: '0.72rem',
                          color: '#f4f4f5',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 500,
                        }}
                      >
                        {file.name}
                      </span>
                      {file.size && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {formatFileSize(file.size)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          💡 Cole o link da pasta do Google Drive acima ou utilize o botão <strong>&quot;Gerar Pastas no Google Drive&quot;</strong> para habilitar o upload direto.
        </div>
      )}
    </div>
  )
}
