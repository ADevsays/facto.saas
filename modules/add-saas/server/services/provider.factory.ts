import type { PaymentProvider, PaymentProviderService } from '~/modules/add-saas/types'
import { stripeService } from './stripe.service'
import { mercadopagoService } from './mercadopago.service'
import { whopService } from './whop.service'

const providers: Record<PaymentProvider, PaymentProviderService> = {
  stripe: stripeService,
  mercadopago: mercadopagoService,
  whop: whopService,
}

export function getProvider(slug: PaymentProvider): PaymentProviderService {
  const service = providers[slug]
  if (!service) throw createError({ statusCode: 400, message: `Unknown provider: ${slug}` })
  return service
}
