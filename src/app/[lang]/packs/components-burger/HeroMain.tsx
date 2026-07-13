export function HeroMain() {
  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        aspectRatio: '2000 / 2769',
        backgroundImage: 'url(/sales-pages/burger-v01/locales/pt/backgrounds/herocover.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <svg 
        viewBox="0 0 2000 2769" 
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* LINHA 1: PACK LANÇADO EM + BADGE */}
        <g>
          <text 
            x="944" 
            y="369.5" 
            dy="4"
            fill="#FFFFFF" 
            fontFamily='"Inter", sans-serif'
            fontSize="58"
            fontWeight="400"
            textAnchor="end"
            dominantBaseline="middle"
          >
            PACK
          </text>

          <rect 
            x="980" 
            y="321.5" 
            width="240" 
            height="96" 
            rx="48" 
            fill="#FFFFFF" 
          />

          <text 
            x="1100" 
            y="369.5" 
            dy="4"
            fill="#000000" 
            fontFamily='"Inter", sans-serif'
            fontSize="58"
            fontWeight="400"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            Vol.01
          </text>
        </g>

        {/* LINHA 2: SUBTÍTULO */}
        <text 
          x="1000" 
          y="597" 
          fill="rgba(255, 255, 255, 0.5)" 
          fontFamily='"Inter", sans-serif'
          fontSize="86"
          fontWeight="400"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          PACK DE ARTES EDITÁVEIS PARA
        </text>

        {/* LINHA 3: TÍTULO PRINCIPAL */}
        <text 
          x="1000" 
          y="789" 
          fill="#FFFFFF" 
          fontFamily='"Inter", sans-serif'
          fontSize="186"
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          HAMBURGUERIA
        </text>

        {/* LINHA 4: IMAGEM PRINCIPAL (260px de gap do título) */}
        <image 
          href="/sales-pages/burger-v01/locales/pt/mockups/heroimg.webp" 
          x="0" 
          y="1142" 
          width="2000" 
          height="788" 
          preserveAspectRatio="xMidYMid meet"
        />

        {/* LINHA 5: APPS DE EDIÇÃO (260px de gap da imagem) */}
        <g>
          {/* GRUPO CANVA (Esquerda) */}
          <text 
            x="585" 
            y="2315" 
            fill="rgba(255, 255, 255, 0.5)" 
            fontFamily='"Inter", sans-serif'
            fontSize="64"
            fontWeight="400"
            textAnchor="end"
            dominantBaseline="middle"
          >
            <tspan x="585" dy="-38">Editável</tspan>
            <tspan x="585" dy="76">no Canva</tspan>
          </text>
          
          <image 
            href="/sales-pages/provider-v03/shared/canva.webp" 
            x="625" 
            y="2190" 
            width="250" 
            height="250" 
            preserveAspectRatio="xMidYMid meet"
          />

          {/* GRUPO PHOTOSHOP (Direita) */}
          <image 
            href="/sales-pages/provider-v03/shared/photoshop.webp" 
            x="985" 
            y="2190" 
            width="250" 
            height="250" 
            preserveAspectRatio="xMidYMid meet"
          />

          <text 
            x="1275" 
            y="2315" 
            fill="rgba(255, 255, 255, 0.5)" 
            fontFamily='"Inter", sans-serif'
            fontSize="64"
            fontWeight="400"
            textAnchor="start"
            dominantBaseline="middle"
          >
            <tspan x="1275" dy="-38">Editável</tspan>
            <tspan x="1275" dy="76">no Photoshop</tspan>
          </text>
        </g>
      </svg>
    </div>
  )
}
