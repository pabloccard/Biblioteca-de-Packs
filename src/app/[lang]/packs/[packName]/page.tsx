'use client'

import { use } from 'react'
import BurgerEnSalesPage from '../components-burger-en/BurgerEnSalesPage'

/**
 * Página de vendas: es/packs/burger
 *
 * Layout baseado em imagens exportadas do Figma (canvas 2000px de largura).
 * Os botões são sobrepostos sobre as imagens usando posicionamento absoluto.
 * Todas as medidas são escaladas proporcionalmente à largura renderizada,
 * usando a fórmula: calc(figma_px / 2000 * min(100vw, 480px))
 */

const CHECKOUT_URL =
  'https://pay.hotmart.com/D106815726I?checkoutMode=10&offDiscount=LANZAMIENTO50'

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
  paddingTop: scalePx(65),
  paddingBottom: scalePx(65),
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
      style={{ ...buttonStyle, bottom: scalePx(bottom) }}
    >
      Obtener el pack
    </a>
  )
}

// Botão que rola suavemente até a seção de oferta
function ScrollButton({ bottom, id }: { bottom: number; id: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = document.getElementById('secao-oferta')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href="#secao-oferta"
      id={id}
      onClick={handleClick}
      style={{ ...buttonStyle, bottom: scalePx(bottom) }}
    >
      Obtener el pack
    </a>
  )
}

export default function BurgerSalesPage({ params }: { params: Promise<{ lang: string, packName: string }> }) {
  const { packName } = use(params)

  // Se for a página em inglês, renderiza o componente completamente isolado
  if (packName === 'burger-restaurants') {
    return <BurgerEnSalesPage />
  }

  // Fallback original para espanhol (burger)
  return (
    <>
      {/* Importa Clash Display via Fontshare */}
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
        {/* 1. Hero — alta prioridade, carrega primeiro */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burguer-es/hero.webp"
            alt="Hero"
            fetchPriority="high"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* 2. Personaliza — lazy */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burguer-es/personalize.webp"
            alt="Personaliza"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <ScrollButton bottom={290} id="btn-personalize" />
        </div>

        {/* 3. Feedbacks — lazy */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burguer-es/feedbacks.webp"
            alt="Feedbacks"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* 4. Oferta — lazy */}
        <div id="secao-oferta" style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burguer-es/oferta.webp"
            alt="Oferta"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <CheckoutButton bottom={570} id="btn-oferta" />
        </div>

        {/* 5. Garantia — lazy */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burguer-es/garantia.webp"
            alt="Garantia"
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <CheckoutButton bottom={222} id="btn-garantia" />
        </div>

        {/* 6. FAQ — sem botão */}
        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
          <img
            src="/sales-pages/burguer-es/faq.webp"
            alt="FAQ"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </>
  )
}
