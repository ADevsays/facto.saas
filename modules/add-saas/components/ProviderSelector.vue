<script setup lang="ts">
import { computed } from 'vue'
import type { PaymentProvider } from '~/modules/add-saas/types'
import ProviderPicker from './ProviderPicker.vue'

const model = defineModel<PaymentProvider | undefined>()

import es from '../locales/es.json'
import en from '../locales/en.json'
const { t } = useLanguage({ es, en })

const options = computed(() => [
  { slug: 'stripe' as PaymentProvider, name: 'Stripe', available: true },
  { slug: 'mercadopago' as PaymentProvider, name: 'Mercado Pago', available: true },
  { slug: 'whop' as PaymentProvider, name: 'Whop', available: true },
  { slug: 'conekta' as PaymentProvider, name: 'Conekta', available: true },
  { slug: 'epayco' as PaymentProvider, name: 'ePayco', available: true },
  { slug: 'polar' as PaymentProvider, name: 'Polar', available: true },
  { slug: 'dodo' as PaymentProvider, name: 'Dodo Payments', available: true },
  { slug: 'paddle' as PaymentProvider, name: 'Paddle', available: true },
  { slug: 'revenuecat' as PaymentProvider, name: 'RevenueCat', available: true },
])
</script>

<template>
  <ProviderPicker
    v-model="model"
    :options="options"
    :placeholder="t.provider.choose"
    :search-placeholder="t.provider.searchPlaceholder"
    :no-results="t.provider.searchEmpty"
  />
</template>
