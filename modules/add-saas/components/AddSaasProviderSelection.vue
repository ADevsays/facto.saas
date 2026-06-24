<script setup lang="ts">
import { ref, computed } from 'vue'
import ProviderIcon from './ProviderIcon.vue'
import { Clock } from 'lucide-vue-next'

const model = defineModel<'stripe' | 'mercadopago' | 'whop' | 'none' | null>()

const open = ref(false)

const providers = [
  {
    slug: 'stripe',
    name: 'Stripe',
    description: 'Recomendado: Clave restringida de Stripe'
  },
  {
    slug: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Access Token de producción'
  },
  {
    slug: 'whop',
    name: 'Whop',
    description: 'API key de tu Whop Dashboard'
  },
  {
    slug: 'none',
    name: 'Más tarde',
    description: 'Publicar sin conectar por ahora'
  }
] as const

const selected = computed(() => providers.find(p => p.slug === model.value))
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">
      Escoge tu proveedor
    </label>
    <div class="relative">
      <button
        type="button"
        @click="open = !open"
        class="w-full flex items-center justify-between bg-white/[0.07] border border-white/20 rounded-xl px-4 py-3.5 text-sm font-sans font-light transition-all duration-300 hover:border-white/40 focus:outline-none focus:border-[#00D4FF]/70"
        :class="open ? 'border-[#00D4FF]/60 bg-white/[0.1]' : ''"
      >
        <div class="flex items-center gap-3">
          <ProviderIcon :provider="selected!.slug" />
          <span class="text-white">
            {{ selected!.name }}
          </span>
        </div>
        <svg
          class="shrink-0 transition-transform duration-300 text-neutral-400"
          :class="open ? 'rotate-180' : ''"
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div
        v-if="open"
        class="absolute z-50 top-full mt-2 w-full bg-[#0c0c10]/95 border border-white/20 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl max-h-[300px] overflow-y-auto custom-scrollbar"
      >
        <button
          v-for="p in providers"
          :key="p.slug"
          type="button"
          @click="model = p.slug; open = false"
          class="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-sans font-light text-left transition-colors duration-150 border-b border-white/[0.03] last:border-b-0"
          :class="model === p.slug ? 'bg-[#00D4FF]/5' : 'hover:bg-white/[0.05]'"
        >
          <ProviderIcon :provider="p.slug" />
          <div class="flex flex-col gap-0.5 min-w-0">
            <span 
              class="font-medium text-xs sm:text-sm"
              :class="model === p.slug ? 'text-[#00D4FF]' : 'text-neutral-200 hover:text-white'"
            >
              {{ p.name }}
            </span>
            <span class="text-[10px] text-neutral-400 font-light truncate">
              {{ p.description }}
            </span>
          </div>
          <span
            v-if="model === p.slug"
            class="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-[#00D4FF]/20 border border-[#00D4FF]/40"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3.5 6L6.5 2" stroke="#00D4FF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
      </div>
    </div>

    <p v-if="model === 'none'" class="text-[10px] font-sans font-light text-amber-400/70 tracking-wide leading-relaxed mt-1">
      <Clock class="inline w-3 h-3 mr-0.5 -mt-0.5" />
      Tu startup será enviada a revisión humana. Recibirás un correo con el resultado.
    </p>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.3); }
</style>
