export function SectionGuarantee() {
  return (
    <div 
      style={{ 
        width: '100%', 
        backgroundColor: '#F8F8F8',
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
          <image 
            href="/sales-pages/burger-v01/locales/pt/backgrounds/garantiabg.webp" 
            x="212.5" 
            y="256" 
            width="1575" 
            height="2335" 
            preserveAspectRatio="xMidYMid meet"
          />

          <text 
            x="1000" y="1170" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            7 DIAS DE
          </text>
          <text 
            x="1000" y="1370" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            GARANTIA
          </text>

          <g 
            fill="rgba(255, 255, 255, 0.5)" 
            fontFamily='"Inter", sans-serif' fontSize="95" fontWeight="400" 
            textAnchor="middle" dominantBaseline="middle"
          >
            <text x="1000" y="1670">Se dentro do prazo de</text>
            <text x="1000" y="1800">7 dias você não se</text>
            <text x="1000" y="1930">sentir satisfeito com o</text>
            <text x="1000" y="2060">pack, basta solicitar o</text>
            <text x="1000" y="2190">reembolso.</text>
          </g>
        </g>
      </svg>
    </div>
  )
}
