<script setup lang="ts">
import { computed } from 'vue'
import ProviderPicker from './ProviderPicker.vue'
import type { PaymentProvider } from '~/modules/add-saas/types'

type ProviderSlug = PaymentProvider | 'none'
const model = defineModel<ProviderSlug | null>()

import es from '../locales/es.json'
import en from '../locales/en.json'
const { t } = useLanguage({ es, en })

const options = computed(() => [
  { slug: 'stripe' as ProviderSlug, name: 'Stripe', available: true },
  { slug: 'mercadopago' as ProviderSlug, name: 'Mercado Pago', available: true },
  { slug: 'whop' as ProviderSlug, name: 'Whop', available: true },
  { slug: 'conekta' as ProviderSlug, name: 'Conekta', available: true },
  { slug: 'epayco' as ProviderSlug, name: 'ePayco', available: true },
  { slug: 'polar' as ProviderSlug, name: 'Polar', available: true },
  { slug: 'dodo' as ProviderSlug, name: 'Dodo Payments', available: true },
  { slug: 'paddle' as ProviderSlug, name: 'Paddle', available: true },
  { slug: 'revenuecat' as ProviderSlug, name: 'RevenueCat', available: true },
  { slug: 'none' as ProviderSlug, name: t.value.provider.later, available: true },
])
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">
      {{ t.provider.select }}
    </label>
    <ProviderPicker
      v-model="model"
      :options="options"
      :placeholder="t.provider.choose"
      :search-placeholder="t.provider.searchPlaceholder"
      :no-results="t.provider.searchEmpty"
    />
    <p v-if="model === 'none'" class="mt-1 text-[10px] font-sans font-light leading-relaxed tracking-wide text-amber-400/70">
      {{ t.provider.manualReview }}
    </p>
  </div>
</template>
