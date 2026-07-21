'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'

// Configuração de redirects diretos para checkout (sem versão na URL)
const checkoutRedirects: Record<string, string> = {
  'es-burger': 'https://pay.hotmart.com/D106815726I?checkoutMode=10&offDiscount=LANZAMIENTO50',
}

export default function PackRedirectPage() {
  const params = useParams()
  const lang = params.lang as string
  const packName = params.packName as string

  const key = `${lang}-${packName}`
  const checkoutUrl = checkoutRedirects[key]

  useEffect(() => {
    if (!checkoutUrl) return

    const linkElement = document.getElementById('redirect-link') as HTMLAnchorElement
    if (!linkElement) return

    const MIN_DELAY = 2500 // 2.5s garantem que o GTM carregou, leu o código e enviou o PageView
    const MAX_DELAY = 6000 // 6s é o tempo máximo de espera caso o script de UTM nunca dispare
    const startTime = Date.now()
    let redirectFired = false

    const executeRedirect = () => {
      if (redirectFired) return
      redirectFired = true
      
      // Simula o clique real no botão invisível para os triggers de clique do GTM
      linkElement.click()
    }

    const tryRedirect = () => {
      const timeElapsed = Date.now() - startTime
      if (timeElapsed < MIN_DELAY) {
        // Se a UTM carregou muito rápido, aguardamos o tempo mínimo para não matar o PageView
        setTimeout(executeRedirect, MIN_DELAY - timeElapsed)
      } else {
        // Se já passou o tempo mínimo, redireciona na mesma hora
        executeRedirect()
      }
    }

    // Observa o script de UTM alterando o link
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
          observer.disconnect()
          tryRedirect()
        }
      })
    })

    observer.observe(linkElement, { attributes: true })

    // Fallback absoluto (se o script UTM falhar ou o lead não tiver UTM)
    const fallbackTimer = setTimeout(() => {
      observer.disconnect()
      executeRedirect()
    }, MAX_DELAY)

    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [checkoutUrl])

  if (!checkoutUrl) {
    notFound()
  }

  // Página invisível — apenas serve para o tracking carregar
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* 
        Este link invisível é crucial! O script de tracking precisa de uma tag <a> 
        para injetar os parâmetros/UTMs na URL. O nosso MutationObserver está 
        vigiando ele. A classe "checkout-link" garante que o script reconheça
        que é um botão de checkout e dispare o InitiateCheckout quando clicarmos.
      */}
      <a 
        id="redirect-link" 
        href={checkoutUrl} 
        className="checkout-link"
        style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
      >
        Checkout
      </a>

      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#00FF6F',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
