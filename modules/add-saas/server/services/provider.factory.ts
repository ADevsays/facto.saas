import type { PaymentProvider, PaymentProviderService } from '~/modules/add-saas/types'
import { stripeService } from './stripe.service'
import { mercadopagoService } from './mercadopago.service'

const providers: Record<PaymentProvider, PaymentProviderService> = {
  stripe: stripeService,
  mercadopago: mercadopagoService,
}

export function getProvider(slug: PaymentProvider): PaymentProviderService {
  const service = providers[slug]
  if (!service) throw createError({ statusCode: 400, message: `Unknown provider: ${slug}` })
  return service
}
