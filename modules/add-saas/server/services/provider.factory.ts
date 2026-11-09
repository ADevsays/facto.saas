import type { PaymentProvider, PaymentProviderService } from '~/modules/add-saas/types'
import { stripeService } from './stripe.service'
import { mercadopagoService } from './mercadopago.service'
import { whopService } from './whop.service'
import { conektaService } from './conekta.service'
import { epaycoService } from './epayco.service'
import { polarService } from './polar.service'
import { dodoService } from './dodo.service'
import { paddleService } from './paddle.service'
import { revenueCatService } from './revenuecat.service'

const providers: Record<PaymentProvider, PaymentProviderService> = {
  stripe: stripeService,
  mercadopago: mercadopagoService,
  whop: whopService,
  conekta: conektaService,
  epayco: epaycoService,
  polar: polarService,
  dodo: dodoService,
  paddle: paddleService,
  revenuecat: revenueCatService,
}

export function getProvider(slug: PaymentProvider): PaymentProviderService {
  const service = providers[slug]
  if (!service) throw createError({ statusCode: 400, message: `Unknown provider: ${slug}` })
  return service
}
