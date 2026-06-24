<script setup lang="ts">
import { useAddSaasModal } from '~/composables/useAddSaasModal'
import { useAddSaasForm } from '../composables/useAddSaasForm'
import { useMercadoPagoAuth } from '../composables/useMercadoPagoAuth'

import AddSaasHeader from './AddSaasHeader.vue'
import AddSaasSuccess from './AddSaasSuccess.vue'
import AddSaasProviderSelection from './AddSaasProviderSelection.vue'
import AddSaasConnectionArea from './AddSaasConnectionArea.vue'
import AddSaasFormFields from './AddSaasFormFields.vue'
import AddSaasFooter from './AddSaasFooter.vue'

const { isOpen, close } = useAddSaasModal()

const { 
  provider, 
  apiKey, 
  detectedMrr, 
  form, 
  loading, 
  success, 
  error,
  publishedData,
  onSubmit,
  reset 
} = useAddSaasForm()

const { isMpConnecting, openMpAuth } = useMercadoPagoAuth((mrr) => {
  detectedMrr.value = mrr
  apiKey.value = 'MERCADO_PAGO_OAUTH_TOKEN'
})

watch(isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function dismissSuccess() {
  success.value = false
  publishedData.value = null
  reset()
}
</script>

<template>
  <!-- ═══ SUCCESS OVERLAY (independent from modal) ═══ -->
  <Transition name="backdrop">
    <div v-if="success" class="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md" @click="dismissSuccess" />
  </Transition>
  <Transition name="fade">
    <div v-if="success" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
      <div class="relative w-full max-w-md bg-[#0c0c10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col pointer-events-auto">
        <AddSaasSuccess 
          :is-update="!!form.id" 
          :published-data="publishedData"
          @close-modal="dismissSuccess"
        />
      </div>
    </div>
  </Transition>

  <!-- ═══ FORM MODAL ═══ -->
  <Transition name="backdrop">
    <div v-if="isOpen" class="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md" @click="close" />
  </Transition>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
      <div class="relative w-full max-w-lg bg-[#0c0c10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] pointer-events-auto">
        <AddSaasHeader :on-close="close" />

        <div class="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-7 custom-scrollbar">
          <div class="bg-white/[0.03] border border-white/5 rounded-xl p-3.5">
            <p class="text-sm font-sans font-light text-neutral-400 leading-relaxed">
              <span class="text-white font-semibold">¿Tu startup es invisible?</span> Verifica tu MRR para destacar frente al mercado.
            </p>
          </div>

          <AddSaasProviderSelection v-model="provider" />

          <AddSaasConnectionArea 
            :provider="provider"
            :detected-mrr="detectedMrr"
            :is-mp-connecting="isMpConnecting"
            :open-mp-auth="openMpAuth"
            v-model:apiKey="apiKey"
          />

          <AddSaasFormFields :form="form" />

          <p v-if="error" class="text-xs text-red-100 font-sans font-light bg-red-400/20 p-4 rounded-xl border border-red-400/30">
            {{ error }}
          </p>
        </div>

        <AddSaasFooter :loading="loading" :on-submit="onSubmit" :is-update="!!form.id" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.backdrop-leave-active { transition: opacity 0.3s ease; }
.backdrop-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.3); }
</style>
