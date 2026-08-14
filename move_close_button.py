import os
import re

css_path = 'src/app/styles/pack-detail.css'
tsx_path = 'src/app/[lang]/pack/[id]/PackContent.tsx'
loading_path = 'src/app/[lang]/@sheet/(.)pack/[id]/loading.tsx'

# --- TSX Changes ---
old_header_block = '''          {/* Header Block */}
          <div className="content-block header-block">
            {cardImage && <img src={cardImage} alt={pack.name} />}
            <div className="header-info">
              <h1>{pack.name}</h1>
              <span>{pack.version || 'volume 01'}</span>
            </div>
            {/* Close button inside header block */}
            <button onClick={() => router.back()} className="header-close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>'''

new_header_block = '''          <div className="sheet-top-controls">
            <button onClick={() => router.back()} className="sheet-close-top" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Header Block */}
          <div className="content-block header-block">
            {cardImage && <img src={cardImage} alt={pack.name} />}
            <div className="header-info">
              <h1>{pack.name}</h1>
              <span>{pack.version || 'volume 01'}</span>
            </div>
          </div>'''

tsx_content = open(tsx_path).read()
tsx_content = tsx_content.replace(old_header_block, new_header_block)
open(tsx_path, 'w').write(tsx_content)

# --- Loading TSX Changes ---
old_loading_header = '''          {/* Header Block */}
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
          </div>'''

new_loading_header = '''          <div className="sheet-top-controls">
            <button onClick={() => router.back()} className="sheet-close-top" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Header Block */}
          <div className="content-block header-block">
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 2s infinite' }}></div>
            <div className="header-info">
              <div style={{ height: '20px', width: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 2s infinite' }}></div>
              <div style={{ height: '12px', width: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
            </div>
          </div>'''

loading_content = open(loading_path).read()
loading_content = loading_content.replace(old_loading_header, new_loading_header)
open(loading_path, 'w').write(loading_content)

# --- CSS Changes ---
css_content = open(css_path).read()

# Remove .header-close
css_content = re.sub(r'\.header-close \{[^}]*\}', '', css_content, flags=re.DOTALL)

# Add .sheet-top-controls and mobile query
new_css_classes = '''
.sheet-top-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.sheet-close-top {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #111111;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.sheet-close-top:hover {
  background: #1D1D1F;
  color: #fff;
}

@media (max-width: 768px) {
  .sheet-card {
    height: 100dvh;
    max-width: 100%;
    border-radius: 0;
  }
  
  /* Need to remove animation margin-bottom so it fills correctly */
  /* SlideUp animation is applied to sheet-card */
}
'''
css_content += new_css_classes
open(css_path, 'w').write(css_content)

print("Updated structure and CSS")
