<script setup lang="ts">
import { computed, watch } from 'vue'
import { useAddAdModal } from '~/composables/useAddAdModal'
import { useKeycapSound } from '~/composables/useKeycapSound'
import { useLanguage } from '~/composables/useLanguage'
import { ExternalLink, Flame, Sparkles } from 'lucide-vue-next'
import type { AdSlot } from '../types'
import es from '../locales/es.json'
import en from '../locales/en.json'

import { useAdsSlots } from '../composables/useAdsSlots'

const { t } = useLanguage({ es, en })
const { isAuctionListOpen, closeAuctionList, openBuy } = useAddAdModal()
const { playNextKeySound } = useKeycapSound()

const { safeSlots, freeSlotsCount, refresh: refreshSlots } = useAdsSlots()

const occupiedSlotsCount = computed(() => safeSlots.value.filter(s => !s.isAvailable).length)

watch(isAuctionListOpen, (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
  if (val) {
    refreshSlots()
  }
})

function onReclaimSlot(slot: AdSlot) {
  playNextKeySound()
  closeAuctionList()
  const basePrice = slot.position === 1 ? 10 : 1
  const price = slot.isAvailable ? (slot.currentPrice || basePrice) : slot.nextPrice
  openBuy(slot.position, price, slot.ad?.name)
}
</script>

<template>
  <Transition name="backdrop">
    <div
      v-if="isAuctionListOpen"
      class="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md"
      @click="closeAuctionList"
    />
  </Transition>

  <Transition name="fade">
    <div
      v-if="isAuctionListOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pointer-events-none"
    >
      <div
        class="relative w-full max-w-2xl bg-[#0c0c10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] pointer-events-auto"
      >
        <!-- Header -->
        <div class="p-6 sm:p-7 pb-4 border-b border-white/5 bg-[#0c0c10] flex flex-col gap-3">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-1">
              <h2 class="font-serif text-2xl sm:text-3xl text-white tracking-tight leading-tight flex items-center gap-2.5">
                <span>{{ t.auction_modal.title }}</span>
                <span class="text-xs font-mono font-medium px-2 py-0.5 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 text-[#00D4FF]">
                  {{ t.auction_modal.slots_badge }}
                </span>
              </h2>
              <p class="text-xs font-sans font-light text-neutral-400">
                {{ t.auction_modal.description }}
              </p>
            </div>

            <button
              @click="closeAuctionList"
              class="text-neutral-500 hover:text-white transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Summary Pills -->
          <div class="flex items-center gap-3 text-xs">
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{{ t.auction_modal.available_slots.replace('{count}', String(freeSlotsCount)) }}</span>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>{{ t.auction_modal.occupied_slots.replace('{count}', String(occupiedSlotsCount)) }}</span>
            </div>
            <div class="hidden sm:flex items-center gap-1 text-neutral-500 text-[11px] ml-auto">
              <span>{{ t.auction_modal.pricing_rule }}</span>
            </div>
          </div>
        </div>

        <!-- 20 Slots List -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-2.5 custom-scrollbar">
          <div
            v-for="s in safeSlots"
            :key="s.position"
            :class="[
              'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-300',
              s.isAvailable
                ? 'border-dashed border-white/10 bg-white/[0.015] hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/[0.02]'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20'
            ]"
          >
            <!-- Slot Info & Startup Details -->
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <!-- Position Number -->
              <div
                :class="[
                  'w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 border',
                  s.position === 1
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : s.isAvailable
                      ? 'bg-white/[0.03] border-white/10 text-neutral-400'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-[#00D4FF]'
                ]"
              >
                #{{ s.position }}
              </div>

              <!-- Occupied Slot Content -->
              <div v-if="!s.isAvailable && s.ad" class="flex flex-col min-w-0 flex-1 gap-0.5">
                <div class="flex items-center gap-2">
                  <img
                    v-if="s.ad.image_url"
                    :src="s.ad.image_url"
                    :alt="s.ad.name"
                    class="w-4 h-4 object-contain rounded shrink-0"
                  />
                  <p class="text-white font-medium text-sm truncate">
                    {{ s.ad.name }}
                  </p>
                  <a
                    v-if="s.ad.url"
                    :href="s.ad.url"
                    target="_blank"
                    class="text-neutral-500 hover:text-[#00D4FF] transition-colors shrink-0"
                    :title="t.auction_modal.visit_site"
                  >
                    <ExternalLink class="w-3.5 h-3.5" />
                  </a>
                </div>
                <p class="text-xs text-neutral-400 font-light truncate">
                  {{ s.ad.description || t.auction_modal.startup_fallback }}
                </p>
                <p class="text-[10px] text-neutral-500 mt-0.5">
                  {{ t.auction_modal.paid_label }} <strong class="text-neutral-300 font-mono">${{ s.currentPrice }} USD</strong>
                </p>
              </div>

              <!-- Empty Slot Content -->
              <div v-else class="flex flex-col min-w-0 flex-1 gap-0.5">
                <div class="flex items-center gap-2">
                  <Sparkles class="w-3.5 h-3.5 text-emerald-400" />
                  <p class="text-neutral-300 font-medium text-sm">
                    {{ t.auction_modal.spot_free.replace('{position}', String(s.position)) }}
                  </p>
                </div>
                <p class="text-xs text-neutral-500 font-light">
                  {{ t.auction_modal.empty_spot_desc }}
                </p>
                <p
                  class="text-[10px] mt-0.5 font-mono"
                  :class="s.position === 1 ? 'text-amber-400/90' : 'text-emerald-400/90'"
                >
                  {{ t.auction_modal.base_price.replace('{price}', String(s.currentPrice ?? (s.position === 1 ? 10 : 1))) }}
                </p>
              </div>
            </div>

            <!-- Action Button: Reclamar vs Ocupar -->
            <div class="flex items-center justify-end w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <button
                v-if="!s.isAvailable"
                type="button"
                @click="onReclaimSlot(s)"
                class="w-full sm:w-auto group flex items-center justify-center gap-2 bg-[#00D4FF]/10 hover:bg-[#00D4FF] text-[#00D4FF] hover:text-black border border-[#00D4FF]/30 font-bold uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Flame class="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                <span>{{ t.auction_modal.reclaim_btn.replace('{price}', String(s.nextPrice)) }}</span>
              </button>

              <button
                v-else
                type="button"
                @click="onReclaimSlot(s)"
                :class="[
                  'w-full sm:w-auto flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-[10px] px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
                  s.position === 1
                    ? 'bg-[#FFD700] text-black hover:bg-[#FFE033] shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                    : 'bg-white text-black hover:bg-neutral-200'
                ]"
              >
                <span>{{ t.auction_modal.occupy_btn.replace('{price}', String(s.currentPrice ?? (s.position === 1 ? 10 : 1))) }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 px-6 border-t border-white/5 bg-[#0c0c10] flex items-center justify-between text-xs text-neutral-500">
          <span>{{ t.auction_modal.footer_realtime }}</span>
          <span class="text-neutral-400">{{ t.auction_modal.footer_total }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.backdrop-leave-active { transition: opacity 0.3s ease; }
.backdrop-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.3); }
</style>
