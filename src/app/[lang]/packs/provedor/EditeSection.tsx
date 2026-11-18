'use client'

import BgCards from './BgCards'
import { usePacksContext } from './PacksContext'

export default function EditeSection({ mockupSrc }: { mockupSrc?: string }) {
  const context = usePacksContext()
  const imageSrc =
    mockupSrc || context?.mockupSrc || '/sales-pages/provedor-v2/mockup.webp'

  return (
    <section className="v2-edite">
      <BgCards section="edite" />
      <div className="v2-edite-content">
        {/* Título */}
        <div className="v2-section-title-block">
          <div className="v2-badge">
            <span className="v2-badge-icon v2-badge-icon--blue">
              <img src="/sales-pages/provedor-v2/icon-rocket.png" alt="" />
            </span>
            <span className="v2-badge-text">Edite onde quiser</span>
          </div>
          <h2 className="v2-section-title">
            Arquivos prontos <br />
            para <span className="v2-highlight">Canva e <br />Photoshop.</span>
          </h2>
        </div>

        {/* Mockup único */}
        <img
          src={imageSrc}
          alt="Mockup de edição em Canva e Photoshop"
          className="v2-edite-mockup"
          loading="lazy"
          decoding="async"
        />

        {/* Descrição */}
        <p className="v2-section-desc">
          Não precisa ser designer nem instalar programas pesados: pelo Canva,
          você altera planos, preços, logo e demais informações em poucos
          cliques, direto no celular ou computador. E caso você ou sua equipe
          queiram fazer edições mais complexas, os arquivos originais para
          Photoshop também vão inclusos.
        </p>
      </div>
    </section>
  )
}
