<script setup lang="ts">
import { ref } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'verify', email: string): void
}>()

const emailInput = ref('')

function handleFormSubmit() {
  const trimmed = emailInput.value.trim().toLowerCase()
  if (!trimmed || props.loading) return
  emit('verify', trimmed)
}
</script>

<template>
  <section class="bg-surface-elevated border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 transition-all duration-300 hover:border-white/15">
    <div class="flex items-start justify-between gap-4 pb-3 border-b border-white/5">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF]">
            {{ t.ads?.verify_badge || 'Sincronización Whop' }}
          </span>
        </div>
        <h3 class="font-serif text-lg md:text-xl text-white font-medium tracking-tight">
          {{ t.ads?.verify_title || 'Vincular compras realizadas con otro correo' }}
        </h3>
        <p class="font-sans text-xs md:text-sm text-neutral-400 font-extralight tracking-[0.04em] leading-relaxed max-w-2xl">
          {{ t.ads?.verify_desc || 'Si adquiriste tus anuncios o el pase sin anuncios en Whop con un correo electrónico diferente al de esta sesión, ingrésalo aquí para verificar y sincronizar tus compras con tu cuenta.' }}
        </p>
      </div>
    </div>

    <form @submit.prevent="handleFormSubmit" class="space-y-2 w-full">
      <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">
        {{ t.ads?.verify_label || 'Correo electrónico utilizado en Whop' }}
      </label>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <input
          v-model="emailInput"
          type="email"
          :placeholder="t.ads?.verify_placeholder || 'tu_correo_de_whop@ejemplo.com'"
          class="flex-1 min-w-0 w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm font-sans focus:outline-none focus:border-[#00D4FF]/60 transition-colors placeholder:text-neutral-500"
        />
        <button
          type="submit"
          :disabled="loading || !emailInput.trim()"
          class="shrink-0 group relative inline-flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-xl px-6 py-3.5 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.25)] enabled:cursor-pointer enabled:hover:scale-[1.02] enabled:hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <span v-if="loading" class="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
          <span v-else>{{ t.ads?.verify_btn || 'Verificar y Vincular' }}</span>
        </button>
      </div>
    </form>
  </section>
</template>
