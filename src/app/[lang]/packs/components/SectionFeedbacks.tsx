export function SectionFeedbacks() {
  // Criando as 6 imagens de feedback da pasta especificada
  const feedbacks = Array.from({ length: 6 }, (_, i) => `/sales-pages/provider-v03/locales/pt/feedbacks/${i + 1}.webp`)

  return (
    <div 
      style={{ 
        width: '100%', 
        backgroundColor: '#F8F8F8', 
        overflow: 'hidden', 
        paddingBottom: 'min(10vw, 60px)' // Respiro fluido no mobile, mas travado no PC
      }}
    >
      {/* TEXTO EM SVG PARA ESCALA PERFEITA MATEMÁTICA */}
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
            <tspan x="1000" y="509">PROVEDORES QUE</tspan>
            <tspan x="1000" y="700">USAM, APROVAM</tspan>
          </text>
        </svg>
      </div>

      {/* CARROSSEL HTML (Usado HTML nativo para permitir imagens com alturas dinâmicas) */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div 
          style={{ 
            display: 'flex', 
            width: 'max-content',
            animation: 'marquee 40s linear infinite',
            alignItems: 'flex-start' // Permite alturas diferentes sem esticar
          }}
        >
          {/* Duplicamos os feedbacks para o loop infinito funcionar perfeitamente */}
          {[...feedbacks, ...feedbacks].map((src, i) => (
            <div 
              key={i} 
              style={{ 
                width: 'min(44.2vw, 350px)', // Cresce fluido no mobile, mas trava em 350px no PC
                marginLeft: 'min(3vw, 24px)', // Gap ajustado
                flexShrink: 0 
              }}
            >
              <img 
                src={src} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block', 
                  borderRadius: 'min(2vw, 16px)' // Borda não fica gigante no PC
                }} 
                alt={`Feedback ${i}`} 
              />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
