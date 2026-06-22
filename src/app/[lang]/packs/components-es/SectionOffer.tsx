export function SectionOffer() {
  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        backgroundColor: '#000',
        paddingBottom: '184.5%' // 3690 / 2000 = 184.5%
      }}
    >
      {/* Imagem de Fundo (Aguardando offerbg.webp) */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'url(/sales-pages/provider-v03/locales/es/backgrounds/offerbg.webp)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <svg 
        viewBox="0 0 2000 3690" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* BLOCO 1: TÍTULO PADRONIZADO */}
        <g>
          <text 
            x="1000" y="479" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            <tspan fill="#00FF6F">DESCUENTO DE</tspan>
          </text>
          <text 
            x="1000" y="670" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            LANZAMIENTO
          </text>
        </g>

        {/* CONTEÚDO INFERIOR (ESPAÇAMENTO RESTAURADO PARA DESENCOSTAR DO TÍTULO) */}
        <g>
        {/* BLOCO 3: LISTA DE BENEFÍCIOS (MOVIDO PARA CIMA) */}
        <g transform="translate(0, -1213)">
          {[
            { y: 2148, text: "40 plantillas profesionales" },
            { y: 2290, text: "Textos listos para publicar" },
            { y: 2432, text: "Canva y Photoshop" },
            { y: 2574, text: "Alta resolución", sub: " 2160x2700" },
            { y: 2716, text: "Videoclase que enseña", line2: "cómo editar" },
            { y: 2958, text: "Soporte vía WhatsApp" },
            { y: 3100, text: "Acceso inmediato" },
            { y: 3242, text: "7 días de garantía" }
          ].map((item, i) => (
            <g key={i}>
              <g transform={`translate(550, ${item.y - 46})`}>
                <circle cx="46" cy="46" r="46" fill="#0084FF" />
                <path d="M28 46 L40 58 L64 34" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
              <text 
                x="692" y={item.y} 
                fill="rgba(255, 255, 255, 0.7)" fontFamily='"Montserrat", sans-serif' fontSize="80" fontWeight="400" 
                dominantBaseline="middle"
              >
                {item.text}
                {item.sub && <tspan fontSize="50">{item.sub}</tspan>}
              </text>
              {item.line2 && (
                <text 
                  x="692" y={item.y + 100} 
                  fill="rgba(255, 255, 255, 0.7)" fontFamily='"Montserrat", sans-serif' fontSize="80" fontWeight="400" 
                  dominantBaseline="middle"
                >
                  {item.line2}
                </text>
              )}
            </g>
          ))}
        </g>

        {/* BLOCO 2: PREÇO (MOVIDO PARA BAIXO) */}
        <g transform="translate(0, 1026)">
          {/* Tarja */}
          <rect x="408" y="1189" width="1184" height="127" fill="rgba(255, 255, 255, 0.08)" />
          <text 
            x="1000" y="1252.5" 
            dy="6"
            textAnchor="middle" dominantBaseline="middle" 
            fill="rgba(255, 255, 255, 0.7)" fontFamily='"Inter", sans-serif' fontSize="80" fontWeight="400"
          >
            <tspan>DE </tspan>
            <tspan fontFamily='"Sora", sans-serif'>US$ </tspan>
            <tspan textDecoration="line-through">15.98</tspan>
            <tspan> A</tspan>
          </text>

          {/* Valor Principal Verde */}
          <text 
            x="1040" y="1686" 
            textAnchor="middle" dominantBaseline="alphabetic" 
            fill="#00FF6F"
          >
            <tspan fontFamily='"Sora", sans-serif' fontSize="90" dy="-110">US$</tspan>
            <tspan fontFamily='"Inter", sans-serif' fontWeight="500" fontSize="400" dx="57" dy="110">7</tspan>
            <tspan fontFamily='"Inter", sans-serif' fontWeight="500" fontSize="280" dx="0" dy="-84">.99</tspan>
          </text>

          {/* Pagamento Único ajustado e perfeitamente centralizado usando letterSpacing compensado no Eixo X */}
          <text 
            x="1000" y="1806" 
            dx="9"
            fill="rgba(255, 255, 255, 0.7)" fontFamily='"Montserrat", sans-serif' fontSize="80" fontWeight="400"
            textAnchor="middle" dominantBaseline="middle"
            style={{ letterSpacing: '18px' }}
          >
            PAGO ÚNICO
          </text>
        </g>

        {/* BLOCO 4: BOTÃO */}
        <g transform="translate(0, -532)">
          <style>{`
            @keyframes pulse-offer {
              0% { transform: scale(1); }
              50% { transform: scale(1.03); }
              100% { transform: scale(1); }
            }
            .btn-offer {
              animation: pulse-offer 2s infinite ease-in-out;
              /* Origem no centro exato do botão: X=1000, Y=3544+(278/2)=3683 */
              transform-origin: 1000px 3683px; 
            }
          `}</style>
          {/* Glow sutil atrás do botão (mantido em SVG) */}
          <rect x="357.5" y="3544" width="1285" height="278" rx="40" fill="#00FF6F" style={{ filter: 'blur(45px)', opacity: 0.4 }} className="btn-offer" />
          
          {/* Botão de Compra em HTML NATIVO para compatibilidade perfeita com o GTM */}
          <foreignObject x="357.5" y="3544" width="1285" height="278" className="btn-offer">
            <a 
              href="https://pay.hotmart.com/D106444490F?off=8ko1fn7a&checkoutMode=10&offDiscount=NUEVOPACK" 
              id="btn-checkout-offer" 
              className="checkout-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                backgroundColor: '#00FF6F',
                borderRadius: '40px',
                color: '#002E14',
                fontFamily: '"Inter", sans-serif',
                fontSize: '75px',
                fontWeight: '700',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              OBTENER DESCUENTO
            </a>
          </foreignObject>
        </g>
        </g>
      </svg>
    </div>
  )
}
