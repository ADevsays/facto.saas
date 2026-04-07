import type { PaymentProvider } from '~/modules/add-saas/types'
import { getProvider } from '../services/provider.factory'

export default defineEventHandler(async (event) => {
  const { providerSlug, providerKey } = await readBody<{ providerSlug: PaymentProvider; providerKey: string }>(event)

  if (!providerSlug || !providerKey) {
    throw createError({ statusCode: 400, message: 'providerSlug and providerKey are required' })
  }

  const service = getProvider(providerSlug)
  return service.validate(providerKey)
})
