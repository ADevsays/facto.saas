<script setup lang="ts">
import { useShareModal } from '../composables/useShareModal'
import { computed } from 'vue'
import ShareAchievementCard from './ShareAchievementCard.vue'
import ShareMessagePreview from './ShareMessagePreview.vue'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const { isOpen, closeShare, saasData } = useShareModal()

const shareUrl = computed(() => saasData.value?.url || '')
const shareText = computed(() => saasData.value?.shareText || '')
const encodedUrl = computed(() => encodeURIComponent(shareUrl.value))
const encodedText = computed(() => encodeURIComponent(shareText.value))

const networks = computed(() => [
  {
    id: 'x',
    name: t.value?.share_achievement?.share_x || 'Compartir en X',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    url: `https://x.com/intent/tweet?text=${encodedText.value}&url=${encodedUrl.value}`,
    classes: 'bg-[#18181d] hover:bg-[#202026] text-white border border-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]'
  },
  {
    id: 'linkedin',
    name: t.value?.share_achievement?.share_linkedin || 'Compartir en LinkedIn',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`,
    classes: 'bg-[#18181d] hover:bg-[#202026] text-white border border-white/10 hover:border-[#00D4FF]/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.12)]'
  },
  {
    id: 'facebook',
    name: t.value?.share_achievement?.share_facebook || 'Compartir en Facebook',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`,
    classes: 'bg-[#18181d] hover:bg-[#202026] text-white border border-white/10 hover:border-[#00D4FF]/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.12)]'
  }
])
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop-fade">
      <div
        v-if="isOpen && saasData"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        style="background: rgba(3,3,5,0.88); backdrop-filter: blur(16px);"
        @click.self="closeShare"
      >
        <Transition name="modal-scale" appear>
          <div
            class="w-full max-w-[440px] rounded-[28px] overflow-hidden relative p-6 sm:p-7 flex flex-col my-auto bg-surface-dark border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
          >
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-white font-serif font-bold text-xl sm:text-2xl tracking-tight">
                  {{ t.share_achievement.title }}
                </h3>
                <p class="text-xs sm:text-sm text-neutral-400 font-extralight tracking-wide mt-1">
                  {{ t.share_achievement.subtitle }}
                </p>
              </div>
              <button 
                @click="closeShare" 
                class="text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors -mr-1 -mt-1"
                :aria-label="t.share_achievement.close_modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Achievement Card Component -->
            <ShareAchievementCard
              :revenue-display="saasData.revenueDisplay"
              :views-display="saasData.viewsDisplay"
            />

            <!-- Social Share Buttons (Stacked Full-Width) -->
            <div class="flex flex-col gap-2.5 mb-4">
              <a
                v-for="net in networks"
                :key="net.id"
                :href="net.url"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full flex items-center justify-center gap-2.5 font-sans font-medium text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all duration-300"
                :class="net.classes"
              >
                <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path :d="net.icon" />
                </svg>
                <span>{{ net.name }}</span>
              </a>
            </div>

            <!-- Message Preview Component -->
            <ShareMessagePreview
              :share-text="shareText"
              :share-url="shareUrl"
              :name="saasData.name"
              :slug="saasData.slug"
              :logo-url="saasData.logoUrl"
              :revenue-display="saasData.revenueDisplay"
              :views-display="saasData.viewsDisplay"
            />

            <!-- Footer FOMO -->
            <p class="text-[11px] font-sans text-neutral-500 font-extralight tracking-wide text-center mt-4">
              {{ t.share_achievement.fomo }}
            </p>

            <!-- Bottom Down-Arrow Close Action -->
            <button
              @click="closeShare"
              class="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-[#00D4FF]/30 flex items-center justify-center text-neutral-400 hover:text-white mx-auto mt-3 transition-colors"
              :title="t.share_achievement.close_modal"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-scale-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(12px);
}
</style>
