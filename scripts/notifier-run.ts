import 'dotenv/config'
import { NotifierOrchestrator } from '../modules/notifier/server/services/notifier.orchestrator'

async function main() {
  console.log('--- [Facto Notifier] Running Milestone Cycle ---')
  const orchestrator = new NotifierOrchestrator()

  try {
    const result = await orchestrator.runMilestoneCycle()
    console.log('Result:', JSON.stringify(result, null, 2))
    process.exit(0)
  } catch (err: any) {
    console.error('[Facto Notifier] Fatal Error:', err)
    process.exit(1)
  }
}

main()
