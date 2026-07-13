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
        viewBox="0 0 2000 2593" 
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
          <tspan x="1000" y="509">PERSONALIZE</tspan>
          <tspan x="1000" y="700">COM SUAS CORES</tspan>
        </text>

        {/* IMAGEM */}
        <image 
          href="/sales-pages/burger-v01/locales/pt/mockups/personalize.webp" 
          x="290" 
          y="967" 
          width="1420" 
          height="737.71" 
          preserveAspectRatio="xMidYMid meet"
        />

        {/* TEXTO DE APOIO */}
        <text 
          fill="#0F0F0F" 
          fontFamily='"Inter", sans-serif'
          fontSize="75"
          fontWeight="300"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <tspan x="1000" y="1943">Não importa a cor que sua empresa</tspan>
          <tspan x="1000" y="2043">usa, com poucos clicks você deixa</tspan>
          <tspan x="1000" y="2143">qualquer arte com a cara da sua</tspan>
          <tspan x="1000" y="2243">empresa!</tspan>
        </text>
      </svg>
    </div>
  )
}
