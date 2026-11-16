'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface ImportReport {
  totalRowsInFile: number
  validPhonesFound: number
  savedNewPhones: number
  updatedPhones: number
  alreadyHadSamePhone: number
  invalidOrMissingPhones: number
  invalidPhoneSamples: { email: string; raw: string; reason: string }[]
  notFoundInDbCount: number
  notFoundInDb: { email: string; name?: string; phone?: string; country?: string }[]
}

export default function WhatsAppImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [copied, setCopied] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setError(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo.')
      return
    }

    setLoading(true)
    setError(null)
    setReport(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/whatsapp/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro ao processar o arquivo.')
      }

      setReport(data.report)
    } catch (err: any) {
      setError(err?.message || 'Falha ao importar planilha.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyNotFoundEmails = () => {
    if (!report || report.notFoundInDb.length === 0) return
    const emails = report.notFoundInDb.map((m) => m.email).join('\n')
    navigator.clipboard.writeText(emails)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownloadNotFoundCsv = () => {
    if (!report || report.notFoundInDb.length === 0) return
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Nome,Telefone,Pais']
        .concat(
          report.notFoundInDb.map(
            (m) => `"${m.email}","${m.name || ''}","${m.phone || ''}","${m.country || ''}"`
          )
        )
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'emails_nao_encontrados_plataforma.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredNotFound = report?.notFoundInDb.filter(
    (m) =>
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="wa-container">
      {/* Back button and title */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/whatsapp" className="pack-back-btn" style={{ marginBottom: '8px', display: 'inline-block' }}>
          ← Voltar para Campanhas
        </Link>
        <h1 className="wa-title">
          <span>Importar Telefones da Planilha (Hotmart)</span>
        </h1>
        <p className="wa-subtitle">
          Faça o upload do arquivo exportado da Hotmart para sincronizar os números de telefone consumindo o mínimo absoluto de egress.
        </p>
      </div>

      {/* Info card sobre colunas */}
      <div
        style={{
          background: 'rgba(37, 211, 102, 0.05)',
          border: '1px solid rgba(37, 211, 102, 0.2)',
          borderRadius: '16px',
          padding: '18px 22px',
          marginBottom: '24px',
          fontSize: '13.5px',
          lineHeight: '1.6',
          color: '#D4D4D8',
        }}
      >
        <strong style={{ color: '#25D366' }}>💡 Dica para exportação na Hotmart:</strong>
        <p style={{ margin: '6px 0 0 0' }}>
          Recomendamos marcar os campos: <strong>Email Comprador(a)</strong>, <strong>Telefone Comprador(a)</strong>, <strong>País Comprador(a)</strong> e <strong>Nome Comprador(a)</strong>.
          <br />
          O campo <em>País</em> garante que clientes internacionais recebam o DDI correto automaticamente, enquanto números do Brasil recebem o prefixo <code>55</code>. O sistema limpa aspas, parênteses, traços e ignora textos como <code>(nome)</code>.
        </p>
      </div>

      {/* Dropzone */}
      <div
        className={`wa-dropzone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.tsv,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div className="wa-dropzone-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div>
          <h3 className="wa-dropzone-title">
            {file ? file.name : 'Clique para selecionar ou arraste a planilha aqui'}
          </h3>
          <p className="wa-dropzone-desc">
            Suporta formatos <strong>.xlsx</strong>, <strong>.xls</strong> e <strong>.csv</strong>.
          </p>
        </div>

        {file && (
          <span style={{ fontSize: '12px', color: '#25D366', fontWeight: 600 }}>
            Arquivo pronto: {(file.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>

      {/* Botão de envio */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          className="wa-btn-primary"
          style={{ padding: '12px 28px', fontSize: '15px' }}
        >
          {loading ? (
            <>
              <span className="custom-button-spinner custom-button-spinner-dark" />
              <span>Processando com Mínimo Egress...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Importar e Sincronizar Números</span>
            </>
          )}
        </button>

        {file && !loading && (
          <button
            type="button"
            onClick={() => {
              setFile(null)
              setReport(null)
              setError(null)
            }}
            className="wa-btn-secondary"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px',
            padding: '16px 20px',
            color: '#F87171',
            fontSize: '14px',
          }}
        >
          <strong>Erro:</strong> {error}
        </div>
      )}

      {/* Relatório de Sucesso */}
      {report && (
        <div className="wa-report-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 className="wa-report-title">
              <span style={{ color: '#25D366' }}>✓</span>
              <span>Relatório de Importação Concluído</span>
            </h2>

            <Link href="/admin/whatsapp/new" className="wa-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Criar Campanha com os Números →
            </Link>
          </div>

          {/* Grid de Métricas */}
          <div className="wa-report-metrics">
            <div className="wa-report-metric-box">
              <span className="wa-report-metric-num">{report.totalRowsInFile}</span>
              <span className="wa-report-metric-label">Linhas na Planilha</span>
            </div>

            <div className="wa-report-metric-box">
              <span className="wa-report-metric-num success">+{report.savedNewPhones}</span>
              <span className="wa-report-metric-label">Novos Telefones Salvos</span>
            </div>

            <div className="wa-report-metric-box">
              <span className="wa-report-metric-num info">{report.updatedPhones}</span>
              <span className="wa-report-metric-label">Telefones Atualizados</span>
            </div>

            <div className="wa-report-metric-box">
              <span className="wa-report-metric-num" style={{ color: '#A1A1AA' }}>{report.alreadyHadSamePhone}</span>
              <span className="wa-report-metric-label">Já Possuíam Esse Número</span>
            </div>

            <div className="wa-report-metric-box">
              <span className="wa-report-metric-num warning">{report.invalidOrMissingPhones}</span>
              <span className="wa-report-metric-label">Inválidos / Em branco (ex: &apos;(nome)&apos;)</span>
            </div>

            <div className="wa-report-metric-box">
              <span className="wa-report-metric-num danger">{report.notFoundInDbCount}</span>
              <span className="wa-report-metric-label">E-mails não no Banco</span>
            </div>
          </div>

          {/* Amostras de números ignorados */}
          {report.invalidPhoneSamples && report.invalidPhoneSamples.length > 0 && (
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFB742', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Exemplos de linhas filtradas como inválidas:
              </span>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '12.5px', color: '#A1A1AA', lineHeight: '1.6' }}>
                {report.invalidPhoneSamples.map((s, idx) => (
                  <li key={idx}>
                    <strong>{s.email}</strong>: valor bruto <code>&apos;{s.raw}&apos;</code> ({s.reason})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* E-mails não cadastrados no banco */}
          {report.notFoundInDbCount > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    E-mails da Planilha que NÃO estão cadastrados na plataforma ({report.notFoundInDbCount})
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#A1A1AA', margin: '4px 0 0 0' }}>
                    Estes compradores estão no seu histórico da Hotmart, mas não possuem registro ativo na tabela de membros.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleCopyNotFoundEmails}
                    className="wa-btn-secondary"
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                  >
                    {copied ? '✓ Copiado!' : 'Copiar E-mails'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadNotFoundCsv}
                    className="wa-btn-secondary"
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                  >
                    Baixar Lista (.CSV)
                  </button>
                </div>
              </div>

              {/* Filtro de busca na tabela */}
              <input
                type="text"
                placeholder="Filtrar por e-mail ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                }}
              />

              <div
                style={{
                  maxHeight: '280px',
                  overflowY: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.03)' }}>
                      <th style={{ padding: '10px 14px', color: '#A1A1AA', fontWeight: 600 }}>E-mail</th>
                      <th style={{ padding: '10px 14px', color: '#A1A1AA', fontWeight: 600 }}>Nome</th>
                      <th style={{ padding: '10px 14px', color: '#A1A1AA', fontWeight: 600 }}>Telefone Normalizado</th>
                      <th style={{ padding: '10px 14px', color: '#A1A1AA', fontWeight: 600 }}>País</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotFound && filteredNotFound.length > 0 ? (
                      filteredNotFound.map((m, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          }}
                        >
                          <td style={{ padding: '10px 14px', color: '#FFFFFF' }}>{m.email}</td>
                          <td style={{ padding: '10px 14px', color: '#A1A1AA' }}>{m.name || '-'}</td>
                          <td style={{ padding: '10px 14px', color: '#25D366', fontFamily: 'monospace' }}>
                            {m.phone || '-'}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#A1A1AA' }}>{m.country || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#71717A' }}>
                          Nenhum e-mail correspondente ao filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
