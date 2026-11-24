export interface ProvedorContent {
  metadata: {
    title: string
    description: string
  }
  hero: {
    badge: string
    titleBefore: string
    titleMid: string
    titleHighlight: string
    titleHighlight2: string
    subtitle: string
    desc: string
  }
  versoes: {
    badge: string
    titleBefore: string
    highlight: string
    titleAfter: string
    desc: string
  }
  edite: {
    badge: string
    titleBefore: string
    titleFor: string
    highlight1: string
    highlight2: string
    desc: string
  }
  faixaEdicao: string
  faixaFeedbacks: string
  faixaAutoral: string
  facilEdicao: {
    badge: string
    titleBefore: string
    highlight1: string
    highlight2: string
    desc: string
  }
  suporte: {
    badge: string
    title: string
    desc: string
  }
  feedbacks: {
    badge: string
    title: string
    desc: string
  }
  oferta: {
    badge: string
    titleBefore: string
    titleMid: string
    highlight: string
    benefits: string[]
    priceOld: string
    priceCurrent: string
    priceUnique: string
    ctaText: string
    checkoutUrl: string
    selos: {
      segura: string
      privacidade: string
      garantia: string
    }
  }
  autoral: {
    badge: string
    titleBefore: string
    titleBy: string
    highlight: string
    intro: string
    name: string
    desc: string
  }
  faq: {
    badge: string
    title: string
    items: { question: string; answer: string }[]
  }
}

