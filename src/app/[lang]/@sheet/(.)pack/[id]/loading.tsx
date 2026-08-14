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
        <div className="sheet-handle-area">
          <div className="sheet-handle" />
        </div>

        <header className="sheet-header">
          <button onClick={() => router.back()} className="sheet-close-btn" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          <div className="sheet-pack-info" style={{ opacity: 0.5, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
             <div className="sheet-pack-image" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
             <div className="sheet-pack-meta" style={{ gap: '8px' }}>
                <div style={{ height: '20px', width: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                <div style={{ height: '12px', width: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
             </div>
          </div>
        </header>

        <div className="sheet-tabs">
            <div className="sheet-tab" style={{ opacity: 0.5 }}><div style={{ height: '14px', width: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', margin: '0 auto' }}></div></div>
            <div className="sheet-tab" style={{ opacity: 0.5 }}><div style={{ height: '14px', width: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', margin: '0 auto' }}></div></div>
        </div>

        <div className="sheet-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
           <div className="spinner"></div>
        </div>
      </div>
    </div>
    </>
  )
}
