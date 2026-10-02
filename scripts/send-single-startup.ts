import 'dotenv/config'
import { TelegramClient } from '../modules/notifier/server/services/telegram.client'
import { renderNewStartupMessage } from '../modules/notifier/server/services/formatters/message.templates'

async function main() {
  const client = new TelegramClient({ dryRun: false })
  const channelId = process.env.TELEGRAM_CHANNEL_ID || '@factosaas'

  const rendered = renderNewStartupMessage({
    startups: [
      {
        id: 'demo-single-1',
        name: 'Fractal Asistencia',
        slug: 'fractal-asistencia',
        category: 'Productivity & Ops',
        country: 'España',
        countryFlag: '🇪🇸',
        mrr: 2450,
        currency: 'USD',
        isIncognito: false,
        description: 'Plataforma para la gestión integral de asistencias, licencias de personal y comunicación corporativa en una sola app'
      }
    ]
  })

  console.log(`Enviando notificación formateada a ${channelId}...`)
  console.log('--- Texto ---')
  console.log(rendered.text)
  console.log('-------------')

  const result = await client.sendMessage({
    chatId: channelId,
    text: rendered.text,
    parseMode: 'HTML',
    disableWebPagePreview: false,
    preferLargeMedia: true
  })

  console.log('✅ Mensaje enviado con éxito:', result)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})

