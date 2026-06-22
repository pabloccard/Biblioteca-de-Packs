export function SectionGuarantee() {
  return (
    <div 
      style={{ 
        width: '100%', 
        backgroundColor: '#F8F8F8', // Fundo claro idêntico ao Personalize/Feedbacks
        overflow: 'hidden', 
        position: 'relative'
      }}
    >
      <svg 
        viewBox="0 0 2000 2995" 
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(0, 74)">
          {/* IMAGEM DE FUNDO DA GARANTIA (Retângulo Preto com Selo) */}
        {/* Imagem redimensionada para 1575x2335 conforme especificação e centralizada no eixo X */}
        <image 
          href="/sales-pages/provider-v03/locales/es/backgrounds/garantiabg.webp" 
          x="212.5" 
          y="256" 
          width="1575" 
          height="2335" 
          preserveAspectRatio="xMidYMid meet"
        />

        {/* TÍTULO PRINCIPAL (Mesmo padrão visual SemiBold 158 Branco) */}
        {/* Deslocado para baixo para ficar perfeitamente no centro da nova altura disponível do retângulo */}
        <text 
          x="1000" y="1170" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
          textAnchor="middle" dominantBaseline="middle"
        >
          7 DÍAS DE
        </text>
        <text 
          x="1000" y="1370" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
          textAnchor="middle" dominantBaseline="middle"
        >
          GARANTÍA
        </text>

        {/* TEXTO DE APOIO (Inter 95 Regular, Branco 50% opacidade) */}
        {/* Com gap exato de 188px do título */}
        <g 
          fill="rgba(255, 255, 255, 0.5)" 
          fontFamily='"Inter", sans-serif' fontSize="95" fontWeight="400" 
          textAnchor="middle" dominantBaseline="middle"
        >
          <text x="1000" y="1670">Si dentro del plazo de</text>
          <text x="1000" y="1800">7 días no estás</text>
          <text x="1000" y="1930">satisfecho con el</text>
          <text x="1000" y="2060">pack, basta con pedir el</text>
          <text x="1000" y="2190">reembolso.</text>
        </g>
        </g>
      </svg>
    </div>
  )
}
