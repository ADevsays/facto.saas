import 'dotenv/config'
import { NotifierOrchestrator } from '../modules/notifier/server/services/notifier.orchestrator'

async function main() {
  console.log('--- [Facto Notifier] Sending Test Diagnostic Message ---')
  const orchestrator = new NotifierOrchestrator()

  try {
    const channelId = orchestrator.telegramClient.getDefaultChannelId()
    if (channelId) {
      console.log(`Sending test message to channel: ${channelId}`)
      const resChannel = await orchestrator.sendTestMessage(channelId)
      console.log('Channel Message Sent Successfully:', resChannel)
    }

    const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID
    if (adminId && adminId !== channelId) {
      console.log(`Sending test message to admin chat: ${adminId}`)
      const resAdmin = await orchestrator.sendTestMessage(adminId)
      console.log('Admin Message Sent Successfully:', resAdmin)
    }

    process.exit(0)
  } catch (err: any) {
    console.error('[Facto Notifier] Test Message Error:', err.message)
    process.exit(1)
  }
}

main()
