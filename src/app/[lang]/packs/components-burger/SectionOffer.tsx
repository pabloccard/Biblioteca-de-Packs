export function SectionOffer() {
  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        backgroundColor: '#000',
        paddingBottom: '195.55%'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'url(/sales-pages/burger-v01/locales/pt/backgrounds/offerbg.webp)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <svg 
        viewBox="0 0 2000 3911" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* BLOCO 1: TÍTULO */}
        <g>
          <text 
            x="1000" y="337" 
            fill="rgba(255, 255, 255, 0.5)" fontFamily='"Inter", sans-serif' fontSize="74" fontWeight="400" 
            textAnchor="middle" dominantBaseline="middle"
          >
            PACK PARA HAMBURGUERIA
          </text>

          <text 
            x="1000" y="509" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            LEVE O PACK
          </text>
          <text 
            x="1000" y="700" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            COMPLETO COM
          </text>
          <text 
            x="1000" y="891" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            DESCONTO
          </text>
        </g>

        <g transform="translate(0, 221)">
        {/* BLOCO 3: LISTA DE BENEFÍCIOS */}
        <g transform="translate(0, -1213)">
          {[
            { y: 2148, text: "40 artes profissionais" },
            { y: 2290, text: "40 legendas prontas" },
            { y: 2432, text: "Editável no Canva", line2: "ou photoshop" },
            { y: 2674, text: "Vídeo aula ensinando", line2: "como editar" },
            { y: 2916, text: "Suporte via WhatsApp" },
            { y: 3058, text: "Acesso imediato" },
            { y: 3200, text: "7 dias de garantia" }
          ].map((item, i) => (
            <g key={i}>
              <g transform={`translate(550, ${item.y - 46})`}>
                <circle cx="46" cy="46" r="46" fill="#00FF6F" />
                <path d="M28 46 L40 58 L64 34" stroke="#002E14" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

        {/* BLOCO 2: PREÇO */}
        <g transform="translate(0, 1026)">
          <rect x="408" y="1189" width="1184" height="127" fill="rgba(255, 255, 255, 0.08)" />
          <text 
            x="1000" y="1252.5" 
            dy="6"
            textAnchor="middle" dominantBaseline="middle" 
            fill="rgba(255, 255, 255, 0.7)" fontFamily='"Inter", sans-serif' fontSize="80" fontWeight="400"
          >
            <tspan>DE </tspan>
            <tspan fontFamily='"Sora", sans-serif'>R$ </tspan>
            <tspan textDecoration="line-through">46,00</tspan>
            <tspan> POR</tspan>
          </text>

          {/* Valor Principal Verde */}
          <text 
            x="1000" y="1670" 
            textAnchor="middle" dominantBaseline="alphabetic" 
            fill="#00FF6F"
          >
            <tspan fontFamily='"Sora", sans-serif' fontSize="90" dy="-110">R$</tspan>
            <tspan fontFamily='"Inter", sans-serif' fontWeight="500" fontSize="400" dx="57" dy="110">29</tspan>
            <tspan fontFamily='"Inter", sans-serif' fontWeight="500" fontSize="280" dx="0" dy="-84">,90</tspan>
          </text>

          <text 
            x="1000" y="1806" 
            dx="9"
            fill="rgba(255, 255, 255, 0.7)" fontFamily='"Montserrat", sans-serif' fontSize="80" fontWeight="400"
            textAnchor="middle" dominantBaseline="middle"
            style={{ letterSpacing: '18px' }}
          >
            PAGAMENTO ÚNICO
          </text>
        </g>

        {/* BLOCO 4: BOTÃO */}
        <g transform="translate(0, -532)">
          <style>{`
            @keyframes pulse-offer-burger {
              0% { transform: scale(1); }
              50% { transform: scale(1.03); }
              100% { transform: scale(1); }
            }
            .btn-offer-burger {
              animation: pulse-offer-burger 2s infinite ease-in-out;
              transform-origin: 1000px 3683px; 
            }
          `}</style>
          <rect x="357.5" y="3544" width="1285" height="278" rx="40" fill="#00FF6F" style={{ filter: 'blur(45px)', opacity: 0.4 }} className="btn-offer-burger" />
          
          <foreignObject x="357.5" y="3544" width="1285" height="278" className="btn-offer-burger">
            <a 
              href="https://pay.hotmart.com/S106732020D?off=dfb9ykdq&checkoutMode=10&offDiscount=NOVOPACK" 
              id="btn-checkout-offer-burger" 
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
                fontSize: '90px',
                fontWeight: '700',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              GARANTIR PACK
            </a>
          </foreignObject>
        </g>
        </g>
      </svg>
    </div>
  )
}
