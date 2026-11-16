import BgCards from './BgCards'

const STEPS = [
  {
    num: '1',
    title: 'Você envia',
    desc: 'Preencha rapidamente os dados do seu provedor, e nos envie seu logo.',
  },
  {
    num: '2',
    title: 'Nós personalizamos',
    desc: 'Ajustamos cada arte do pack com as suas informações, mantendo o alinhamento e a qualidade visual do design.',
  },
  {
    num: '3',
    title: 'Você publica',
    desc: 'Receba os arquivos em formato de imagem final (prontos para o feed), sem precisar abrir nenhum programa de edição.',
  },
]

export default function PersonalizeSection() {
  return (
    <section className="v2-personalize">
      <BgCards section="personalize" />

      <div className="v2-personalize-content">
        {/* Título */}
        <div className="v2-section-title-block v2-reveal">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--green">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text v2-badge-text--semibold">
              Está sem tempo?
            </span>
          </div>
          <h2 className="v2-section-title">
            Se preferir, nós{' '}
            <span className="v2-highlight">personalizamos </span>
            tudo pra você
          </h2>
        </div>

        {/* Subtítulo */}
        <p className="v2-personalize-subtitle v2-reveal v2-delay-1">
          Não quer abrir nenhum programa de edição? Escolha a modalidade pronta
          para postar e deixe todo o trabalho com a nossa equipe.
        </p>

        {/* Lista de passos 1-2-3 com cascata */}
        <div className="v2-steps-list">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`v2-reveal v2-delay-${i + 1}`}
            >
              {i > 0 && <div className="v2-step-divider" />}
              <div className="v2-step-item">
                <span className="v2-step-num">{step.num}</span>
                <div className="v2-step-body">
                  <h3 className="v2-step-title">{step.title}</h3>
                  <p className="v2-step-desc">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Texto final */}
        <p className="v2-section-desc v2-reveal v2-delay-3">
          Você cuida da operação do seu provedor enquanto nós entregamos sua
          comunicação visual 100% finalizada.
        </p>
      </div>
    </section>
  )
}
