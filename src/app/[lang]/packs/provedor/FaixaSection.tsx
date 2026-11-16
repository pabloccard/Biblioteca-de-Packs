export default function FaixaSection({
  text,
  variant = 'green',
}: {
  text: string
  variant?: 'green' | 'light'
}) {
  return (
    <div className={`v2-faixa${variant === 'light' ? ' v2-faixa--light' : ''}`}>
      <p className="v2-faixa-text">{text}</p>
    </div>
  )
}
