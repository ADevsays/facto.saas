<script setup lang="ts">
import type { ThumbnailOption } from '../types'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  thumbnail: ThumbnailOption
  copiedStatus: string | null
  isDownloading: boolean
}>()

const emit = defineEmits<{
  (e: 'download', thumbnail: ThumbnailOption): void
  (e: 'copy', url: string, label: string): void
  (e: 'preview', url: string): void
}>()
</script>

<template>
  <div class="bg-[#0A0A0E] border border-white/10 rounded-2xl overflow-hidden flex flex-col group hover:border-[#00D4FF]/40 transition-all duration-500 shadow-xl">
    <!-- Image Header / Container -->
    <div class="relative aspect-video w-full overflow-hidden bg-black/50 group/img">
      <img 
        :src="thumbnail.url" 
        :alt="thumbnail.label"
        class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
        loading="lazy"
      />
      
      <!-- Overlay Hover Badge -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
        <button 
          @click="emit('preview', thumbnail.url)"
          class="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2 rounded-lg border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ t.card.preview }}
        </button>
      </div>

      <!-- Resolution Tag -->
      <div class="absolute bottom-2 right-2 bg-black/80 text-neutral-300 text-[10px] font-mono px-2 py-1 rounded backdrop-blur-md border border-white/10">
        {{ thumbnail.resolution }}
      </div>
    </div>

    <!-- Info & Actions Card Body -->
    <div class="p-5 flex flex-col justify-between flex-1 gap-4 text-left">
      <div>
        <div class="flex items-center justify-between gap-2 mb-1">
          <h3 class="text-sm font-semibold text-white font-sans">{{ thumbnail.label }}</h3>
          <span 
            v-if="thumbnail.quality === 'maxres'"
            class="text-[10px] font-mono uppercase bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 px-2 py-0.5 rounded-full"
          >
            {{ t.card.recommended }}
          </span>
        </div>
        <p class="text-xs text-neutral-400 font-light">{{ t.card.description }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
        <button
          @click="emit('download', thumbnail)"
          :disabled="isDownloading"
          class="bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.15)] disabled:opacity-50"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{{ t.card.download }}</span>
        </button>

        <button
          @click="emit('copy', thumbnail.url, thumbnail.quality)"
          class="bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5 text-[#00D4FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{{ copiedStatus === thumbnail.quality ? t.card.copied : t.card.copyUrl }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
