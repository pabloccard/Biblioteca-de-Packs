'use client'

export function SectionFaq() {
  const faqs = [
    {
      q: "Quantas artes estão incluídas no pack?",
      a: "O pack contém 40 artes profissionais e totalmente editáveis, prontas para personalizar com as cores, textos e informações da sua hamburgueria."
    },
    {
      q: "Em quais formatos os arquivos são entregues?",
      a: "Você recebe os arquivos nos formatos Canva e Photoshop (PSD), podendo editar na plataforma de sua preferência."
    },
    {
      q: "Como recebo os arquivos após a compra?",
      a: "A entrega é 100% digital e imediata. Assim que o pagamento for confirmado, você recebe acesso aos arquivos para download."
    },
    {
      q: "Preciso ter conhecimento em design para editar as artes?",
      a: "Não. As artes foram organizadas para facilitar a edição, permitindo alterar textos, cores, imagens e informações de forma simples e rápida."
    }
  ]

  return (
    <div style={{ backgroundColor: '#010101', width: '100%', position: 'relative', zIndex: 50 }}>
      <svg viewBox="0 0 2000 4400" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <text 
          x="150" y="509" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
          textAnchor="start" dominantBaseline="middle"
        >
          PERGUNTAS
        </text>
        <text 
          x="150" y="700" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
          textAnchor="start" dominantBaseline="middle"
        >
          FREQUENTES
        </text>

        <foreignObject x="150" y="1000" width="1700" height="3400">
          <div style={{ width: '100%', height: '100%' }}>
        {faqs.map((faq, i) => {
          return (
              <div 
                key={i} 
                style={{ 
                  marginBottom: '150px',
                }}
              >
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                }}
              >
                <h3 style={{ 
                  fontFamily: '"Inter", sans-serif', 
                  fontSize: '95px',
                  fontWeight: '500', 
                  color: 'rgba(255, 255, 255, 0.85)',
                  margin: 0,
                  width: '100%',
                  lineHeight: '1.2',
                }}>
                  {faq.q}
                </h3>
              </div>
              
              <div>
                <p style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '80px',
                  fontWeight: '400',
                  color: 'rgba(255, 255, 255, 0.5)',
                  margin: 0,
                  paddingTop: '50px',
                  paddingBottom: '30px', 
                  lineHeight: '1.4'
                }}>
                  {faq.a}
                </p>
              </div>
            </div>
          )
        })}
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}
