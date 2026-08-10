'use client'

const CHECKOUT_URL = 'https://pay.hotmart.com/S106732020D?checkoutMode=10&offDiscount=NOVOPACK'

// Escala proporcional do Figma (2000px) para a tela renderizada (max 480px)
const S = 'calc(min(100vw, 480px) / 2000)'

function scalePx(figmaPx: number) {
  return `calc(${figmaPx} * ${S})`
}

const buttonStyle = {
  position: 'absolute' as const,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap' as const,

  paddingLeft: scalePx(250),
  paddingRight: scalePx(250),
  fontSize: scalePx(90),
  backgroundColor: '#DDFE06',
  color: '#3B4400',
  fontFamily: '"Clash Display", sans-serif',
  fontWeight: 700,
  borderRadius: scalePx(56),
  textDecoration: 'none',
  cursor: 'pointer',
  lineHeight: 1,
}

// Botão que vai pro checkout (usado na Oferta e Garantia)
function CheckoutButton({ bottom, id, text }: { bottom: number; id: string; text: string }) {
  return (
    <a
      href={CHECKOUT_URL}
      id={id}
      className="checkout-link"
      style={{ ...buttonStyle, paddingTop: scalePx(65), paddingBottom: scalePx(65), bottom: scalePx(bottom) }}
    >
      {text}
    </a>
  )
}

// Botão que rola suavemente até a seção de oferta
function ScrollButton({ bottom, id, text }: { bottom: number; id: string; text: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = document.getElementById('secao-oferta-pt')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href="#secao-oferta-pt"
      id={id}
      onClick={handleClick}
      style={{ ...buttonStyle, paddingTop: scalePx(65), paddingBottom: scalePx(65), bottom: scalePx(bottom) }}
    >
      {text}
    </a>
  )
}

export default function BurgerPtSalesPage() {
  return (
    <>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background-color: #000; }
        html { scroll-behavior: smooth; }

        /* Bloqueia clique direito, seleção e drag nas imagens */
        img {
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
          -webkit-user-drag: none;
          pointer-events: none;
        }
      `}</style>

      {/* Container principal: simula mobile no desktop */}
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          backgroundColor: '#000',
          minHeight: '100vh',
        }}
      >
        {/* 1. Hero */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-pt/hero.webp"
            alt="Hero"
            fetchPriority="high"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* 2. Personalize */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-pt/personalize.webp"
            alt="Personalize"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <ScrollButton bottom={248} id="btn-personalize-pt" text="Quero meu pack" />
        </div>

        {/* 3. Feedbacks */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-pt/feedbacks.webp"
            alt="Feedbacks"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* 4. Oferta */}
        <div id="secao-oferta-pt" style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-pt/oferta.webp"
            alt="Oferta"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <CheckoutButton bottom={600} id="btn-oferta-pt" text="Garantir meu pack" />
        </div>

        {/* 5. Garantia */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-pt/garantia.webp"
            alt="Garantia"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <CheckoutButton bottom={216} id="btn-garantia-pt" text="Garantir meu pack" />
        </div>

        {/* 6. FAQ */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-pt/faq.webp"
            alt="FAQ"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </>
  )
}
