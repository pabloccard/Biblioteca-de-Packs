import { ReactNode } from 'react'

export default function PackSalesLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div style={{ backgroundColor: '#020202', minHeight: '100vh', width: '100%' }}>
      <div 
        style={{
          // Limita a largura máxima no desktop para parecer mobile
          maxWidth: '500px', 
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          // Cria o container para usarmos a unidade "cqw"
          containerType: 'inline-size',
          backgroundColor: '#020202',
          overflowX: 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  )
}
