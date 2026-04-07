<script setup lang="ts">
import ProviderSelector from '../components/ProviderSelector.vue'
import MrrStatusBadge from '../components/MrrStatusBadge.vue'
import type { PaymentProvider, SaasSubmission, ProviderValidationResult } from '~/modules/add-saas/types'

const props = defineProps<{ saasData: Partial<SaasSubmission> }>()
const emit = defineEmits<{ publish: [data: SaasSubmission]; skip: [] }>()

const provider = ref<PaymentProvider | undefined>()
const apiKey = ref('')
const validating = ref(false)
const publishing = ref(false)
const validationResult = ref<ProviderValidationResult | null>(null)
const validationError = ref('')

const mrrStatus = computed(() => {
  if (!validationResult.value) return 'pending' as const
  if (!validationResult.value.valid) return 'blocked' as const
  if (validationResult.value.mrr === 0) return 'zero' as const
  return 'connected' as const
})

const canValidate = computed(() => !!provider.value && apiKey.value.trim().length > 0)

async function validateKey() {
  if (!canValidate.value) return
  validating.value = true
  validationError.value = ''
  validationResult.value = null
  try {
    const res = await $fetch<ProviderValidationResult>('/api/add-saas/validate', {
      method: 'POST',
      body: { providerSlug: provider.value, providerKey: apiKey.value.trim() },
    })
    validationResult.value = res
  } catch {
    validationError.value = 'No se pudo conectar. Verifica tu key e inténtalo de nuevo.'
  } finally {
    validating.value = false
  }
}

async function publishWithKey() {
  if (!validationResult.value?.valid) return
  publishing.value = true
  emit('publish', {
    ...props.saasData,
    isIncognito: false,
    providerSlug: provider.value,
    providerKey: apiKey.value.trim(),
  } as SaasSubmission)
}

function publishWithoutKey() {
  emit('publish', { ...props.saasData, isIncognito: false } as SaasSubmission)
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <h2 class="font-serif text-3xl md:text-5xl text-white leading-tight tracking-tight">
        Conecta tu MRR<br/>
        <span class="text-[#00D4FF]">opcionalmente</span>
      </h2>
      <p class="text-sm font-sans font-light text-neutral-400 tracking-[0.06em]">
        Conectar tu procesador de pagos permite mostrar tu MRR real en el ranking.
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-2.5">
        <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">Procesador de pagos</label>
        <ProviderSelector v-model="provider" />
      </div>

      <div v-if="provider" class="flex flex-col gap-3">
        <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">API Key</label>
        <div class="flex gap-2">
          <input
            v-model="apiKey"
            type="password"
            placeholder="sk_live_... (solo lectura)"
            class="flex-1 bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
            @keydown.enter="validateKey"
          />
          <button
            type="button"
            @click="validateKey"
            :disabled="!canValidate || validating"
            class="shrink-0 px-6 py-4 rounded-xl text-[11px] font-sans font-bold uppercase tracking-widest border border-white/20 text-white transition-all duration-300 hover:border-[#00D4FF]/60 hover:bg-[#00D4FF]/10 disabled:opacity-30"
          >
            {{ validating ? '...' : 'Verificar' }}
          </button>
        </div>

        <p v-if="validationError" class="text-xs text-red-400 font-sans font-light">{{ validationError }}</p>

        <MrrStatusBadge
          v-if="validationResult"
          :status="mrrStatus"
          :mrr="validationResult.mrr"
          :currency="validationResult.currency"
        />
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
      <button
        v-if="validationResult?.valid"
        @click="publishWithKey"
        :disabled="publishing"
        class="add-btn group flex items-center gap-2.5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full px-8 py-4 transition-all duration-700 hover:scale-[1.03] disabled:opacity-50"
      >
        {{ publishing ? 'Publicando...' : 'Publicar con MRR' }}
        <svg class="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button
        @click="publishWithoutKey"
        :disabled="publishing"
        class="text-xs font-sans font-medium text-neutral-400 hover:text-[#00D4FF] transition-colors duration-300 tracking-[0.08em] uppercase disabled:opacity-50"
      >
        Publicar sin MRR <span class="ml-1 opacity-50">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.add-btn:hover {
  box-shadow: 0 0 15px rgba(255,255,255,0.5), 0 0 30px rgba(0,212,255,0.3), 0 0 45px rgba(0,212,255,0.1);
}
</style>
