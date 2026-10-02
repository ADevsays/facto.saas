<script setup lang="ts">
import { ref } from 'vue'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  shareText: string
  shareUrl: string
  name: string
  slug: string
  logoUrl?: string | null
  revenueDisplay: string
  viewsDisplay: string
}>()

const showCopied = ref(false)

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(`${props.shareText}\n\n${props.shareUrl}`)
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Error copying text:', err)
  }
}
</script>

<template>
  <div class="bg-surface-elevated border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 relative">
    <!-- Header with Copy Button -->
    <div class="flex items-center justify-between">
      <span class="text-xs font-sans text-neutral-400 font-extralight tracking-wide">
        {{ t.share_achievement.preview_title }}
      </span>
      <button
        @click="copyText"
        class="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
        :title="t.share_achievement.preview_title"
      >
        <span v-if="showCopied" class="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider">
          {{ t.share_achievement.copied }}
        </span>
        <svg v-if="!showCopied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    </div>

    <!-- Message Copy -->
    <p class="text-xs font-sans text-neutral-200 leading-relaxed font-light">
      {{ shareText }}
    </p>

    <!-- Rich Startup Link Preview -->
    <div class="bg-[#0b0b0e] border border-white/10 rounded-xl p-3 flex items-center gap-3 mt-1">
      <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black font-bold text-base overflow-hidden shrink-0 shadow-sm">
        <img v-if="logoUrl" :src="logoUrl" class="w-full h-full object-cover" />
        <span v-else>{{ name ? name.charAt(0).toUpperCase() : 'S' }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <h4 class="font-serif font-bold text-white text-xs sm:text-sm truncate">
          {{ name }}
        </h4>
        <p class="text-[10px] sm:text-[11px] font-sans text-neutral-400 truncate mt-0.5 font-light">
          {{ t.share_achievement.preview_stats.replace('{revenue}', revenueDisplay).replace('{views}', viewsDisplay) }}
        </p>
      </div>
    </div>

    <!-- Display Link Underneath -->
    <a 
      :href="shareUrl" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="text-xs font-mono text-[#00D4FF] hover:underline truncate mt-1"
    >
      factosaas.com/saas/{{ slug }}
    </a>
  </div>
</template>
