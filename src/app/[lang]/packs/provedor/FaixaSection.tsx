export default function FaixaSection({
  text,
  variant = 'green',
}: {
  text: string
  variant?: 'green' | 'light' | 'dark'
}) {
  return (
    <div className={`v2-faixa${variant !== 'green' ? ` v2-faixa--${variant}` : ''}`}>
      <p className="v2-faixa-text">{text}</p>
    </div>
  )
}
