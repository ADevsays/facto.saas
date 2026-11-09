<script setup lang="ts">
defineProps<{
  provider: 'stripe' | 'mercadopago' | 'whop' | 'conekta' | 'epayco' | 'polar' | 'dodo' | 'paddle' | 'revenuecat' | 'none'
}>()
</script>

<template>
  <div
    :class="[
      'provider-icon-square flex items-center justify-center rounded-lg overflow-hidden shrink-0',
    'w-8 h-8',
    ]"
    :style="{
    backgroundColor: provider === 'stripe' ? '#635BFF' : (provider === 'mercadopago' ? '#00B1EA' : (provider === 'whop' ? '#FF5A1F' : '#27272a'))
    }"
  >
    <!-- Logo Stripe -->
    <template v-if="provider === 'stripe'">
      <div class="w-full h-full flex items-center justify-center p-1.5">
        <img 
          src="/logos/stripe.png" 
          alt="Stripe" 
          class="w-full h-full object-contain"
        />
      </div>
    </template>

    <!-- Logo Mercado Pago -->
    <template v-else-if="provider === 'mercadopago'">
      <div class="w-full h-full bg-white flex items-center justify-center p-1.5">
        <img 
          src="/logos/mercadopago.png" 
          alt="Mercado Pago" 
          class="w-full h-full object-contain"
        />
      </div>
    </template>

    <!-- Logo Whop -->
    <template v-else-if="provider === 'whop'">
      <div class="w-full h-full flex items-center justify-center p-1.5">
        <img 
          src="/logos/whop.webp" 
          alt="Whop" 
          class="w-full h-full object-contain"
        />
      </div>
    </template>

    <template v-else-if="provider === 'epayco'">
      <div class="w-full h-full bg-white flex items-center justify-center p-1">
        <img src="/logos/epayco.webp" alt="ePayco" class="w-full h-full object-contain" />
      </div>
    </template>

    <template v-else-if="provider === 'conekta'">
      <div class="w-full h-full flex items-center justify-center bg-white">
        <img src="/logos/conekta.webp" alt="Conekta" class="w-full h-full object-cover" />
      </div>
    </template>
    <template v-else-if="['polar', 'dodo', 'paddle', 'revenuecat'].includes(provider)">
      <div class="flex h-full w-full items-center justify-center" :class="provider === 'polar' ? 'bg-black' : provider === 'dodo' ? 'bg-[#C6FE1E]' : provider === 'paddle' ? 'bg-[#FFD100]' : 'bg-[#F2545B]'">
        <img :src="`/logos/${provider}.webp`" :alt="provider" class="h-full w-full object-contain" />
      </div>
    </template>

    <!-- Icono Reloj (Más tarde) -->
    <template v-else>
      <div class="text-white flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
    </template>
  </div>
</template>

<style scoped>
.provider-icon-square {
  image-rendering: -webkit-optimize-contrast;
}
</style>
