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
        paddingBottom: '195.5%', // Mantém a estabilidade do container no iOS
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
        viewBox="0 0 2000 3965" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {Array.from({ length: 9 }).map((_, i) => (
            <clipPath key={i} id={`cardClip_${i}`}>
              <rect x="0" y="0" width={itemWidth} height={itemHeight} rx="40" />
            </clipPath>
          ))}
        </defs>

        {/* CHAPÉU PADRONIZADO (Tamanho 74) */}
        <text 
          x="1000" y="337" 
          fill="rgba(255, 255, 255, 0.5)" fontFamily='"Inter", sans-serif' fontSize="74" fontWeight="400"
          textAnchor="middle" dominantBaseline="middle"
        >
          O QUE VC RECEBE
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

        {/* GRID ANIMADO (3x3 nativo no SVG com animação CSS) */}
        <g>
          {Array.from({ length: 9 }).map((_, slotIdx) => {
            const i = slotIdx + 1 // Arte 1 a 9
            const grids = ['grid1', 'grid2', 'grid3', 'grid4']
            
            const row = Math.floor(slotIdx / 3)
            const col = slotIdx % 3
            const xPos = 200 + col * (itemWidth + gap)
            // Título termina no Y=779. Gap de 260px igual ao Hero = Grid começa no Y=1039
            const yPos = 1039 + row * (itemHeight + gap)

            return (
              <g key={slotIdx} transform={`translate(${xPos}, ${yPos})`}>
                <rect width={itemWidth} height={itemHeight} rx="40" fill="#111" />
                {grids.map((gridFolder, idx) => (
                  <image 
                    key={gridFolder}
                    href={`/sales-pages/provider-v03/locales/pt/cards/${gridFolder}/${i}.webp`}
                    width={itemWidth} 
                    height={itemHeight} 
                    preserveAspectRatio="xMidYMid slice" 
                    clipPath={`url(#cardClip_${slotIdx})`}
                    style={{ 
                      // Animação c4 restaurada para 14s. Stagger (escadinha) rápido de 0.1s.
                      animation: `c4_${idx} 14s ${slotIdx * 0.1}s infinite` 
                    }}
                  />
                ))}
              </g>
            )
          })}
        </g>

        {/* INFORMAÇÕES DE RODAPÉ (Calculado pelo topo visual da fonte 198px) */}
        {/* Grid termina em 3018.9. Topo do texto "40" deve ser em 3279 para cravar 260px de gap. O meio do texto Y=3378 */}
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
