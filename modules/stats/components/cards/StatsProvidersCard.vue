<script setup lang="ts">
import type { StatProviderPoint } from '../../types'
import ProviderIcon from '~/modules/add-saas/components/ProviderIcon.vue'
import es from '../../locales/es.json'
import en from '../../locales/en.json'

defineProps<{ providers: StatProviderPoint[] }>()
const { t } = useLanguage({ es, en })
const localePath = useLocalePath()
const providerNames: Record<string, string> = { stripe: 'Stripe', mercadopago: 'Mercado Pago', whop: 'Whop', conekta: 'Conekta', epayco: 'ePayco', polar: 'Polar', dodo: 'Dodo Payments', paddle: 'Paddle', revenuecat: 'RevenueCat' }
function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <article class="lg:col-span-3 rounded-3xl bg-surface-elevated border border-white/10 p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="font-serif text-xl sm:text-2xl text-white">{{ t?.bento?.providers_title }}</h2>
      <p class="mt-1 text-xs font-sans text-neutral-400">{{ t?.bento?.providers_sub }}</p>
    </div>
    <div v-if="providers.length" class="overflow-x-auto">
      <table class="w-full min-w-[560px] text-left">
        <thead><tr class="border-b border-white/10 text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          <th class="pb-3 pr-4 font-medium">{{ t?.bento?.provider_name }}</th>
          <th class="pb-3 px-4 text-right font-medium">{{ t?.bento?.provider_revenue }}</th>
          <th class="pb-3 px-4 text-right font-medium">{{ t?.bento?.provider_startups }}</th>
          <th class="pb-3 pl-4 text-right font-medium">{{ t?.bento?.provider_average }}</th>
        </tr></thead>
        <tbody><tr v-for="(provider, index) in providers" :key="provider.slug" class="border-b border-white/[0.06] last:border-0">
          <td class="py-4 pr-4 text-sm text-white">
            <span class="mr-2 text-neutral-500">{{ String(index + 1).padStart(2, '0') }}</span>
            <NuxtLink :to="localePath(`/saas/proveedor/${provider.slug}`)" class="inline-flex items-center gap-2 rounded-md outline-none transition-colors hover:text-[#00D4FF] focus-visible:ring-2 focus-visible:ring-[#00D4FF]">
              <ProviderIcon :provider="provider.slug as 'stripe' | 'mercadopago' | 'whop' | 'conekta' | 'epayco' | 'polar' | 'dodo' | 'paddle' | 'revenuecat'" class="!h-6 !w-6" />
              {{ providerNames[provider.slug] || provider.slug }}
            </NuxtLink>
          </td>
          <td class="py-4 px-4 text-right text-sm tabular-nums text-white">{{ money(provider.revenue) }}</td>
          <td class="py-4 px-4 text-right text-sm tabular-nums text-neutral-300">{{ provider.startups }}</td>
          <td class="py-4 pl-4 text-right text-sm tabular-nums text-neutral-300">{{ money(provider.averageRevenue) }}</td>
        </tr></tbody>
      </table>
    </div>
    <p v-else class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center text-sm text-neutral-500">{{ t?.bento?.providers_empty }}</p>
  </article>
</template>
