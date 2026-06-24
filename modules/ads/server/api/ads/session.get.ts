import { whopService } from '~/server/services/whop'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = query.email as string

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const membership = await whopService.getActiveUnusedMembershipByEmail(email)

  if (!membership) {
    throw createError({ statusCode: 404, statusMessage: 'No active unused membership found for this email' })
  }

  return { ok: true, membership }
})
