export function HeroTopBar() {
  return (
    <div 
      style={{
        width: '100%',
        backgroundColor: '#070707',
        overflow: 'hidden'
      }}
    >
      <svg 
        viewBox="0 0 2000 206" 
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <text 
          x="1000" 
          y="108" /* Ajuste fino do centro vertical */
          fill="rgba(255, 255, 255, 0.5)" 
          fontFamily='"Inter", sans-serif'
          fontSize="47"
          fontWeight="400"
          letterSpacing="0.09em"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          USE O CUPOM <tspan fill="#00FF6F" fontWeight="600">“NOVOPACK”</tspan> E GARANTA O SEU DESCONTO
        </text>
      </svg>
    </div>
  )
}
