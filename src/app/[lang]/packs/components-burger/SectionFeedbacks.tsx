export function SectionFeedbacks() {
  const feedbacks = Array.from({ length: 6 }, (_, i) => `/sales-pages/burger-v01/locales/pt/feedbacks/${i + 1}.webp`)

  return (
    <div 
      style={{ 
        width: '100%', 
        backgroundColor: '#F8F8F8', 
        overflow: 'hidden', 
        paddingBottom: 'min(10vw, 60px)'
      }}
    >
      <div style={{ width: '100%', position: 'relative', aspectRatio: '2000 / 967' }}>
        <svg 
          viewBox="0 0 2000 967" 
          style={{ width: '100%', height: 'auto', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* CHAPÉU */}
          <text 
            x="1000" y="337" 
            fill="rgba(0, 0, 0, 0.5)" 
            fontFamily='"Inter", sans-serif' fontSize="74" fontWeight="400" 
            textAnchor="middle" dominantBaseline="middle"
          >
            FEEDBACKS
          </text>

          {/* TÍTULO PRINCIPAL */}
          <text 
            fill="#0F0F0F" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            <tspan x="1000" y="509">QUEM COMPROU,</tspan>
            <tspan x="1000" y="700">APROVOU</tspan>
          </text>
        </svg>
      </div>

      {/* CARROSSEL HTML */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div 
          style={{ 
            display: 'flex', 
            width: 'max-content',
            animation: 'marqueeBurgerFb 40s linear infinite',
            alignItems: 'flex-start'
          }}
        >
          {[...feedbacks, ...feedbacks].map((src, i) => (
            <div 
              key={i} 
              style={{ 
                width: '250px',
                marginLeft: '24px',
                flexShrink: 0,
                backgroundColor: '#111111',
                padding: '24px',
                borderRadius: '32px'
              }}
            >
              <img 
                src={src} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block', 
                  borderRadius: '8px'
                }} 
                alt={`Feedback ${i}`} 
              />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marqueeBurgerFb {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
