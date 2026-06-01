import type { Metadata } from 'next'
import LandingPage from '@/components/LandingPage'
import type { LPData } from '@/components/LandingPage'

export const metadata: Metadata = {
  title: 'Pack de Artes para Provedor de Internet | Artes Editáveis',
  description: 'Pack completo com 80+ artes editáveis para provedor de internet. Feed, Stories, Canva e Photoshop. Acesso imediato.',
}

const LP_DATA: LPData = {
  packName: 'Provedor de Internet',
  headline: 'Pack de artes editáveis para Provedor de Internet',
  subheadline: 'Mais de 80 artes profissionais prontas para personalizar e postar. Feed, Stories, Legendas e muito mais.',

  // Hero: coloque 8-12 imagens de artes do pack aqui
  heroImages: [
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=500&fit=crop',
  ],

  colorSection: {
    title: 'Altere para sua paleta de cores com apenas um clique',
    description: 'Todas as artes são 100% editáveis. Troque cores, textos, imagens e fontes de forma rápida e fácil.',
    mockImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=500&fit=crop',
  },

  // Prévia: 4-6 artes de destaque
  previewImages: [
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=500&fit=crop',
  ],

  features: [
    { icon: '🎨', text: '40 artes para feed (2160x2700)' },
    { icon: '📱', text: '40 artes para story (2160x3840)' },
    { icon: '✍️', text: '40 legendas prontas' },
    { icon: '⭐', text: '10 capas para destaques' },
    { icon: '🎬', text: 'Vídeo tutorial de como editar' },
    { icon: '📂', text: 'Arquivos Canva e Photoshop' },
    { icon: '💬', text: 'Suporte via WhatsApp' },
    { icon: '⚡', text: 'Acesso imediato' },
    { icon: '🛡️', text: 'Garantia de 7 dias' },
  ],

  // Prints de feedback de clientes
  testimonials: [
    { image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=700&fit=crop' },
    { image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=700&fit=crop' },
    { image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=700&fit=crop' },
  ],

  pricing: {
    originalPrice: '97,90',
    salePriceMain: '37',
    salePriceCents: '90',
    features: [
      '40 artes para feed (2160x2700)',
      '40 artes para story (2160x3840)',
      '40 Legendas prontas',
      '10 Capas para destaques',
      'Vídeo tutorial de como editar',
      'Arquivos Canva e Photoshop',
      'Suporte via WhatsApp',
      'Acesso imediato',
      'Garantia de 7 dias',
    ],
    ctaLink: 'https://pay.hotmart.com/SEU_LINK_AQUI',
    ctaText: 'Garantir Desconto',
  },

  whatsappLink: 'https://wa.me/5564993237320',
  whatsappText: 'Ficou com alguma dúvida? Fale diretamente conosco pelo WhatsApp. Respondemos rápido!',

  guarantee: {
    title: 'Garantia incondicional de 7 dias',
    description: 'Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.',
  },

  faqs: [
    {
      question: 'Como vou receber os arquivos?',
      answer: 'Após a confirmação do pagamento, você receberá um e-mail com acesso imediato à área de membros onde poderá baixar todos os arquivos.',
    },
    {
      question: 'Preciso saber usar Canva ou Photoshop?',
      answer: 'Não! Incluímos um vídeo tutorial completo ensinando passo a passo como editar todas as artes. É super simples!',
    },
    {
      question: 'Posso usar as artes para meus clientes?',
      answer: 'Sim! As artes podem ser usadas para você ou para seus clientes. Não há restrição de uso comercial.',
    },
    {
      question: 'As artes são editáveis?',
      answer: '100%! Todas as artes são totalmente editáveis no Canva (gratuito) e no Photoshop. Você pode trocar cores, textos, imagens e fontes.',
    },
    {
      question: 'Qual a forma de pagamento?',
      answer: 'Aceitamos cartão de crédito (até 12x), PIX, boleto bancário e PayPal. O pagamento é processado pela Hotmart, plataforma 100% segura.',
    },
    {
      question: 'E se eu não gostar?',
      answer: 'Você tem 7 dias de garantia incondicional. Se não ficar satisfeito, devolvemos 100% do valor investido.',
    },
  ],
}

export default function ProvedorInternetLP() {
  return <LandingPage data={LP_DATA} />
}
