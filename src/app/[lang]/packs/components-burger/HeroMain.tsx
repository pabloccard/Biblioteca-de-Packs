export function HeroMain() {
  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        aspectRatio: '2000 / 2994',
        backgroundImage: 'url(/sales-pages/burger-v01/locales/pt/backgrounds/herocover.webp)',
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
        {/* TÍTULOS (Subtítulo + Principal) */}
        <g>
          {/* LINHA 1 e 2: SUBTÍTULO */}
          <text 
            x="1000" 
            y="556" 
            fill="rgba(255, 255, 255, 0.5)" 
            fontFamily='"Inter", sans-serif'
            fontSize="129"
            fontWeight="400"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            <tspan x="1000" dy="0">TRANSFORME AS</tspan>
            <tspan x="1000" dy="169">REDES SOCIAIS DA SUA</tspan>
          </text>

          {/* LINHA 3: TÍTULO PRINCIPAL */}
          <text 
            x="1000" 
            y="922" 
            fill="#FFFFFF" 
            fontFamily='"Inter", sans-serif'
            fontSize="186"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            HAMBURGUERIA
          </text>
        </g>

        {/* LINHA 4: IMAGEM PRINCIPAL (260px de gap do título) */}
        <image 
          href="/sales-pages/burger-v01/locales/pt/mockups/heroimg.webp" 
          x="0" 
          y="1142" 
          width="2000" 
          height="788" 
          preserveAspectRatio="xMidYMid meet"
        />

        {/* LINHA 5: SUBTEXTO (260px de gap da imagem) */}
        <g>
          <text 
            x="1000" 
            y="2150" 
            fill="rgba(255, 255, 255, 0.7)" 
            fontFamily='"Inter", sans-serif'
            fontSize="80"
            fontWeight="300"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            <tspan x="1000" dy="0">Deixe sua marca com aparência</tspan>
            <tspan x="1000" dy="110">profissional e o impacto visual das</tspan>
            <tspan x="1000" dy="110">grandes redes de fast-food, usando</tspan>
            <tspan x="1000" dy="110">artes prontas e fáceis de editar.</tspan>
          </text>
        </g>
      </svg>
    </div>
  )
}
