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
  language = 'pt',
}: {
  orderId: string
  clientName: string
  clientWhatsapp: string | null
  clientEmail: string
  packName: string
  customizeLink: string
  language?: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bibliotecadepacks.com.br'
  const isEs = language === 'es'
  const cleanPhone = clientWhatsapp ? clientWhatsapp.replace(/\D/g, '') : ''
  const formattedPhone = cleanPhone
    ? (!isEs && !cleanPhone.startsWith('55') && (cleanPhone.length === 10 || cleanPhone.length === 11)
        ? `55${cleanPhone}`
        : cleanPhone)
    : ''

  const clientFirstName = clientName ? clientName.trim().split(' ')[0] : 'Cliente'

  const whatsappMessage = isEs
    ? `Hola, ${clientFirstName}! Cómo estás? Soy Pablo.

Te escribo para comenzar con la personalización de tus diseños. 😊

Para empezar, necesito que me envíes *tu logotipo en la mejor calidad posible*.

También preparé un enlace exclusivo para que completes los datos que aparecerán en los diseños.

Es muy sencillo: solo tienes que hacer clic en cada diseño y completar los campos solicitados. Por favor, ten en cuenta que solo es posible modificar la velocidad y el precio de los planes, *sin agregar información adicional.*

*Un consejo:* si algún dato se repite en todos los diseños, como tu número de WhatsApp, por ejemplo, no hace falta que lo escribas varias veces. ¡Con ponerlo en uno solo es suficiente!

*Ingresa aquí para completarlo:*
${customizeLink}

En cuanto reciba tu logotipo y termines de llenar los datos, ¡comenzaremos con la personalización de tus diseños! 😊`
    : `Olá, ${clientFirstName}! Tudo bem? Aqui é o Pablo!

Estou entrando em contato para darmos início à personalização das suas artes. 😊

Para começarmos, preciso que me envie *seu logotipo na melhor qualidade possível*.

Também preparei um link exclusivo para você preencher as informações que deverão aparecer nas artes.

É bem simples: basta clicar em cada arte e preencher os campos solicitados.

*Uma dica:* se alguma informação se repetir em todas as artes, como o número do WhatsApp, por exemplo, não precisa preencher várias vezes. Basta informar em uma delas!

*Acesse aqui para preencher:*
${customizeLink}

Assim que receber seu logotipo e você finalizar o preenchimento, já daremos início à personalização das artes! 😊`

  const whatsappUrl = formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : null

  const adminOrderUrl = `${appUrl}/admin/customizations/${orderId}`

  const text = `🎉 <b>NOVA PERSONALIZAÇÃO VENDIDA!</b>${isEs ? ' 🇪🇸 (Espanhol)' : ' 🇧🇷'}

📦 <b>Pack:</b> ${packName}
👤 <b>Cliente:</b> ${clientName || 'Não informado'}
📱 <b>WhatsApp:</b> ${clientWhatsapp || 'Não informado'}
✉️ <b>Email:</b> ${clientEmail}
${isEs ? '🌐 <b>Idioma:</b> Espanhol\n' : ''}
👉 <i>Toque no botão abaixo para abrir a conversa no WhatsApp do cliente com a mensagem e o link já preenchidos:</i>`

  const buttons: TelegramButton[][] = []

  if (whatsappUrl) {
    buttons.push([
      {
        text: isEs ? '💬 Abrir WhatsApp (Mensagem em Espanhol)' : '💬 Abrir WhatsApp e Enviar Link',
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
