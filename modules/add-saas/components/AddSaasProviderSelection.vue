<script setup lang="ts">
import ProviderIcon from './ProviderIcon.vue'
import AddSaasProviderButton from './AddSaasProviderButton.vue'

const model = defineModel<'stripe' | 'mercadopago' | 'none' | null>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">
      Escoge tu proveedor
    </label>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <AddSaasProviderButton
        id="stripe"
        :active="model === 'stripe'"
        label="Stripe"
        @click="model = 'stripe'"
      >
        <template #icon>
          <ProviderIcon provider="stripe" />
        </template>
      </AddSaasProviderButton>

      <AddSaasProviderButton
        id="mercadopago"
        :active="model === 'mercadopago'"
        label="Mercado Pago"
        @click="model = 'mercadopago'"
        compact
      >
        <template #icon>
          <ProviderIcon provider="mercadopago" />
        </template>
      </AddSaasProviderButton>

      <AddSaasProviderButton
        id="none"
        :active="model === 'none'"
        label="Más tarde"
        @click="model = 'none'"
      >
        <template #icon>
          <ProviderIcon provider="none" />
        </template>
      </AddSaasProviderButton>
    </div>
  </div>
</template>
