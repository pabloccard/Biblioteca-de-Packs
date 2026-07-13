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
        viewBox="0 0 2000 3965" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* CHAPÉU */}
        <text 
          x="1000" y="337" 
          fill="rgba(255, 255, 255, 0.5)" fontFamily='"Inter", sans-serif' fontSize="74" fontWeight="400"
          textAnchor="middle" dominantBaseline="middle"
        >
          O QUE VOCÊ RECEBE
        </text>

        {/* TÍTULO PRINCIPAL */}
        <text 
          x="1000" y="509" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600"
          textAnchor="middle" dominantBaseline="middle"
        >
          CONFIRA O QUE
        </text>
        <text 
          x="1000" y="700" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600"
          textAnchor="middle" dominantBaseline="middle"
        >
          VOCÊ VAI RECEBER
        </text>

        {/* CARROSSEL INFINITO */}
        <foreignObject x="0" y="1039" width="2000" height="1980">
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
                      width: '506.6px', 
                      height: '633.3px', 
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
          <text x="500" y="3378" fill="#00FF6F" fontFamily='"Montserrat", sans-serif' fontSize="198" fontWeight="500" textAnchor="middle" dominantBaseline="middle">40</text>
          <text x="500" y="3566" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">ARTES</text>
          <text x="500" y="3626" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">EDITÁVEIS</text>
          <rect x="750" y="3347" width="1" height="236" fill="#FFFFFF" />

          <text x="1000" y="3378" fill="#00FF6F" fontFamily='"Montserrat", sans-serif' fontSize="198" fontWeight="500" textAnchor="middle" dominantBaseline="middle">40</text>
          <text x="1000" y="3566" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">LEGENDAS</text>
          <text x="1000" y="3626" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">PRONTAS</text>
          <rect x="1250" y="3347" width="1" height="236" fill="#FFFFFF" />

          <text x="1500" y="3378" fill="#00FF6F" fontFamily='"Montserrat", sans-serif' fontSize="198" fontWeight="500" textAnchor="middle" dominantBaseline="middle">01</text>
          <text x="1500" y="3566" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">VÍDEO</text>
          <text x="1500" y="3626" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">TUTORIAL</text>
        </g>
      </svg>
    </div>
  )
}
