import { NotifierOrchestrator } from '../../services/notifier.orchestrator'

export default defineEventHandler(async (event) => {
  const isVercelCron = getHeader(event, 'x-vercel-cron') === '1'
  const authHeader = getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')
  const adminKey = getHeader(event, 'x-admin-key') || authHeader || getQuery(event).secret
  const expectedSecret = process.env.CRON_SECRET || process.env.ADMIN_SECRET_KEY

  if (!isVercelCron && expectedSecret && adminKey !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized: Invalid admin or cron key' })
  }

  const query = getQuery(event)
  const isDryRun = query.dryRun === 'true' || query.dryRun === '1'
  const targetDate = query.date as string | undefined

  const orchestrator = new NotifierOrchestrator({
    dryRun: isDryRun ? true : undefined
  })

  try {
    const result = await orchestrator.runDailyDigestCycle(targetDate)
    return {
      success: true,
      data: result
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: err.message || 'Error executing daily digest cycle'
    })
  }
})
