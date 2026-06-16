export function HeroMain() {
  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        aspectRatio: '2000 / 2994',
        backgroundImage: 'url(/sales-pages/provider-v03/locales/pt/backgrounds/herocover.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <svg 
        viewBox="0 0 2000 2994" 
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
            Vol.03
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

        {/* LINHA 3: TÍTULO PRINCIPAL (Separado em 2 textos para evitar bug de baseline do tspan) */}
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
          PROVEDOR DE
        </text>
        <text 
          x="1000" 
          y="1014" 
          fill="#FFFFFF" 
          fontFamily='"Inter", sans-serif'
          fontSize="186"
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          INTERNET
        </text>

        {/* LINHA 4: IMAGEM PRINCIPAL */}
        <image 
          href="/sales-pages/provider-v03/locales/pt/mockups/heroimg.webp" 
          x="0" 
          y="1367" 
          width="2000" 
          height="788" 
          preserveAspectRatio="xMidYMid meet"
        />

        {/* LINHA 5: APPS DE EDIÇÃO (Bloco todo movido -70px em X para compensar a palavra Photoshop ser mais longa que Canva) */}
        <g>
          {/* GRUPO CANVA (Esquerda) */}
          <text 
            x="585" 
            y="2540" 
            fill="rgba(255, 255, 255, 0.5)" 
            fontFamily='"Inter", sans-serif'
            fontSize="64"
            fontWeight="400"
            textAnchor="end"
            dominantBaseline="middle"
          >
            <tspan x="585" dy="-38">Editável</tspan>
            <tspan x="585" dy="76">no Canva</tspan>
            {/* Imagem Canva */}
            <image 
              href="/sales-pages/provider-v03/shared/canva.webp" 
              x="250" y="1520" 
              width="60" height="60" 
              preserveAspectRatio="xMidYMid meet"
            />
            {/* Imagem Photoshop */}
            <image 
              href="/sales-pages/provider-v03/shared/photoshop.webp" 
              x="330" y="1520" 
              width="60" height="60" 
              preserveAspectRatio="xMidYMid meet"
            />
          </text>
          
          <image 
            href="/sales-pages/provider-v03/shared/canva.webp" 
            x="625" 
            y="2415" 
            width="250" 
            height="250" 
            preserveAspectRatio="xMidYMid meet"
          />

          {/* GRUPO PHOTOSHOP (Direita) */}
          <image 
            href="/sales-pages/provider-v03/shared/photoshop.webp" 
            x="985" 
            y="2415" 
            width="250" 
            height="250" 
            preserveAspectRatio="xMidYMid meet"
          />

          <text 
            x="1275" 
            y="2540" 
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
