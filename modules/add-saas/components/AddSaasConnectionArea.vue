<script setup lang="ts">
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

watch([rawApiKey, companyId], ([newRaw, newComp]) => {
  if (props.provider === 'whop' && newComp.trim()) {
    apiKey.value = `${newComp.trim()}:${newRaw.trim()}`
  } else {
    apiKey.value = newRaw.trim()
  }
})

// Initialize local refs if apiKey already has a value
watch(apiKey, (newVal) => {
  if (!newVal) {
    rawApiKey.value = ''
    companyId.value = ''
    return
  }
  if (props.provider === 'whop' && newVal.includes(':') && newVal.startsWith('biz_')) {
    const parts = newVal.split(':')
    companyId.value = parts[0]
    rawApiKey.value = parts.slice(1).join(':')
  } else if (rawApiKey.value !== newVal) {
    rawApiKey.value = newVal
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-5">
    <ProviderTutorial :provider="provider" />

    <div v-if="provider === 'stripe'" class="flex flex-col gap-2">
      <AddSaasInput
        v-model="apiKey"
        label="2. Stripe Restricted Key"
        type="password"
        placeholder="sk_live_..."
      />
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
