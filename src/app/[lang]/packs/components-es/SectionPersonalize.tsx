export function SectionPersonalize() {
  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        backgroundColor: '#F8F8F8' // Cor de fundo especificada
      }}
    >
      <svg 
        viewBox="0 0 2000 2593" 
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* CHAPÉU (Gap de 56px pro título embutido na matemática) */}
        <text 
          x="1000" 
          y="337" 
          fill="rgba(0, 0, 0, 0.5)" // Preto 50%
          fontFamily='"Inter", sans-serif'
          fontSize="74"
          fontWeight="400"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          PLANTILLAS 100% EDITABLES
        </text>

        {/* TÍTULO PRINCIPAL (Line-height calculado proporcionalmente ~191px) */}
        <text 
          fill="#0F0F0F" 
          fontFamily='"Inter", sans-serif'
          fontSize="158"
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <tspan x="1000" y="509">PERSONALIZA</tspan>
          <tspan x="1000" y="700">CON TUS COLORES</tspan>
        </text>

        {/* IMAGEM (1420 x 737.71) - Centralizada em X: (2000-1420)/2 = 290 */}
        <image 
          href="/sales-pages/provider-v03/locales/es/mockups/personalize.webp" 
          x="290" 
          y="967" 
          width="1420" 
          height="737.71" 
          preserveAspectRatio="xMidYMid meet"
        />

        {/* TEXTO DE APOIO (Inter Light 75, Line-height ~100px) */}
        <text 
          fill="#0F0F0F" 
          fontFamily='"Inter", sans-serif'
          fontSize="75"
          fontWeight="300" // Light
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <tspan x="1000" y="1943">No importa el color que tu empresa</tspan>
          <tspan x="1000" y="2043">use, con pocos clics dejas</tspan>
          <tspan x="1000" y="2143">cualquier plantilla con la identidad de tu</tspan>
          <tspan x="1000" y="2243">empresa!</tspan>
        </text>
      </svg>
    </div>
  )
}
