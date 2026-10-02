import 'dotenv/config'
import { NotifierOrchestrator } from '../modules/notifier/server/services/notifier.orchestrator'

async function main() {
  console.log('--- [Facto Notifier] Initializing Platform Baseline Snapshot ---')
  const orchestrator = new NotifierOrchestrator()

  try {
    const res = await orchestrator.initializeBaseline()
    console.log(res.message)
    console.log(`- Startups captured: ${res.state.ranking.length}`)
    console.log(`- Countries tracked: ${Object.keys(res.state.countries).length}`)
    console.log(`- Global Revenue: $${res.state.global.totalRevenue}`)
    process.exit(0)
  } catch (err: any) {
    console.error('[Facto Notifier] Baseline Initialization Error:', err)
    process.exit(1)
  }
}

main()
