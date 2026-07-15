export function SectionRecebeMais() {
  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        paddingBottom: '195.5%',
        backgroundColor: '#000'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'url(/sales-pages/burger-v01/locales/pt/backgrounds/recebemais.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }} />

      <svg 
        viewBox="0 0 2000 4656" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* CHAPÉU */}
        <text 
          x="1000" y="337" 
          fill="rgba(255, 255, 255, 0.5)" fontFamily='"Inter", sans-serif' fontSize="74" fontWeight="400"
          textAnchor="middle" dominantBaseline="middle"
        >
          UM PACK COMPLETO
        </text>

        {/* TÍTULO PRINCIPAL */}
        <text 
          x="1000" y="509" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600"
          textAnchor="middle" dominantBaseline="middle"
        >
          TUDO PRONTO
        </text>
        <text 
          x="1000" y="700" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600"
          textAnchor="middle" dominantBaseline="middle"
        >
          PARA VOCÊ EDITAR
        </text>
        <text 
          x="1000" y="891" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600"
          textAnchor="middle" dominantBaseline="middle"
        >
          E POSTAR
        </text>

        {/* CARROSSEL INFINITO */}
        <foreignObject x="0" y="1230" width="2000" height="2480">
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <style>{`
              @keyframes marqueeRowBurger {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            {[
              { speed: '180s', dir: 'reverse', seq: Array.from({length: 40}, (_, i) => i + 1) },
              { speed: '180s', dir: 'normal', seq: Array.from({length: 40}, (_, i) => 40 - i) },
              { speed: '180s', dir: 'reverse', seq: [...Array.from({length: 20}, (_, i) => i + 21), ...Array.from({length: 20}, (_, i) => i + 1)] }
            ].map((row, rowIdx) => (
              <div 
                key={rowIdx}
                style={{ 
                  display: 'flex', 
                  width: 'max-content', 
                  animation: `marqueeRowBurger ${row.speed} linear infinite ${row.dir}` 
                }}
              >
                {[...row.seq, ...row.seq].map((num, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      width: '640px', 
                      height: '800px', 
                      marginRight: '40px', 
                      flexShrink: 0,
                      borderRadius: '40px',
                      overflow: 'hidden',
                      backgroundColor: '#111'
                    }}
                  >
                    <img 
                      src={`/sales-pages/burger-v01/locales/pt/cards/all/${num}.webp`}
                      alt={`Arte ${num}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </foreignObject>

        {/* INFORMAÇÕES DE RODAPÉ */}
        <g>
          <text 
            x="1000" 
            y="4050" 
            fill="rgba(255, 255, 255, 0.7)" 
            fontFamily='"Inter", sans-serif'
            fontSize="80"
            fontWeight="300"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            <tspan x="1000" dy="0">Além de 40 artes profissionais, você recebe</tspan>
            <tspan x="1000" dy="110">legendas prontas e um vídeo tutorial com o</tspan>
            <tspan x="1000" dy="110">passo a passo para editar suas artes.</tspan>
          </text>
        </g>
      </svg>
    </div>
  )
}
