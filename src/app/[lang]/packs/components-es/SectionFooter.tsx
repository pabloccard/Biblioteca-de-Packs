export function SectionFooter() {
  return (
    <footer 
      style={{ 
        width: '100%', 
        backgroundColor: '#F8F8F8', // Fundo claro conforme solicitado
        overflow: 'hidden' 
      }}
    >
      <svg 
        viewBox="0 0 2000 900" 
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* BLOCO SUPERIOR - COPYRIGHT */}
        <g>
          <text 
            x="1000" y="350" 
            fill="#0F0F0F" fontFamily='"Inter", sans-serif' fontSize="80" fontWeight="500" 
            textAnchor="middle" dominantBaseline="middle"
          >
            © 2026 Pablo Castilho.
          </text>
          <text 
            x="1000" y="470" 
            fill="#0F0F0F" fontFamily='"Inter", sans-serif' fontSize="80" fontWeight="500" 
            textAnchor="middle" dominantBaseline="middle"
          >
            Todos los derechos reservados.
          </text>
        </g>

        {/* BLOCO INFERIOR - LINKS LEGAIS */}
        {/* Usando um único bloco textAnchor="middle" para garantir que o peso de ambas as palavras seja somado e centralizado perfeitamente no eixo vertical (1000) */}
        <g>
          <text 
            x="1000" y="700" 
            fill="rgba(15, 15, 15, 0.5)" fontFamily='"Inter", sans-serif' fontSize="45" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
            style={{ letterSpacing: '4px' }}
          >
            <a href="#" style={{ cursor: 'pointer', fill: 'rgba(15, 15, 15, 0.5)' }}>TÉRMINOS DE USO</a>
            <tspan dx="100"> </tspan>
            <a href="#" style={{ cursor: 'pointer', fill: 'rgba(15, 15, 15, 0.5)' }}>POLÍTICA DE PRIVACIDAD</a>
          </text>
        </g>
      </svg>
    </footer>
  )
}
