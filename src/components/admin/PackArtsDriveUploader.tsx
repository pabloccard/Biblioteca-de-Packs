'use client'

import { useState, useEffect, useRef } from 'react'
import { extractDriveFolderId, formatFileSize } from '@/lib/drive-utils'
import { generateDriveArtsFolderForPackAction, createDriveFolderForNewPackAction } from '@/app/admin/actions'
import { optimizePackArt, sortFilesNaturally } from '@/lib/image-optimizer'

export interface DriveFileItem {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  size?: string
}

interface UploadProgressState {
  active: boolean
  phase: 'idle' | 'optimizing' | 'uploading' | 'completed' | 'error'
  total: number
  processed: number
  currentFileName: string
  currentAction: string
  percent: number
  originalTotalBytes: number
  optimizedTotalBytes: number
}

interface PackArtsDriveUploaderProps {
  packId?: string
  packName: string
  driveArtsFolderId: string
  onChangeDriveFolderId: (newId: string) => void
  onFilesLoaded?: (files: DriveFileItem[]) => void
}

export default function PackArtsDriveUploader({
  packId,
  packName,
  driveArtsFolderId,
  onChangeDriveFolderId,
  onFilesLoaded,
}: PackArtsDriveUploaderProps) {
  const [files, setFiles] = useState<DriveFileItem[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [uploadState, setUploadState] = useState<UploadProgressState>({
    active: false,
    phase: 'idle',
    total: 0,
    processed: 0,
    currentFileName: '',
    currentAction: '',
    percent: 0,
    originalTotalBytes: 0,
    optimizedTotalBytes: 0,
  })
  const [dragActive, setDragActive] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderId = extractDriveFolderId(driveArtsFolderId)

  // Carregar arquivos da pasta do Google Drive
  async function loadFiles(targetId: string) {
    setLoadingFiles(true)
    setErrorMessage(null)
    try {
      const res = await fetch(`/api/drive/list-files?folderId=${encodeURIComponent(targetId)}`)
      const data = await res.json()
      if (res.ok) {
        const loadedFiles = data.files || []
        setFiles(loadedFiles)
        onFilesLoaded?.(loadedFiles)
      } else {
        setErrorMessage(data.error || 'Erro ao carregar arquivos da pasta do Drive')
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

  // Criar pasta de amostras no Google Drive automaticamente
  async function handleCreateFolder() {
    if (!packName.trim()) {
      setErrorMessage('Informe o Nome do Pack antes de criar a pasta no Drive.')
      return
    }

    setCreatingFolder(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      let res: { error?: string; folderId?: string; folderUrl?: string; message?: string }
      if (packId) {
        res = await generateDriveArtsFolderForPackAction(packId)
      } else {
        res = await createDriveFolderForNewPackAction(packName)
      }

      if (res.error) {
        setErrorMessage(res.error)
      } else if (res.folderId) {
        onChangeDriveFolderId(res.folderId)
        setSuccessMessage(res.message || 'Pasta criada com sucesso no Google Drive!')
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao criar pasta no Google Drive')
    } finally {
      setCreatingFolder(false)
    }
  }

  // Upload otimizado de arquivos para a pasta do Drive (escala 100%, WebP 50%, com progresso visual)
  async function handleUpload(selectedFiles: FileList | File[]) {
    if (!folderId) {
      setErrorMessage('Pasta do Google Drive não identificada.')
      return
    }

    const targetFolderId = folderId

    if (!selectedFiles || selectedFiles.length === 0) return

    const rawFiles = Array.from(selectedFiles)
    // Ordena os arquivos numericamente (1.png, 2.png, ..., 40.png)
    const sortedFiles = sortFilesNaturally(rawFiles)
    const total = sortedFiles.length

    setErrorMessage(null)
    setSuccessMessage(null)

    setUploadState({
      active: true,
      phase: 'optimizing',
      total,
      processed: 0,
      currentFileName: sortedFiles[0]?.name || '',
      currentAction: 'Iniciando otimização...',
      percent: 0,
      originalTotalBytes: 0,
      optimizedTotalBytes: 0,
    })

    let processedCount = 0
    let totalOrig = 0
    let totalOpt = 0
    const failedFiles: string[] = []

    async function processFile(file: File) {
      try {
        setUploadState(prev => ({
          ...prev,
          currentFileName: file.name,
          currentAction: 'Otimizando (escala 100%, WebP 50%)',
        }))

        // 1. Preserva 100% das dimensões originais e compacta para WebP 50%
        const opt = await optimizePackArt(file, 1.0, 0.5)
        totalOrig += opt.originalSize
        totalOpt += opt.optimizedSize

        setUploadState(prev => ({
          ...prev,
          currentFileName: opt.file.name,
          currentAction: 'Enviando ao Drive',
          originalTotalBytes: totalOrig,
          optimizedTotalBytes: totalOpt,
        }))

        // 2. Upload para a API do Google Drive
        const fd = new FormData()
        fd.set('folderId', targetFolderId)
        fd.append('files', opt.file)

        const res = await fetch('/api/drive/upload', {
          method: 'POST',
          body: fd,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Falha no upload de ${opt.file.name}`)
        }

        processedCount++
        setUploadState(prev => ({
          ...prev,
          processed: processedCount,
          percent: Math.round((processedCount / total) * 100),
          originalTotalBytes: totalOrig,
          optimizedTotalBytes: totalOpt,
        }))
      } catch (err: any) {
        console.error(`Erro ao enviar ${file.name}:`, err)
        failedFiles.push(file.name)
        processedCount++
        setUploadState(prev => ({
          ...prev,
          processed: processedCount,
          percent: Math.round((processedCount / total) * 100),
        }))
      }
    }

    try {
      // Processa com concorrência de 2 workers simultâneos
      let fileIdx = 0
      async function worker() {
        while (fileIdx < sortedFiles.length) {
          const file = sortedFiles[fileIdx++]
          await processFile(file)
        }
      }

      await Promise.all([worker(), worker()])

      if (failedFiles.length > 0) {
        setErrorMessage(
          `Upload finalizado com avisos: ${failedFiles.length} arquivo(s) não foram enviados (${failedFiles.join(', ')}).`
        )
      } else {
        const savedPercent = totalOrig > 0 ? Math.round((1 - totalOpt / totalOrig) * 100) : 0
        setSuccessMessage(
          `✅ ${total} arte(s) otimizada(s) e enviada(s) com sucesso ao Drive! Economia de ${savedPercent}% (${formatFileSize(totalOrig)} ➔ ${formatFileSize(totalOpt)}).`
        )
      }

      setUploadState(prev => ({
        ...prev,
        phase: 'completed',
        percent: 100,
        currentAction: 'Concluído',
        currentFileName: '',
      }))

      await loadFiles(folderId)

      setTimeout(() => {
        setUploadState(prev => ({ ...prev, active: false }))
      }, 6000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha no processo de upload')
      setUploadState(prev => ({ ...prev, active: false }))
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Excluir arquivo da pasta do Drive
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
        setSuccessMessage(`Arte "${fileName}" removida do Drive.`)
        setTimeout(() => setSuccessMessage(null), 4000)
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir arquivo')
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir')
    }
  }

  const driveFolderUrl = folderId ? `https://drive.google.com/drive/folders/${folderId}` : ''

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Campo oculto com o ID para ser submetido no form */}
      <input type="hidden" name="drive_arts_folder_id" value={folderId || ''} />

      {/* Header com Status do Drive */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🎨</span>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
              Artes de Amostra no Google Drive
            </h3>
            {folderId && (
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
                  fontWeight: 600,
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                Conectado
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Faça upload das imagens de demonstração deste pack. Elas são exibidas no carrossel de compra do dashboard.
          </p>
        </div>

        {folderId && (
          <a
            href={driveFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-admin-action"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              borderColor: 'rgba(59, 130, 246, 0.35)',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 500,
            }}
          >
            <span>📁</span> Abrir Pasta no Drive ↗
          </a>
        )}
      </div>

      {/* Botão de Criação de Pasta OU Input de Pasta */}
      {!folderId ? (
        <div
          style={{
            padding: '24px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
            border: '1px dashed rgba(59, 130, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '14px',
          }}
        >
          <div style={{ maxWidth: '480px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#fff' }}>
              Nenhuma pasta do Google Drive vinculada
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Clique no botão abaixo para criar automaticamente uma pasta pública <strong>&quot;{packName || 'Nome do Pack'} - Amostras&quot;</strong> no seu Drive, ou cole um link existente.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleCreateFolder}
              disabled={creatingFolder}
              className="btn-admin-primary"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                padding: '10px 20px',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              {creatingFolder ? 'Criando Pasta no Drive...' : '✨ Criar Pasta de Amostras no Google Drive'}
            </button>
          </div>

          <div style={{ width: '100%', maxWidth: '440px', marginTop: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Ou cole o link/ID de uma pasta existente:
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveArtsFolderId}
              onChange={e => onChangeDriveFolderId(e.target.value)}
              style={{ fontSize: '0.82rem', padding: '8px 12px' }}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              ID ou Link da Pasta do Google Drive:
            </label>
            <input
              type="text"
              className="input-field"
              value={driveArtsFolderId}
              onChange={e => onChangeDriveFolderId(e.target.value)}
              placeholder="Cole o ID ou URL da pasta do Drive"
              style={{ fontSize: '0.82rem', padding: '7px 10px' }}
            />
          </div>
          <button
            type="button"
            onClick={() => loadFiles(folderId)}
            disabled={loadingFiles}
            className="btn-admin-secondary"
            style={{ alignSelf: 'flex-end', padding: '7px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            {loadingFiles ? 'Carregando...' : '🔄 Recarregar'}
          </button>
        </div>
      )}

      {/* Mensagens de Feedback */}
      {errorMessage && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            fontSize: '0.84rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#4ade80',
            fontSize: '0.84rem',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Área de Upload (Drag & Drop) */}
      {folderId && (
        <>
          {/* Card de Progresso Visual de Otimização e Upload */}
          {uploadState.active && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Top row: Status, Title and Percentage */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '1.4rem',
                      display: 'inline-block',
                      animation: uploadState.phase === 'completed' ? 'none' : 'spin 1.8s linear infinite',
                    }}
                  >
                    {uploadState.phase === 'completed' ? '✅' : '⚡'}
                  </span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#fff' }}>
                      {uploadState.phase === 'completed'
                        ? 'Upload Concluído com Sucesso!'
                        : 'Otimizando e Enviando ao Google Drive...'}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                      ⚡ Dimensões originais 100% • Compactação WebP 50%
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    background: uploadState.percent === 100 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                    color: uploadState.percent === 100 ? '#4ade80' : '#60a5fa',
                    border: `1px solid ${uploadState.percent === 100 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {uploadState.percent}%
                </span>
              </div>

              {/* Barra de Progresso Animada */}
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: `${uploadState.percent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                    borderRadius: '9999px',
                    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 14px rgba(59, 130, 246, 0.7)',
                  }}
                />
              </div>

              {/* Informações detalhadas */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>
                    {uploadState.processed} de {uploadState.total} artes processadas
                  </span>
                  {uploadState.currentFileName && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#93c5fd',
                        fontSize: '0.76rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {uploadState.currentAction}: {uploadState.currentFileName}
                    </span>
                  )}
                </div>

                {uploadState.originalTotalBytes > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Tamanho: {formatFileSize(uploadState.originalTotalBytes)} ➔{' '}
                      <strong style={{ color: '#4ade80' }}>
                        {formatFileSize(uploadState.optimizedTotalBytes)}
                      </strong>
                    </span>
                    {uploadState.optimizedTotalBytes < uploadState.originalTotalBytes && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: '#4ade80',
                          fontWeight: 700,
                        }}
                      >
                        -{Math.round((1 - uploadState.optimizedTotalBytes / uploadState.originalTotalBytes) * 100)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            onDragOver={e => {
              e.preventDefault()
              if (!uploadState.active) setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => {
              e.preventDefault()
              setDragActive(false)
              if (!uploadState.active && e.dataTransfer.files?.length) {
                handleUpload(e.dataTransfer.files)
              }
            }}
            onClick={() => {
              if (!uploadState.active) fileInputRef.current?.click()
            }}
            style={{
              border: `2px dashed ${dragActive ? '#facc15' : 'rgba(255, 255, 255, 0.18)'}`,
              background: dragActive ? 'rgba(250, 204, 21, 0.06)' : 'rgba(0, 0, 0, 0.25)',
              borderRadius: '10px',
              padding: '28px 16px',
              textAlign: 'center',
              cursor: uploadState.active ? 'not-allowed' : 'pointer',
              opacity: uploadState.active ? 0.6 : 1,
              pointerEvents: uploadState.active ? 'none' : 'auto',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/jpg"
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files?.length) {
                  handleUpload(e.target.files)
                }
              }}
              disabled={uploadState.active}
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '2.2rem' }}>{uploadState.active ? '⏳' : '📤'}</span>
              <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: '#f4f4f5' }}>
                {uploadState.active
                  ? `Upload em andamento (${uploadState.percent}%)... Acompanhe na barra acima`
                  : 'Arraste as artes aqui ou clique para selecionar'}
              </p>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                PNG, JPG ou WEBP • As imagens são enviadas diretamente para a pasta do Google Drive
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  marginTop: '4px',
                }}
              >
                <span>⚡</span>
                <strong>Otimização automática ativada:</strong> escala original 100% e compactação WebP 50% antes do envio
              </span>
            </div>
          </div>

          {/* Galeria de Artes no Drive */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🖼️</span> Artes na Pasta do Drive ({files.length})
              </span>
              <button
                type="button"
                onClick={() => loadFiles(folderId)}
                disabled={loadingFiles}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                {loadingFiles ? 'Atualizando...' : '🔄 Atualizar'}
              </button>
            </div>

            {loadingFiles && files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Carregando artes do Google Drive...
              </div>
            ) : files.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  fontSize: '0.84rem',
                }}
              >
                Nenhuma arte nesta pasta do Google Drive ainda. Arraste suas imagens acima para publicar!
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '12px',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  padding: '4px',
                }}
              >
                {files.map((file, idx) => {
                  const thumb = file.thumbnailLink
                    ? file.thumbnailLink.replace(/=s\d+$/, '=s400')
                    : `/api/drive/proxy-thumbnail?fileId=${file.id}`

                  return (
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
                        transition: 'transform 0.15s ease, border-color 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          height: '130px',
                          background: '#09090b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={thumb}
                          alt={file.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => {
                            // Fallback para o proxy se o thumbnailLink der erro
                            if (!e.currentTarget.src.includes('proxy-thumbnail')) {
                              e.currentTarget.src = `/api/drive/proxy-thumbnail?fileId=${file.id}`
                            }
                          }}
                        />

                        {/* Badge de numeração da arte */}
                        <span
                          style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          #{idx + 1}
                        </span>

                        {/* Botão de Excluir */}
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
                            background: 'rgba(239, 68, 68, 0.9)',
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
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
