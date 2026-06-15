export function SectionSupport() {
  return (
    <div 
      style={{ 
        width: '100%', 
        backgroundColor: '#F8F8F8', // Mantendo o fundo contínuo
        overflow: 'hidden', 
        position: 'relative'
      }}
    >
      <svg 
        viewBox="0 0 2000 2665" 
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Deslocamos -256px no eixo Y para zerar o padding superior do SVG (256 - 256 = 0) */}
        <g transform="translate(0, -256)">
          {/* IMAGEM DE FUNDO DO SUPORTE (Retângulo Preto com Ícone do WhatsApp) */}
        {/* Imagem nas mesmas dimensões de 1575x2335 */}
        <image 
          href="/sales-pages/provider-v03/locales/pt/backgrounds/suportebg.webp" 
          x="212.5" 
          y="256" 
          width="1575" 
          height="2335" 
          preserveAspectRatio="xMidYMid meet"
        />

        {/* TÍTULO PRINCIPAL */}
        <text 
          x="1000" y="1080" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
          textAnchor="middle" dominantBaseline="middle"
        >
          SUPORTE
        </text>
        <text 
          x="1000" y="1280" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
          textAnchor="middle" dominantBaseline="middle"
        >
          EXCLUSIVO NO
        </text>
        <text 
          x="1000" y="1480" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
          textAnchor="middle" dominantBaseline="middle"
        >
          WHATSAPP
        </text>

        {/* TEXTO DE APOIO (Com gap cravado de 188px em relação ao título) */}
        <g 
          fill="rgba(255, 255, 255, 0.5)" 
          fontFamily='"Inter", sans-serif' fontSize="95" fontWeight="400" 
          textAnchor="middle" dominantBaseline="middle"
        >
          <text x="1000" y="1780">Após a compra, você conta</text>
          <text x="1000" y="1910">com suporte exclusivo no</text>
          <text x="1000" y="2040">WhatsApp para tirar</text>
          <text x="1000" y="2170">dúvidas e usar o pack com</text>
          <text x="1000" y="2300">total tranquilidade.</text>
        </g>
        </g>
      </svg>
    </div>
  )
}
