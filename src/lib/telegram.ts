/**
 * Telegram Notification Service
 * Envia alertas instantâneos no Telegram do administrador quando novas
 * personalizações são vendidas ou preenchidas pelos clientes.
 */

export interface TelegramButton {
  text: string
  url: string
}

function getValidTelegramUrl(url: string): string {
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
    // Para botões do Telegram, URLs devem ser HTTPS públicas válidas
    return url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, 'https://bibliotecadepacks.com.br')
  }
  return url
}

export async function sendTelegramNotification(
  htmlText: string,
  buttons?: TelegramButton[][]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('⚠️ Telegram: TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configurados.')
    return false
  }

  // Sanitiza botões para garantir URLs HTTPS válidas
  const sanitizedButtons = (buttons || [])
    .map(row =>
      row
        .map(btn => ({ text: btn.text, url: getValidTelegramUrl(btn.url) }))
        .filter(btn => btn.url.startsWith('https://'))
    )
    .filter(row => row.length > 0)

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text: htmlText,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  if (sanitizedButtons.length > 0) {
    payload.reply_markup = {
      inline_keyboard: sanitizedButtons,
    }
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!data.ok) {
      console.error('❌ Erro da API do Telegram:', data)
      return false
    }

    return true
  } catch (error) {
    console.error('❌ Falha ao enviar notificação no Telegram:', error)
    return false
  }
}

/**
 * Notifica que uma nova personalização foi comprada
 */
export async function notifyNewCustomizationOrder({
  orderId,
  clientName,
  clientWhatsapp,
  clientEmail,
  packName,
  customizeLink,
}: {
  orderId: string
  clientName: string
  clientWhatsapp: string | null
  clientEmail: string
  packName: string
  customizeLink: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bibliotecadepacks.com.br'
  const cleanPhone = clientWhatsapp ? clientWhatsapp.replace(/\D/g, '') : ''
  const formattedPhone = cleanPhone
    ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`)
    : ''

  const clientFirstName = clientName ? clientName.split(' ')[0] : 'Cliente'

  const whatsappMessage = `Olá, ${clientFirstName}! Tudo bem? Aqui é o Pablo da Biblioteca de Packs 🎨\n\nPara começarmos a personalizar as suas artes do *${packName}*, preparei este link exclusivo para você preencher os dados de cada arte:\n\n👉 ${customizeLink}\n\nAssim que você preencher, já coloco em produção para você!`

  const whatsappUrl = formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : null

  const adminOrderUrl = `${appUrl}/admin/customizations/${orderId}`

  const text = `🎉 <b>NOVA PERSONALIZAÇÃO VENDIDA!</b>

📦 <b>Pack:</b> ${packName}
👤 <b>Cliente:</b> ${clientName || 'Não informado'}
📱 <b>WhatsApp:</b> ${clientWhatsapp || 'Não informado'}
✉️ <b>Email:</b> ${clientEmail}

👉 <i>Toque no botão abaixo para abrir a conversa no WhatsApp do cliente com a mensagem e o link já preenchidos:</i>`

  const buttons: TelegramButton[][] = []

  if (whatsappUrl) {
    buttons.push([
      {
        text: '💬 Abrir WhatsApp e Enviar Link',
        url: whatsappUrl,
      },
    ])
  }

  buttons.push([
    {
      text: '🌐 Abrir Pedido no Painel',
      url: adminOrderUrl,
    },
  ])

  return sendTelegramNotification(text, buttons)
}
