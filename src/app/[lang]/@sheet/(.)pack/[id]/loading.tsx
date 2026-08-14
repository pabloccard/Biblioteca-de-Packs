'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoadingSheet() {
  const router = useRouter()
  useEffect(() => { sessionStorage.setItem('sheetAnimated', 'true') }, [])

  return (
    <>
    <div className="sheet-backdrop" onClick={() => router.back()} />
    <div className="sheet-wrapper" onClick={() => router.back()}>
      <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        
        <div className="sheet-content">
          
          {/* Header Block */}
          <div className="content-block header-block">
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 2s infinite' }}></div>
            <div className="header-info">
              <div style={{ height: '20px', width: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 2s infinite' }}></div>
              <div style={{ height: '12px', width: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
            </div>
            {/* Close button inside header block */}
            <button onClick={() => router.back()} className="header-close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tabs Block */}
          <div className="content-block tabs-block">
            <div className="tab-btn active" style={{ opacity: 0.5 }}><div style={{ height: '14px', width: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', margin: '0 auto', animation: 'pulse 2s infinite' }}></div></div>
            <div className="tab-btn" style={{ opacity: 0.5 }}><div style={{ height: '14px', width: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', margin: '0 auto', animation: 'pulse 2s infinite' }}></div></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <div className="spinner"></div>
          </div>

        </div>
      </div>
    </div>
    </>
  )
}
