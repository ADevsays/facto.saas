<script setup lang="ts">
import { ref } from 'vue'
import { useAdFreeModal } from '~/composables/useAdFreeModal'
import { useFounderSession } from '~/composables/useFounderSession'

const { isOpen, close } = useAdFreeModal()
const { founder } = useFounderSession()

const loading = ref(false)
const errorMessage = ref('')

async function handleProceedToPayment() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ ok: boolean; checkoutUrl: string }>('/api/ads/ad-free-checkout', {
      method: 'POST',
      body: {
        email: founder.value?.email
      }
    })
    if (res?.checkoutUrl) {
      window.open(res.checkoutUrl, '_blank')
      close()
      loading.value = false
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Error al conectar con la pasarela de pago.'
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        @click.self="close"
      >
        <div class="w-full max-w-md rounded-3xl bg-[#0c0c10] border border-white/15 p-6 md:p-8 relative shadow-2xl overflow-hidden flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
          <!-- Ambient Glow Effect -->
          <div class="absolute -top-20 -right-20 w-48 h-48 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Close Button -->
          <button
            @click="close"
            class="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
            aria-label="Cerrar modal"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <!-- Header -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF]">
                Experiencia Limpia
              </span>
            </div>
            <h3 class="font-serif text-2xl md:text-3xl text-white font-medium tracking-tight">
              Quitar Anuncios
            </h3>
            <p class="font-sans text-xs md:text-sm text-neutral-400 font-extralight tracking-[0.04em] leading-relaxed">
              Elimina todos los anuncios, banners y puestos patrocinados de Facto de forma permanente.
            </p>
          </div>

          <!-- Pricing & What You Get Card -->
          <div class="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div class="flex items-baseline justify-between border-b border-white/5 pb-3">
              <div class="flex items-baseline gap-1.5">
                <span class="font-serif text-3xl md:text-4xl text-white font-bold">$10</span>
                <span class="text-xs font-mono text-neutral-400">USD</span>
              </div>
              <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Pago único de por vida
              </span>
            </div>

            <!-- Features list -->
            <ul class="space-y-2.5 text-xs text-neutral-300 font-sans font-light">
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Sin marquesinas fijas de cabecera ni pie de página</span>
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Navegación 100% limpia en rankings y perfiles</span>
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Sin suscripciones ni cobros recurrentes</span>
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Activación instantánea para tu cuenta y navegador</span>
              </li>
            </ul>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sans">
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="space-y-3 pt-1">
            <button
              @click="handleProceedToPayment"
              :disabled="loading"
              class="group relative w-full inline-flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full py-3.5 px-6 transition-all duration-700 hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] disabled:opacity-50"
            >
              <span v-if="loading" class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              <template v-else>
                <span>Continuar al pago ($10 USD)</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-500 group-hover:translate-x-1">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </template>
            </button>

            <button
              @click="close"
              class="w-full text-center text-xs text-neutral-500 hover:text-neutral-300 font-sans transition-colors cursor-pointer py-1"
            >
              Quizás más tarde
            </button>
          </div>

          <!-- Footer Trust Badge -->
          <div class="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-mono">
            <svg class="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Procesado de forma segura a través de Whop</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
