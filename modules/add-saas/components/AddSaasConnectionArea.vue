<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import ProviderTutorial from './ProviderTutorial.vue'
import AddSaasInput from './AddSaasInput.vue'

const props = defineProps<{
  provider: 'stripe' | 'mercadopago' | 'whop' | 'none' | null
  detectedMrr: number | null
  isMpConnecting: boolean
  openMpAuth: () => void
}>()

const apiKey = defineModel<string>('apiKey', { default: '' })

const rawApiKey = ref('')
const companyId = ref('')
const stripeProductId = ref('')
const stripeProducts = ref<{id: string, name: string}[]>([])
const isLoadingStripeProducts = ref(false)

watch([rawApiKey, companyId, stripeProductId], ([newRaw, newComp, newProd]) => {
  if (props.provider === 'whop' && newComp.trim()) {
    apiKey.value = `${newComp.trim()}:${newRaw.trim()}`
  } else if (props.provider === 'stripe' && newProd.trim()) {
    apiKey.value = `${newProd.trim()}:${newRaw.trim()}`
  } else {
    apiKey.value = newRaw.trim()
  }
})

// Initialize local refs if apiKey already has a value
watch(apiKey, (newVal) => {
  if (!newVal) {
    rawApiKey.value = ''
    companyId.value = ''
    stripeProductId.value = ''
    return
  }
  if (props.provider === 'whop' && newVal.includes(':') && newVal.startsWith('biz_')) {
    const parts = newVal.split(':')
    companyId.value = parts[0]
    rawApiKey.value = parts.slice(1).join(':')
  } else if (props.provider === 'stripe' && newVal.includes(':') && newVal.startsWith('prod_')) {
    const parts = newVal.split(':')
    stripeProductId.value = parts[0]
    rawApiKey.value = parts.slice(1).join(':')
  } else if (rawApiKey.value !== newVal) {
    rawApiKey.value = newVal
  }
}, { immediate: true })

let timeout: any
watch(rawApiKey, (newVal) => {
  if (props.provider !== 'stripe') return
  const key = newVal.trim()
  if (key.startsWith('rk_') || key.startsWith('sk_')) {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      isLoadingStripeProducts.value = true
      try {
        const res = await $fetch<any>('/api/stripe/products', { method: 'POST', body: { apiKey: key } })
        stripeProducts.value = res.products || []
        if (stripeProducts.value.length === 1 && !stripeProductId.value) {
          stripeProductId.value = stripeProducts.value[0].id
        }
      } catch (e) {
        stripeProducts.value = []
      } finally {
        isLoadingStripeProducts.value = false
      }
    }, 500)
  } else {
    stripeProducts.value = []
    if (!key.includes(':')) stripeProductId.value = ''
  }
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <ProviderTutorial :provider="provider" />

    <div v-if="provider === 'stripe'" class="flex flex-col gap-2">
      <AddSaasInput
        v-model="rawApiKey"
        label="2. Stripe Restricted Key"
        type="password"
        placeholder="rk_live_..."
      />
      
      <div v-if="isLoadingStripeProducts" class="text-[10px] text-[#00D4FF] font-sans animate-pulse px-1 mt-1">
        Buscando productos...
      </div>
      
      <div v-else-if="stripeProducts.length > 1" class="flex flex-col gap-1.5 mt-2 animate-in fade-in slide-in-from-top-2">
        <label class="text-[10px] uppercase font-bold text-[#00D4FF] ml-1 tracking-widest opacity-80">
          3. Selecciona tu Producto
        </label>
        <div class="relative">
          <select 
            v-model="stripeProductId"
            class="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white font-sans focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all duration-300 appearance-none"
          >
            <option value="" disabled>Selecciona el producto de esta startup...</option>
            <option v-for="p in stripeProducts" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <p class="text-[10px] text-white/40 ml-1">Hemos detectado múltiples proyectos en esta cuenta.</p>
      </div>
    </div>

    <div v-else-if="provider === 'whop'" class="flex flex-col gap-2">
      <AddSaasInput
        v-model="companyId"
        label="2. Company ID (biz_...)"
        type="text"
        placeholder="biz_..."
      />
      <AddSaasInput
        v-model="rawApiKey"
        label="3. Whop API Key"
        type="password"
        placeholder="whop_..."
      />
    </div>

    <div v-else-if="provider === 'mercadopago'" class="flex flex-col gap-4">
      <div v-if="detectedMrr !== null" class="bg-[#00D4FF]/10 border border-[#00D4FF]/20 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in zoom-in duration-300">
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] uppercase font-bold text-[#00D4FF]">MRR Detectado</span>
          <span class="text-sm font-serif text-white">${{ detectedMrr.toLocaleString() }}</span>
        </div>
        <div class="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <button
        v-else
        type="button"
        @click="openMpAuth"
        :disabled="isMpConnecting"
        class="w-full py-3.5 rounded-xl border border-[#00D4FF]/30 bg-[#00D4FF]/10 text-white font-sans font-bold text-[10px] uppercase tracking-widest hover:bg-[#00D4FF]/20 transition-all duration-300 flex items-center justify-center gap-3"
      >
        <svg v-if="isMpConnecting" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isMpConnecting ? 'Conectando...' : 'Conectar Mercado Pago' }}
      </button>
    </div>
  </div>
</template>
