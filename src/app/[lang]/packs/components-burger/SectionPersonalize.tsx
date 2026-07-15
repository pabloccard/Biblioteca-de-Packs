export function SectionPersonalize() {
  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        backgroundColor: '#F8F8F8'
      }}
    >
      <svg 
        viewBox="0 0 2000 2467" 
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* CHAPÉU */}
        <text 
          x="1000" 
          y="337" 
          fill="rgba(0, 0, 0, 0.5)"
          fontFamily='"Inter", sans-serif'
          fontSize="74"
          fontWeight="400"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ARTES 100% EDITÁVEIS
        </text>

        {/* TÍTULO PRINCIPAL */}
        <text 
          fill="#0F0F0F" 
          fontFamily='"Inter", sans-serif'
          fontSize="158"
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <tspan x="1000" y="509">EDITE NO CANVA</tspan>
          <tspan x="1000" y="700">OU PHOTOSHOP</tspan>
        </text>

        {/* IMAGEM (Gap de ~120px do título) */}
        <image 
          href="/sales-pages/burger-v01/locales/pt/mockups/personalize.webp" 
          x="290" 
          y="900" 
          width="1420" 
          height="737.71" 
          preserveAspectRatio="xMidYMid meet"
        />

        {/* TEXTO DE APOIO (Gap de ~120px da imagem) */}
        <text 
          fill="#0F0F0F" 
          fontFamily='"Inter", sans-serif'
          fontSize="80"
          fontWeight="300"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <tspan x="1000" y="1800">Deixe sua marca com aparência</tspan>
          <tspan x="1000" y="1910">profissional e o impacto visual das</tspan>
          <tspan x="1000" y="2020">grandes redes de fast-food, usando</tspan>
          <tspan x="1000" y="2130">artes prontas e fáceis de editar.</tspan>
        </text>
      </svg>
    </div>
  )
}