export const PROVEDOR_I18N: Record<'pt' | 'es', ProvedorContent> = {
  pt: {
    metadata: {
      title: 'Pack de Artes para Provedor de Internet | Artes Editáveis',
      description:
        'Pack de Artes Editáveis para Provedor de Internet. Um pacote completo pronto para você abrir no celular ou computador, colocar a sua logo e os seus planos e baixar para postar em menos de 5 minutos.',
    },
    hero: {
      badge: 'Pack de dezembro',
      titleBefore: 'Pack de Artes',
      titleMid: 'editáveis para',
      titleHighlight: 'Provedor de',
      titleHighlight2: 'Internet',
      subtitle:
        'Um pacote completo pronto para você abrir no celular ou computador, colocar a sua logo e os seus planos e baixar para postar em menos de 5 minutos.',
      desc: 'A parte mais pesada do design já foi resolvida para você. Toda a direção visual, equilíbrio de cores e organização de informações já estão prontos: basta aplicar suas informações, baixar e postar.',
    },
    versoes: {
      badge: 'Várias versões inclusas',
      titleBefore: 'Receba o pack em',
      highlight: '12 versões',
      titleAfter: 'de cores.',
      desc: 'Recolorir uma arte no Canva cheia de efeitos dá trabalho. Por isso, já preparamos 12 versões com as principais cores do mercado para você ter opções prontas para usar.',
    },
    edite: {
      badge: 'Edite onde quiser',
      titleBefore: 'Arquivos prontos',
      titleFor: 'para',
      highlight1: 'Canva e',
      highlight2: 'Photoshop.',
      desc: 'Não precisa ser designer nem instalar programas pesados: pelo Canva, você altera planos, preços, logo e demais informações em poucos cliques, direto no celular ou computador. E caso você ou sua equipe queiram fazer edições mais complexas, os arquivos originais para Photoshop também vão inclusos.',
    },
    faixaEdicao: 'FÁCIL EDIÇÃO • FÁCIL EDIÇÃO • FÁCIL EDIÇÃO • FÁCIL EDIÇÃO • FÁCIL EDIÇÃO',
    faixaFeedbacks: 'FEEDBACKS • FEEDBACKS • FEEDBACKS • FEEDBACKS • FEEDBACKS',
    faixaAutoral: 'CRIAÇÃO 100% AUTORAL • CRIAÇÃO 100% AUTORAL • CRIAÇÃO 100% AUTORAL',
    facilEdicao: {
      badge: 'Fácil edição',
      titleBefore: 'Tudo organizado',
      highlight1: 'e pronto para',
      highlight2: 'você alterar.',
      desc: 'Você não precisa perder tempo procurando onde clicar. Como todas as camadas já estão organizadas, basta selecionar o que você quer editar, substituir pelas informações do seu provedor e salvar a arte.',
    },
    suporte: {
      badge: 'Precisa de ajuda?',
      title: 'Suporte direto pelo WhatsApp',
      desc: 'Nada de robôs ou e-mails sem resposta. Se surgir qualquer dúvida para acessar as artes, inserir a sua logo ou editar suas informações, você fala diretamente com a gente no WhatsApp para resolver na hora.',
    },
    feedbacks: {
      badge: 'Quem comprou, aprovou',
      title: 'O que dizem os provedores que já usam o pack',
      desc: 'Quem já usa nossos pacotes no dia a dia sabe que na prática não tem segredo nem perda de tempo: você recebe o acesso na hora, coloca os dados do seu provedor em poucos cliques e já bota as artes para rodar.',
    },
    oferta: {
      badge: 'Oferta Black Friday',
      titleBefore: 'Garanta o pack',
      titleMid: 'com desconto',
      highlight: 'de Black Friday',
      benefits: [
        '24 artes prontas para editar',
        '24 legendas prontas inclusas',
        '12 versões de cores inclusas',
        'Use no Canva ou Photoshop',
        'Suporte direto no WhatsApp',
        'Acesso imediato e vitalício',
        '7 dias de garantia total',
      ],
      priceOld: 'de <s>R$ 67,90</s> por',
      priceCurrent: 'R$ 37,90',
      priceUnique: 'pagamento único',
      ctaText: 'Quero meu pack agora',
      checkoutUrl: 'https://pay.hotmart.com/L108519462J?checkoutMode=10',
      selos: {
        segura: 'Compra\nSegura',
        privacidade: 'Privacidade\nProtegida',
        garantia: 'Garantia\n7 Dias',
      },
    },
    autoral: {
      badge: 'Criação 100% autoral',
      titleBefore: 'Feito do zero',
      titleBy: 'por um designer',
      highlight: 'especialista em provedores.',
      intro: 'Prazer, meu nome é ',
      name: 'Pablo ',
      desc: 'e sou o designer por trás de todas as artes desta página. Aqui você não está comprando um pacote genérico de revenda com artes catadas da internet: cada peça deste pack foi desenhada do zero por mim, pensando especificamente no que faz um provedor de internet chamar atenção e vender planos na sua cidade, desde a iluminação e o destaque dos planos até a organização limpa das camadas para facilitar a sua edição.',
    },
    faq: {
      badge: 'Tire suas dúvidas',
      title: 'Perguntas Frequentes',
      items: [
        {
          question: 'Preciso pagar o Canva Pro para conseguir editar as artes?',
          answer:
            'Não. Você consegue abrir as imagens, alterar textos, velocidades, preços e inserir a sua logo e etc usando a conta gratuita do Canva, tanto pelo computador quanto pelo celular.',
        },
        {
          question: 'Como funcionam as 12 versões de cores? Consigo mudar para qualquer cor?',
          answer:
            'Depende do programa que você for usar: no Photoshop, as cores são 100% editáveis, você tem acesso total às camadas de luzes, brilhos e fundos para personalizar com qualquer cor que desejar. Já no Canva, como a iluminação de fundo é avançada, não é possível trocar a cor; por isso já entregamos o pack pronto nas 12 versões de cores mais utilizadas pelos provedores, bastando abrir a pasta da sua cor preferida e editar os textos e a logo.',
        },
        {
          question: 'Quais informações eu consigo alterar nas artes?',
          answer:
            'Você consegue alterar qualquer informação nas artes: headlines, velocidades, valores mensais, textos de apoio, logomarca, número de WhatsApp, etc.',
        },
        {
          question: 'Como funcionam as 24 legendas prontas?',
          answer:
            'Cada arte do pacote já acompanha uma legenda estruturada para o tema daquele post. Basta copiar o texto, preencher com os dados do seu provedor e colar na hora de publicar.',
        },
        {
          question: 'Em quanto tempo recebo o material após o pagamento?',
          answer:
            'Pagando via PIX ou Cartão de Crédito, a liberação é imediata. Assim que o pagamento é confirmado, você recebe no seu e-mail o acesso a área de membros onde contem todo o material (Canva, Photoshop e legendas).',
        },
        {
          question: 'O pagamento é único ou tem alguma mensalidade?',
          answer:
            'O pagamento de R$ 37,90 é único. Não há mensalidades nem taxas extras, e o seu acesso aos arquivos é vitalício para usar e atualizar seus preços sempre que precisar.',
        },
      ],
    },
  },
  es: {
    metadata: {
      title: 'Pack de Plantillas para Proveedores de Internet | Diseños Editables',
      description:
        'Pack de plantillas editables para proveedores de internet. Un paquete completo listo para abrir desde tu celular o computadora, agregar tu logo y tus planes, y descargar para publicar en pocos clics.',
    },
    hero: {
      badge: 'Pack de diciembre',
      titleBefore: 'Pack de Plantillas',
      titleMid: 'editables para',
      titleHighlight: 'Proveedores de',
      titleHighlight2: 'Internet',
      subtitle:
        'Un paquete completo listo para abrir desde tu celular o computadora, agregar tu logo y tus planes, y descargar para publicar en pocos clics.',
      desc: 'El trabajo pesado del diseño ya está resuelto. La dirección visual, la armonía de colores y la organización de la información ya están listas: solo tienes que ingresar tus datos, descargar y publicar.',
    },
    versoes: {
      badge: 'Múltiples versiones incluidas',
      titleBefore: 'Recibe el pack en',
      highlight: '12 versiones',
      titleAfter: 'de color.',
      desc: 'Cambiar los colores de una plantilla llena de efectos en Canva lleva demasiado tiempo. Por eso, ya preparamos 12 versiones con los colores más utilizados del sector para que tengas opciones listas para usar.',
    },
    edite: {
      badge: 'Edita donde prefieras',
      titleBefore: 'Edita desde tu ',
      titleFor: 'celular o PC,',
      highlight1: 'directamente',
      highlight2: ' en Canva.',
      desc: 'No necesitas una computadora potente ni programas complicados. Solo abre los archivos desde la aplicación en tu celular o desde el navegador de tu computadora, agrega los datos de tu proveedor y descarga los diseños listos para publicar.',
    },
    faixaEdicao: 'FÁCIL EDICIÓN • FÁCIL EDICIÓN • FÁCIL EDICIÓN • FÁCIL EDICIÓN • FÁCIL EDICIÓN',
    faixaFeedbacks: 'TESTIMONIOS • TESTIMONIOS • TESTIMONIOS • TESTIMONIOS • TESTIMONIOS',
    faixaAutoral: 'DISEÑO 100% ORIGINAL • DISEÑO 100% ORIGINAL • DISEÑO 100% ORIGINAL',
    facilEdicao: {
      badge: 'Fácil edición',
      titleBefore: 'Todo organizado',
      highlight1: 'y listo para',
      highlight2: 'que lo edites.',
      desc: 'No pierdas tiempo buscando qué elemento modificar. Como todas las capas están perfectamente ordenadas, solo tienes que seleccionar lo que deseas cambiar, colocar los datos de tu proveedor y guardar tu diseño.',
    },
    suporte: {
      badge: 'Necesitas ayuda?',
      title: 'Soporte directo por WhatsApp',
      desc: 'Sin bots ni correos que nadie responde. Si tienes alguna duda para acceder a las plantillas, subir tu logo o editar la información, nos escribes directamente por WhatsApp y lo resolvemos al instante.',
    },
    feedbacks: {
      badge: 'Aprobado por quienes ya lo usan',
      title: 'Lo que opinan los proveedores que ya usan el pack',
      desc: 'Quienes ya utilizan nuestros packs en su día a día saben que no hay complicaciones ni pérdida de tiempo: recibes acceso inmediato, colocas los datos de tu empresa en pocos clics y ya tienes todo listo para publicar.',
    },
    oferta: {
      badge: 'Oferta Black Friday',
      titleBefore: 'Llévate el pack',
      titleMid: 'con descuento',
      highlight: 'de Black Friday',
      benefits: [
        '24 plantillas listas para editar',
        '24 textos listos para publicar',
        '12 versiones de color incluidas',
        'Compatible con Canva',
        'Soporte directo por WhatsApp',
        'Acceso inmediato y de por vida',
        'Garantía total de 7 días',
      ],
      priceOld: 'de <s>US$ 19.98</s> a',
      priceCurrent: 'US$ 9.99',
      priceUnique: 'pago único',
      ctaText: 'Quiero mi pack ahora',
      checkoutUrl: 'https://pay.hotmart.com/M108602508F?checkoutMode=10&offDiscount=BLACKFRIDAY',
      selos: {
        segura: 'Compra\nSegura',
        privacidade: 'Privacidad\nProtegida',
        garantia: 'Garantía\n7 Días',
      },
    },
    autoral: {
      badge: 'Diseño 100% original',
      titleBefore: 'Creado desde cero',
      titleBy: 'por un diseñador',
      highlight: 'especialista en proveedores.',
      intro: 'Mucho gusto, mi nombre es ',
      name: 'Pablo ',
      desc: 'y soy el diseñador detrás de cada pieza de esta página. Aquí no estás comprando un paquete genérico de reventa con plantillas sacadas de internet: cada diseño de este pack fue creado desde cero por mí, pensando específicamente en lo que hace que un proveedor de internet llame la atención y venda planes en su ciudad, desde la iluminación y el protagonismo de las tarifas hasta la organización limpia de las capas para facilitar tu edición.',
    },
    faq: {
      badge: 'Resuelve tus dudas',
      title: 'Preguntas Frecuentes',
      items: [
        {
          question: '¿Necesito pagar Canva Pro para poder editar las plantillas?',
          answer:
            'No. Puedes abrir las plantillas, cambiar textos, velocidades, precios, agregar tu logo y mucho más utilizando la cuenta gratuita de Canva, tanto desde tu computadora como desde tu celular.',
        },
        {
          question: '¿Qué información puedo modificar en las plantillas?',
          answer:
            'Puedes editar toda la información clave: titulares, velocidades, tarifas mensuales, textos complementarios, logotipo, número de WhatsApp y cualquier otro dato de tu empresa.',
        },
        {
          question: '¿Cómo funcionan los 24 textos listos para publicar?',
          answer:
            'Cada plantilla del paquete incluye un texto redactado específicamente para el tema de esa publicación. Solo tienes que copiarlo, completar los datos de tu proveedor y pegarlo al momento de publicar.',
        },
        {
          question: '¿En cuánto tiempo recibo el material después del pago?',
          answer:
            'Al pagar con tarjeta de crédito u otro método de confirmación inmediata, la entrega es al instante. Apenas se confirma el pago, recibes por correo electrónico el acceso al área de miembros donde encontrarás todo el material.',
        },
        {
          question: '¿Es un pago único o tiene alguna suscripción mensual?',
          answer:
            'Es un pago único de US$ 9.99. No existen mensualidades ni cargos adicionales, y tu acceso a los archivos es de por vida para que los uses y actualices tus precios siempre que lo necesites.',
        },
      ],
    },
  },
}

export function getProvedorContent(lang?: string): ProvedorContent {
  if (lang === 'es') return PROVEDOR_I18N.es
  return PROVEDOR_I18N.pt
}
