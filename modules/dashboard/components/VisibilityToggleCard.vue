<script setup lang="ts">
import { ref } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  isHidden: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const isModalOpen = ref(false)

function openConfirmation() {
  isModalOpen.value = true
}

function closeConfirmation() {
  isModalOpen.value = false
}

function handleConfirm() {
  emit('toggle')
  closeConfirmation()
}
</script>

<template>
  <div>
    <!-- Main Card -->
    <section class="bg-surface-elevated rounded-3xl p-8 md:p-10 space-y-6 transition-all duration-300 border border-white/10 hover:border-white/15">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-white/5">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full" :class="isHidden ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'"></span>
            <h2 class="font-serif text-lg md:text-xl text-white font-normal">
              {{ isHidden ? t.visibility.status_hidden : t.visibility.status_published }}
            </h2>
          </div>
          <p class="text-xs font-sans text-neutral-400 font-extralight tracking-wide max-w-xl">
            {{ t.visibility.notice }}
          </p>
        </div>

        <button
          type="button"
          @click="openConfirmation"
          class="shrink-0 px-5 py-3 rounded-2xl text-xs font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          :class="isHidden 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20'"
        >
          <svg v-if="isHidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
          </svg>
          <span>{{ isHidden ? t.visibility.publish_action : t.visibility.hide_action }}</span>
        </button>
      </div>
    </section>

    <!-- Confirmation Modal (Facto Design Aesthetic) -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop with Deep Blur -->
        <div
          class="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-fade-in"
          @click="closeConfirmation"
        ></div>

        <!-- Modal Dialog (Facto Glass aesthetic) -->
        <div
          class="relative w-full max-w-lg bg-surface-elevated border border-white/15 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 flex flex-col gap-6 z-10 animate-scale-up isolate overflow-hidden"
        >
          <!-- Header Icon & Title -->
          <div class="flex items-start gap-4 relative z-10">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
              :class="isHidden 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'"
            >
              <svg v-if="isHidden" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>

            <div class="space-y-1.5">
              <h3 class="font-serif text-xl sm:text-2xl text-white font-normal leading-snug">
                {{ isHidden ? t.visibility.modal_publish_title : t.visibility.modal_hide_title }}
              </h3>
              <p class="font-sans text-neutral-400 text-xs sm:text-sm font-extralight tracking-wide leading-relaxed">
                {{ isHidden ? t.visibility.modal_publish_desc : t.visibility.modal_hide_desc }}
              </p>
            </div>
          </div>

          <!-- Actions Row -->
          <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10 relative z-10">
            <!-- Cancel Button -->
            <button
              type="button"
              @click="closeConfirmation"
              class="px-5 py-3 rounded-full text-xs font-sans font-medium text-neutral-300 hover:text-white bg-surface-dark hover:bg-white/5 border border-white/10 transition-colors"
            >
              {{ t.visibility.modal_cancel }}
            </button>

            <!-- Confirm Button -->
            <button
              type="button"
              @click="handleConfirm"
              class="px-6 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-widest transition-all duration-500 hover:scale-[1.02]"
              :class="isHidden 
                ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                : 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'"
            >
              {{ isHidden ? t.visibility.modal_confirm_publish : t.visibility.modal_confirm_hide }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
