<script setup lang="ts">
import type { ThumbnailOption } from '../types'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  modelValue: string
  errorMsg: string | null
  recentSearches: { videoId: string; titleUrl: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'selectRecent', url: string): void
}>()

const sampleVideos = [
  { label: 'I failed 27 startups...', url: 'https://www.youtube.com/watch?v=eqgUjOByexc' },
  { label: 'Deja de pagar Claude Code...', url: 'https://youtu.be/iZCUmAF40Yg' },
  { label: 'Curso de YouTube...', url: 'https://www.youtube.com/watch?v=ggN2hskx8Ds' },
]

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      emit('update:modelValue', text)
    }
  } catch (e) {
    console.error('Clipboard permission denied', e)
  }
}
</script>

<template>
  <div class="w-full max-w-3xl mx-auto mb-12">
    <!-- Form Box -->
    <div class="bg-[#0A0A0E] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <label class="text-xs uppercase tracking-widest text-neutral-400 font-sans font-medium text-left">
            {{ t.downloader.label }}
          </label>
          <button 
            type="button" 
            @click="handlePaste"
            class="text-[11px] text-[#00D4FF] hover:underline normal-case tracking-normal flex items-center gap-1 font-light cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ t.downloader.paste }}
          </button>
        </div>

        <div class="relative">
          <input 
            type="text"
            :value="modelValue"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            :placeholder="t.downloader.placeholder"
            class="w-full bg-[#030305] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all font-sans"
            autofocus
          />
        </div>

        <!-- Feedback de error inline -->
        <p v-if="errorMsg" class="text-rose-400 text-xs text-left font-light mt-1 flex items-center gap-1">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ errorMsg }}
        </p>
      </div>

      <!-- Ejemplos rápidos -->
      <div class="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center gap-2 text-left">
        <span class="text-neutral-500 text-xs font-light">{{ t.downloader.tryExample }}</span>
        <button 
          v-for="sample in sampleVideos" 
          :key="sample.url"
          type="button"
          @click="emit('selectRecent', sample.url)"
          class="text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all font-light cursor-pointer"
        >
          {{ sample.label }}
        </button>
      </div>
    </div>
  </div>
</template>
