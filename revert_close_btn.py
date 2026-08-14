import re

css_path = 'src/app/styles/pack-detail.css'
tsx_path = 'src/app/[lang]/pack/[id]/PackContent.tsx'
loading_path = 'src/app/[lang]/@sheet/(.)pack/[id]/loading.tsx'

# --- TSX Changes ---
tsx_content = open(tsx_path).read()
old_top_controls = '''          <div className="sheet-top-controls">
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

new_header_block = '''          {/* Header Block */}
          <div className="content-block header-block">
            {cardImage && <img src={cardImage} alt={pack.name} />}
            <div className="header-info">
              <h1>{pack.name}</h1>
              <span>{pack.version || 'volume 01'}</span>
            </div>
            <button onClick={() => router.back()} className="header-close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>'''

tsx_content = tsx_content.replace(old_top_controls, new_header_block)
open(tsx_path, 'w').write(tsx_content)

# --- Loading TSX Changes ---
loading_content = open(loading_path).read()
old_loading_top_controls = '''          <div className="sheet-top-controls">
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

new_loading_header_block = '''          {/* Header Block */}
          <div className="content-block header-block">
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 2s infinite' }}></div>
            <div className="header-info">
              <div style={{ height: '20px', width: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 2s infinite' }}></div>
              <div style={{ height: '12px', width: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
            </div>
            <button onClick={() => router.back()} className="header-close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>'''

loading_content = loading_content.replace(old_loading_top_controls, new_loading_header_block)
open(loading_path, 'w').write(loading_content)


# --- CSS Changes ---
css_content = open(css_path).read()

# Remove .sheet-top-controls and .sheet-close-top
css_content = re.sub(r'\.sheet-top-controls \{[^}]*\}', '', css_content, flags=re.DOTALL)
css_content = re.sub(r'\.sheet-close-top \{[^}]*\}', '', css_content, flags=re.DOTALL)
css_content = re.sub(r'\.sheet-close-top:hover \{[^}]*\}', '', css_content, flags=re.DOTALL)

# Insert .header-close after .header-info span
header_info_span = '''.header-info span {
  font-size: 0.85rem;
  color: #888;
}'''

header_close_css = '''

.header-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1D1D1F;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}

.header-close:hover {
  background: #2D2D2F;
  color: #fff;
}'''

css_content = css_content.replace(header_info_span, header_info_span + header_close_css)

open(css_path, 'w').write(css_content)

print("Reverted close button structure to flex flow")
