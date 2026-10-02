<script setup lang="ts">
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

defineProps<{
  selectedSlot: number
  allSlotsList: Array<{
    position: number
    isAvailable: boolean
    currentPrice: number
    nextPrice: number
    ad: any
  }>
  isSlotAvailable: boolean
  minPrice: number
  targetAdName?: string | null
  currentSlotData?: any
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'select-slot', position: number): void
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="relative flex flex-col gap-1.5" @click.stop>
    <div class="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-0.5">
      <span>{{ t.modal.sale.slot_label }}</span>
      <span class="font-sans text-xs font-normal lowercase text-neutral-400">
        {{ isSlotAvailable ? t.modal.sale.status_free : t.modal.sale.status_auction }}
      </span>
    </div>

    <!-- Trigger button -->
    <button
      type="button"
      @click="emit('toggle')"
      class="w-full flex items-center justify-between gap-3 bg-white/[0.04] border border-white/10 hover:border-white/20 text-white rounded-xl px-4 py-2.5 text-xs font-sans tracking-wide transition-all duration-300 cursor-pointer text-left group"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="isSlotAvailable ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'"
        />
        <span class="truncate">
          {{ t.modal.setup.slot_prefix.replace('{slot}', String(selectedSlot)) }}
          <span v-if="selectedSlot === 1" class="text-[#FFD700] ml-1 font-medium">{{ t.modal.gold_badge }}</span>
          <span class="text-neutral-400 ml-1.5 font-light">
            · {{ isSlotAvailable ? `$${minPrice}` : `${targetAdName || currentSlotData?.ad?.name || t.modal.occupied} ($${minPrice})` }}
          </span>
        </span>
      </div>

      <svg
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        class="text-neutral-400 transition-transform duration-300 shrink-0 ml-2 group-hover:text-white"
        :class="{ 'rotate-180': isOpen }"
      >
        <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute left-0 right-0 top-full mt-2 w-full bg-[#0c0c10] border border-white/15 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 flex flex-col py-1 max-h-56 overflow-y-auto custom-scrollbar animate-fade-in"
    >
      <button
        v-for="s in allSlotsList"
        :key="s.position"
        type="button"
        @click="emit('select-slot', s.position)"
        class="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-sans tracking-wide hover:bg-white/[0.08] transition-colors duration-200 cursor-pointer"
        :class="s.position === selectedSlot ? 'text-[#00D4FF] font-medium bg-white/[0.04]' : 'text-neutral-300'"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span
            class="w-1.5 h-1.5 rounded-full shrink-0"
            :class="s.isAvailable ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-amber-400/80'"
          />
          <span class="truncate" :class="s.position === 1 ? 'text-[#FFD700]' : ''">
            {{ t.modal.setup.slot_prefix.replace('{slot}', String(s.position)) }}
            <span v-if="s.position === 1" class="text-[#FFD700] ml-1">★</span>
            <span v-if="!s.isAvailable && s.ad?.name" class="text-neutral-500 font-light text-[11px] ml-1.5">
              · {{ s.ad.name }}
            </span>
          </span>
        </div>

        <span
          class="font-mono text-xs shrink-0 ml-2"
          :class="s.isAvailable ? 'text-emerald-400' : 'text-neutral-500'"
        >
          ${{ s.isAvailable ? s.currentPrice : s.nextPrice }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.3); }

.animate-fade-in {
  animation: fadeIn 0.15s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
