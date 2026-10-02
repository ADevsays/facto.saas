<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { t } = useI18n()

const isOpen = ref(false)
const TELEGRAM_URL = 'https://t.me/factosaas'
const STORAGE_KEY = 'facto_telegram_popup_seen_v4'
const DISMISS_DAYS = 7

function closePopup() {
  isOpen.value = false
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  }
}

function handleJoin() {
  if (typeof window !== 'undefined') {
    window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer')
    closePopup()
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return

  const lastClosed = localStorage.getItem(STORAGE_KEY)
  if (lastClosed) {
    const elapsedMs = Date.now() - Number(lastClosed)
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)
    if (elapsedDays < DISMISS_DAYS) {
      return
    }
  }

  // Smooth entrance after page stabilizes
  setTimeout(() => {
    isOpen.value = true
  }, 1200)
})
</script>

<template>
  <Transition name="popup-fade">
    <div
      v-if="isOpen"
      class="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[100] max-w-[390px] w-[calc(100%-2.5rem)]"
    >
      <div class="bg-surface-elevated border border-white/10 hover:border-white/20 rounded-3xl p-6 sm:p-7 text-left relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.92),0_0_35px_rgba(0,212,255,0.12)] transition-all duration-300">
        
        <!-- Subtle Ambient Cyan Glow -->
        <div class="absolute -top-12 -right-12 w-32 h-32 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Close Button (positioned with generous spacing) -->
        <button
          type="button"
          @click="closePopup"
          class="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10 cursor-pointer"
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Header: Badge & Icon aligned with clean breathing room -->
        <div class="flex items-center gap-3 pr-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/25 shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse"></span>
            <span>{{ t('telegram_popup.badge') }}</span>
          </div>
          
          <div class="w-7 h-7 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/25 text-[#00D4FF] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-[#00D4FF]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2L2 9.5l7 3 3 7.5 9.5-18z"></path>
              <path d="M9 12.5L21.5 2"></path>
            </svg>
          </div>
        </div>

        <!-- Title & Description with ample spacing -->
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white tracking-tight mt-5 leading-snug">
          {{ t('telegram_popup.title') }}
        </h3>
        
        <p class="text-xs sm:text-[13px] font-sans font-light text-neutral-400 leading-relaxed mt-2.5 tracking-wide">
          {{ t('telegram_popup.description') }}
        </p>

        <!-- Action Button (Facto GlassButton Style with top margin) -->
        <button
          type="button"
          @click="handleJoin"
          class="mt-6 w-full py-3.5 px-6 rounded-full bg-white text-black font-sans font-bold text-xs uppercase tracking-wider hover:scale-[1.02] hover:bg-neutral-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.35),0_0_30px_rgba(0,212,255,0.15)] flex items-center justify-center gap-2 cursor-pointer group"
        >
          <span>{{ t('telegram_popup.cta') }}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-1">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}
</style>
