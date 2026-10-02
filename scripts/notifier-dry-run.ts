import 'dotenv/config'
import { NotifierOrchestrator } from '../modules/notifier/server/services/notifier.orchestrator'

async function main() {
  console.log('--- [Facto Notifier] Running DRY-RUN Simulation ---')
  console.log('No messages will be sent to real Telegram users.')

  const orchestrator = new NotifierOrchestrator({ dryRun: true })

  try {
    const currentState = await orchestrator.snapshotService.captureCurrentState()
    console.log(`\nPlatform Current Snapshot (${currentState.date}):`)
    console.log(`- Startups ranked: ${currentState.ranking.length}`)
    console.log(`- Global Revenue: $${currentState.global.totalRevenue}`)
    console.log(`- Platform visits: ${currentState.visits.today}`)

    const milestoneRes = await orchestrator.runMilestoneCycle()
    console.log('\nMilestone Detection & Outbox Dispatch (DRY RUN):', milestoneRes)

    const digestRes = await orchestrator.runDailyDigestCycle()
    console.log('\nDaily Digest Simulation (DRY RUN):', digestRes)

    process.exit(0)
  } catch (err: any) {
    console.error('[Facto Notifier] Dry-run Error:', err)
    process.exit(1)
  }
}

main()
