<script setup lang="ts">
import type { PaymentProvider } from '~/modules/add-saas/types'

const model = defineModel<PaymentProvider | undefined>()

const providers = [
  {
    slug: 'stripe' as PaymentProvider,
    name: 'Stripe',
    description: 'Restricted Key con permisos de suscripciones',
    color: '#635BFF',
  },
  {
    slug: 'mercadopago' as PaymentProvider,
    name: 'MercadoPago',
    description: 'Access Token de producción',
    color: '#00B1EA',
  },
]
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <button
      v-for="p in providers"
      :key="p.slug"
      type="button"
      @click="model = p.slug"
      :class="[
        'relative group flex flex-col gap-3 p-5 rounded-2xl border text-left transition-all duration-300',
        model === p.slug
          ? 'border-[#00D4FF]/80 bg-[#00D4FF]/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]'
          : 'border-white/20 bg-white/[0.05] hover:border-white/40 hover:bg-white/[0.08]'
      ]"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          :style="{ backgroundColor: p.color + '33', border: `1px solid ${p.color}66` }"
        >
          <span class="text-xs font-bold" :style="{ color: p.color }">{{ p.name[0] }}</span>
        </div>
        <span class="text-sm text-white font-sans font-medium tracking-wide">{{ p.name }}</span>
        <span
          v-if="model === p.slug"
          class="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style="background: rgba(0,212,255,0.3); border: 1px solid rgba(0,212,255,0.6)"
        >
          <svg width="10" height="10" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3.5 6L6.5 2" stroke="#00D4FF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
      <p class="text-xs text-neutral-400 font-sans font-light tracking-[0.04em] leading-relaxed">{{ p.description }}</p>
    </button>
  </div>
</template>
