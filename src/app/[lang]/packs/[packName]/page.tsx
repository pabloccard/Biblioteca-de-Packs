'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'

// Configuração de redirects diretos para checkout (sem versão na URL)
// Formato: { [lang-packName]: checkoutUrl }
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
    if (checkoutUrl) {
      // Pequeno delay para garantir que o tracking script do layout carregue
      const timer = setTimeout(() => {
        window.location.href = checkoutUrl
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [checkoutUrl])

  // Se não existe redirect configurado para essa combinação, 404
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
