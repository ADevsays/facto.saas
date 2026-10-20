<script setup lang="ts">
import { nextTick, ref, onMounted, onUnmounted } from 'vue'

const { t } = useI18n()
const route = useRoute()

const isOpen = ref(false)
const TELEGRAM_URL = 'https://t.me/factosaas'
const STORAGE_KEY = 'facto_telegram_popup_seen_v5'
const DISMISS_DAYS = 1

function closePopup() {
  isOpen.value = false
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    stopRankingTrigger()
  }
}

function handleJoin() {
  if (typeof window !== 'undefined') {
    window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer')
    closePopup()
  }
}

let rankingSection: Element | null = null

function stopRankingTrigger() {
  window.removeEventListener('scroll', openAtRankingStart)
}

function openAtRankingStart() {
  if (isOpen.value || !rankingSection || window.scrollY <= 80) return

  const bounds = rankingSection.getBoundingClientRect()
  if (bounds.top > window.innerHeight * 0.7 || bounds.bottom <= 0) return

  isOpen.value = true
  stopRankingTrigger()
}

onMounted(async () => {
  if (typeof window === 'undefined') return

  const forceOpen = route.query.telegram_popup === '1' || route.query.popup === '1'
  if (!forceOpen) {
    const lastClosed = localStorage.getItem(STORAGE_KEY)
    if (lastClosed) {
      const elapsedMs = Date.now() - Number(lastClosed)
      const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)
      if (elapsedDays < DISMISS_DAYS) {
        return
      }
    }
  } else {
    isOpen.value = true
    return
  }

  await nextTick()
  rankingSection = document.querySelector('[data-ranking-section]')
  if (rankingSection) {
    window.addEventListener('scroll', openAtRankingStart, { passive: true })
    openAtRankingStart()
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    stopRankingTrigger()
    rankingSection = null
  }
})
</script>

<template>
  <Transition name="popup-fade">
    <div
      v-if="isOpen"
      class="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[100] max-w-[488px] w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)]"
    >
      <!-- Glowing Border Outer Wrapper with Facto brand cyan colors -->
      <div class="telegram-popup-frame relative isolate overflow-hidden p-[2px] rounded-3xl shadow-[0_0_25px_rgba(0,212,255,0.45),0_0_50px_rgba(0,212,255,0.2)]">
        <div class="bg-surface-elevated rounded-[22px] p-7 sm:p-9 text-left relative overflow-hidden">
          
          <!-- Subtle Ambient Cyan Glow Inside -->
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-[#00D4FF]/15 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Close Button -->
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

          <!-- Header: Badge & Icon -->
          <div class="flex items-center gap-3 pr-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/25 shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse"></span>
              <span>{{ t('telegram_popup.badge') }}</span>
            </div>
            
            <div class="w-9 h-9 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/25 text-[#00D4FF] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" class="w-5 h-5 text-[#00D4FF]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2L2 9.5l7 3 3 7.5 9.5-18z"></path>
                <path d="M9 12.5L21.5 2"></path>
              </svg>
            </div>
          </div>

          <!-- Title & Description -->
          <h3 class="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight mt-6 leading-snug">
            {{ t('telegram_popup.title') }}
          </h3>
          
          <p class="text-sm sm:text-base font-sans font-light text-neutral-400 leading-relaxed mt-3 tracking-wide">
            {{ t('telegram_popup.description') }}
          </p>

          <!-- Action Button (Facto GlassButton Style) -->
          <button
            type="button"
            @click="handleJoin"
            class="mt-7 w-full py-4 px-7 rounded-full bg-white text-black font-sans font-bold text-sm uppercase tracking-wider hover:scale-[1.02] hover:bg-neutral-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.35),0_0_30px_rgba(0,212,255,0.15)] flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{{ t('telegram_popup.cta') }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-1">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

        </div>
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

.telegram-popup-frame::before {
  content: '';
  position: absolute;
  width: 170%;
  aspect-ratio: 1;
  left: 50%;
  top: 50%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(0, 212, 255, 0.95) 75deg, rgba(255, 255, 255, 0.9) 140deg, transparent 220deg, rgba(0, 212, 255, 0.75) 300deg, transparent 360deg);
  animation: telegram-border-spin 5.4s linear infinite;
  z-index: 0;
}

.telegram-popup-frame > div {
  z-index: 1;
}

@keyframes telegram-border-spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
</style>
