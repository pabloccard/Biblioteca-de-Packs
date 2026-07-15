export function SectionRecebeMais() {
  const displayTime = 3.5
  const stagger = 0.2

  const itemWidth = 506.6
  const itemHeight = 633.3
  const gap = 40

  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        paddingBottom: '223.25%', // Mantém a estabilidade do container no iOS
        backgroundColor: '#000'
      }}
    >
      {/* MÁSCARA COM IMAGEM DE FUNDO DA SESSÃO */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'url(/sales-pages/provider-v03/locales/pt/backgrounds/recebemais.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }} />

      <svg 
        viewBox="0 0 2000 4465" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >


        {/* CHAPÉU PADRONIZADO (Tamanho 74) */}
        <text 
          x="1000" y="337" 
          fill="rgba(255, 255, 255, 0.5)" fontFamily='"Inter", sans-serif' fontSize="74" fontWeight="400"
          textAnchor="middle" dominantBaseline="middle"
        >
          O QUE VOCÊ RECEBE
        </text>

        {/* TÍTULO PRINCIPAL PADRONIZADO (Tamanho 158) */}
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

        {/* CARROSSEL INFINITO EM HTML NATIVO (Sobrepondo o SVG) */}
        <foreignObject x="0" y="1039" width="2000" height="2480">
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <style>{`
              @keyframes marqueeRow {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            {[
              // Array da Linha 1 (1 a 40) - Movimenta para a Direita
              { speed: '180s', dir: 'reverse', seq: Array.from({length: 40}, (_, i) => i + 1) },
              // Array da Linha 2 (40 diminuindo até 1) - Movimenta para a Esquerda
              { speed: '180s', dir: 'normal', seq: Array.from({length: 40}, (_, i) => 40 - i) },
              // Array da Linha 3 (21 a 40, depois 1 a 20) - Movimenta para a Direita
              { speed: '180s', dir: 'reverse', seq: [...Array.from({length: 20}, (_, i) => i + 21), ...Array.from({length: 20}, (_, i) => i + 1)] }
            ].map((row, rowIdx) => (
              <div 
                key={rowIdx}
                style={{ 
                  display: 'flex', 
                  width: 'max-content', 
                  animation: `marqueeRow ${row.speed} linear infinite ${row.dir}` 
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
                      src={`/sales-pages/provider-v03/locales/pt/cards/all/${num}.webp`}
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

        {/* INFORMAÇÕES DE RODAPÉ (Calculado pelo topo visual da fonte 198px) */}
        {/* Grid termina em 3519. Topo do texto "40" deve ser em 3779 para cravar 260px de gap. O meio do texto Y=3878 */}
        <g>
          <text x="500" y="3878" fill="#00FF6F" fontFamily='"Montserrat", sans-serif' fontSize="198" fontWeight="500" textAnchor="middle" dominantBaseline="middle">40</text>
          <text x="500" y="4066" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">ARTES</text>
          <text x="500" y="4126" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">EDITÁVEIS</text>
          <rect x="750" y="3847" width="1" height="236" fill="#FFFFFF" />

          <text x="1000" y="3878" fill="#00FF6F" fontFamily='"Montserrat", sans-serif' fontSize="198" fontWeight="500" textAnchor="middle" dominantBaseline="middle">40</text>
          <text x="1000" y="4066" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">LEGENDAS</text>
          <text x="1000" y="4126" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">PRONTAS</text>
          <rect x="1250" y="3847" width="1" height="236" fill="#FFFFFF" />

          <text x="1500" y="3878" fill="#00FF6F" fontFamily='"Montserrat", sans-serif' fontSize="198" fontWeight="500" textAnchor="middle" dominantBaseline="middle">01</text>
          <text x="1500" y="4066" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">VÍDEO</text>
          <text x="1500" y="4126" fill="rgba(255, 255, 255, 0.8)" fontFamily='"Inter", sans-serif' fontSize="50" fontWeight="400" textAnchor="middle" dominantBaseline="middle">TUTORIAL</text>
        </g>
      </svg>
    </div>
  )
}
