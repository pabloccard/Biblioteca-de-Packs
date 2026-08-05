'use client'

const CHECKOUT_URL = 'https://pay.hotmart.com/H106966194G?checkoutMode=10&offDiscount=LAUNCH50'

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

  paddingLeft: scalePx(300),
  paddingRight: scalePx(300),
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

// Botão que vai pro checkout
function CheckoutButton({ bottom, id }: { bottom: number; id: string }) {
  return (
    <a
      href={CHECKOUT_URL}
      id={id}
      className="checkout-link"
      style={{ ...buttonStyle, paddingTop: scalePx(65), paddingBottom: scalePx(65), paddingLeft: scalePx(230), paddingRight: scalePx(230), bottom: scalePx(bottom) }}
    >
      Get instant access
    </a>
  )
}

// Botão que rola suavemente até a seção de oferta
function ScrollButton({ bottom, id }: { bottom: number; id: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = document.getElementById('secao-oferta-en')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href="#secao-oferta-en"
      id={id}
      onClick={handleClick}
      style={{ ...buttonStyle, paddingTop: scalePx(65), paddingBottom: scalePx(65), bottom: scalePx(bottom) }}
    >
      Get the pack
    </a>
  )
}

export default function BurgerEnSalesPage() {
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
            src="/sales-pages/burger-restaurants/hero.webp"
            alt="Hero"
            fetchPriority="high"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* 2. Info / Personalize */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-restaurants/info.webp"
            alt="Info"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <ScrollButton bottom={296} id="btn-personalize-en" />
        </div>

        {/* 3. Feedbacks */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-restaurants/feedback.webp"
            alt="Feedbacks"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* 4. Oferta */}
        <div id="secao-oferta-en" style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-restaurants/oferta.webp"
            alt="Oferta"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <CheckoutButton bottom={480} id="btn-oferta-en" />
        </div>

        {/* 5. Garantia */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-restaurants/garantia.webp"
            alt="Garantia"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <CheckoutButton bottom={250} id="btn-garantia-en" />
        </div>

        {/* 6. FAQ */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burger-restaurants/faq.webp"
            alt="FAQ"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </>
  )
}
