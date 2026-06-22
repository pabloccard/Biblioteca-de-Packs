'use client'

export function SectionFaq() {
  const faqs = [
    {
      q: "Cuántas plantillas están incluidas en el pack?",
      a: "El pack contiene 40 plantillas profesionales y totalmente editables, listas para personalizar con los colores, textos e información de tu empresa."
    },
    {
      q: "En qué formatos se entregan los archivos?",
      a: "Recibirás los archivos en los formatos Canva y Photoshop (PSD), y podrás editar en la plataforma de tu preferencia."
    },
    {
      q: "Cómo recibo los archivos después de la compra?",
      a: "La entrega es 100% digital e inmediata. Una vez confirmado el pago, recibirás acceso a los archivos para descargar."
    },
    {
      q: "Necesito tener conocimientos de diseño para editar las plantillas?",
      a: "No. Las plantillas fueron organizadas para facilitar la edición, lo que permite cambiar textos, colores, imágenes e información de forma simple y rápida."
    }
  ]

  return (
    // Z-index 50 na seção inteira garante estabilidade visual
    <div style={{ backgroundColor: '#010101', width: '100%', position: 'relative', zIndex: 50 }}>
      {/* TÍTULO EM SVG PARA MANTER A MATEMÁTICA DA TIPOGRAFIA */}
      <svg viewBox="0 0 2000 4400" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <text 
          x="150" y="509" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
          textAnchor="start" dominantBaseline="middle"
        >
          PREGUNTAS
        </text>
        <text 
          x="150" y="700" 
          fill="#FFFFFF" fontFamily='"Inter", sans-serif' fontSize="158" fontWeight="600" 
          textAnchor="start" dominantBaseline="middle"
        >
          FRECUENTES
        </text>

        {/* LISTA DE FAQ (TOTALMENTE ABERTA E ESTÁTICA DENTRO DO SVG) */}
        <foreignObject x="150" y="1000" width="1700" height="3400">
          <div style={{ width: '100%', height: '100%' }}>
        {faqs.map((faq, i) => {
          return (
              <div 
                key={i} 
                style={{ 
                  marginBottom: '150px', // Gap controlado em pixels absolutos virtuais
                }}
              >
              {/* CABEÇALHO DA PERGUNTA */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                }}
              >
                <h3 style={{ 
                  fontFamily: '"Inter", sans-serif', 
                  fontSize: '95px', // Tamanho absoluto protegido pelo viewBox
                  fontWeight: '500', 
                  color: 'rgba(255, 255, 255, 0.85)', // Opacidade sutilmente reduzida
                  margin: 0,
                  width: '100%',
                  lineHeight: '1.2',
                }}>
                  {faq.q}
                </h3>
              </div>
              
              {/* RESPOSTA (SEMPRE VISÍVEL) */}
              <div>
                <p style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '80px', // Tamanho absoluto protegido pelo viewBox
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
