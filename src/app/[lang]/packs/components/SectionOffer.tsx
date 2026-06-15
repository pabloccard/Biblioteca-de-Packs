export function SectionOffer() {
  return (
    <div 
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        backgroundColor: '#000',
        paddingBottom: '202.55%' // 4051 / 2000 = 202.55% (Aspect Ratio ajustado com a remoção do gap)
      }}
    >
      {/* Imagem de Fundo (Aguardando offerbg.webp) */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'url(/sales-pages/provider-v03/locales/pt/backgrounds/offerbg.webp)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <svg 
        viewBox="0 0 2000 4051" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* BLOCO 1: TÍTULO PADRONIZADO */}
        <g>
          <text 
            x="1000" y="337" 
            fill="rgba(255, 255, 255, 0.5)" fontFamily='"Inter", sans-serif' fontSize="74" fontWeight="400" 
            textAnchor="middle" dominantBaseline="middle"
          >
            DESCONTO DE LANÇAMENTO
          </text>
          
          <text 
            x="1000" y="509" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            USE O CUPOM
          </text>
          <text 
            x="1000" y="700" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            <tspan fill="#00FF6F">"NOVOPACK"</tspan> E
          </text>
          <text 
            x="1000" y="891" 
            fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
            textAnchor="middle" dominantBaseline="middle"
          >
            GARANTA O SEU
          </text>
        </g>

        {/* CONTEÚDO INFERIOR (DESLOCADO 149PX PARA CIMA PARA REDUZIR O GAP PELA METADE) */}
        <g transform="translate(0, -149)">
          {/* BLOCO 2: PREÇO */}
        <g>
          {/* Tarja */}
          <rect x="408" y="1189" width="1184" height="127" fill="rgba(255, 255, 255, 0.08)" />
          <text 
            x="1000" y="1252.5" 
            dy="6"
            textAnchor="middle" dominantBaseline="middle" 
            fill="rgba(255, 255, 255, 0.7)" fontFamily='"Inter", sans-serif' fontSize="80" fontWeight="400"
          >
            <tspan>DE </tspan>
            <tspan fontFamily='"Sora", sans-serif'>R$ </tspan>
            <tspan textDecoration="line-through">69,90</tspan>
            <tspan> POR</tspan>
          </text>

          {/* Valor Principal Verde */}
          <text 
            x="1000" y="1686" 
            textAnchor="middle" dominantBaseline="alphabetic" 
            fill="#00FF6F"
          >
            <tspan fontFamily='"Sora", sans-serif' fontSize="180" dy="-75">R$</tspan>
            <tspan fontFamily='"Inter", sans-serif' fontWeight="500" fontSize="400" dx="57" dy="75">37</tspan>
            <tspan fontFamily='"Inter", sans-serif' fontWeight="500" fontSize="280" dx="0" dy="-84">,90</tspan>
          </text>

          {/* Pagamento Único ajustado e perfeitamente centralizado usando letterSpacing compensado no Eixo X */}
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

        {/* BLOCO 3: LISTA DE BENEFÍCIOS */}
        <g>
          {[
            { y: 2148, text: "40 artes profissionais" },
            { y: 2290, text: "Legendas prontas" },
            { y: 2432, text: "Canva e Photoshop" },
            { y: 2574, text: "Alta resolução", sub: " 2160x2700" },
            { y: 2716, text: "Vídeo aula ensinando", line2: "como editar" },
            { y: 2958, text: "Suporte via WhatsApp" },
            { y: 3100, text: "Acesso imediato" },
            { y: 3242, text: "7 dias de garantia" }
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

        {/* BLOCO 4: BOTÃO */}
        <g>
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
          <a href="https://pay.hotmart.com/W106093316A?off=k6nw06sg&checkoutMode=10&offDiscount=NOVOPACK" style={{ cursor: 'pointer' }} className="btn-offer">
            {/* Glow sutil atrás do botão */}
            <rect x="357.5" y="3544" width="1285" height="278" rx="40" fill="#00FF6F" style={{ filter: 'blur(45px)', opacity: 0.4 }} />
            
            {/* Corpo do botão */}
            <rect x="357.5" y="3544" width="1285" height="278" rx="40" fill="#00FF6F" />
            
            <text 
              x="1000" y="3691" 
              fill="#002E14" fontFamily='"Inter", sans-serif' fontSize="90" fontWeight="700" 
              textAnchor="middle" dominantBaseline="middle"
            >
              GARANTIR DESCONTO
            </text>
          </a>
        </g>
        </g>
      </svg>
    </div>
  )
}
