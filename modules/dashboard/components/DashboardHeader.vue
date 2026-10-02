<script setup lang="ts">
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

defineProps<{
  previewSlug?: string
  saving?: boolean
  savedSuccess?: boolean
  showSaveButton?: boolean
  avatarUrl?: string | null
  founderEmail?: string | null
  founderName?: string | null
}>()

defineEmits<{
  (e: 'save'): void
}>()
</script>

<template>
  <header class="py-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#030305]/90 backdrop-blur-xl z-50">
    <!-- Logo Facto Oficial -->
    <div class="flex items-center gap-3">
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity group">
        <img src="/favicon.svg" alt="Facto" class="w-5 h-5" />
        <span class="font-sans font-bold tracking-widest uppercase text-sm text-white">facto</span>
      </NuxtLink>
    </div>

    <div class="flex items-center gap-4">
      <!-- Preview Button -->
      <NuxtLink
        v-if="previewSlug"
        :to="localePath(`/saas/${previewSlug}`)"
        target="_blank"
        class="shrink-0 group relative inline-flex items-center gap-2 bg-black text-white border border-white/20 font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-full px-3.5 py-2 md:px-4.5 md:py-2.5 transition-all duration-700 hover:scale-[1.03] hover:border-white/50 hover:bg-white/5"
      >
        <span>{{ t.header.preview }}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </NuxtLink>

      <!-- Save Changes Button (Facto GlassButton) -->
      <button
        v-if="showSaveButton"
        :disabled="saving"
        @click="$emit('save')"
        class="shrink-0 group relative inline-flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-full px-4 py-2 md:px-5 md:py-2.5 transition-all duration-500 hover:scale-[1.03] disabled:opacity-50"
        :class="savedSuccess 
          ? 'bg-emerald-400 text-black border border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.5)]' 
          : 'bg-white text-black'"
        :style="!savedSuccess ? 'box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.3)' : ''"
      >
        <span v-if="saving" class="inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
        <svg v-else-if="savedSuccess" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{{ saving ? t.header.saving : (savedSuccess ? (t.header.saved || '¡Guardado!') : t.header.save_changes) }}</span>
      </button>

      <!-- Founder Avatar -->
      <NuxtLink :to="localePath('/dashboard/founder')" class="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-white/5 flex items-center justify-center shrink-0 ml-1 hover:border-[#00D4FF]/60 transition-colors">
        <img v-if="avatarUrl" :src="avatarUrl" :alt="founderName || 'Founder'" class="w-full h-full object-cover" />
        <span v-else class="font-serif text-xs font-bold text-neutral-300">{{ founderEmail?.charAt(0).toUpperCase() || 'F' }}</span>
      </NuxtLink>
    </div>
  </header>
</template>
