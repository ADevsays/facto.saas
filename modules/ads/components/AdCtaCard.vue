<script setup lang="ts">
import { computed } from 'vue'
import { useKeycapSound } from '~/composables/useKeycapSound'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const props = withDefaults(
  defineProps<{
    freeSlots?: number
    compact?: boolean
  }>(),
  {
    freeSlots: 20,
    compact: false
  }
)

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { t } = useLanguage({ es, en })
const { playNextKeySound } = useKeycapSound()

const freeSlotsText = computed(() => {
  if (props.freeSlots === 0) return t.value.cta.auction_active
  return t.value.cta.free_slots.replace('{count}', String(props.freeSlots))
})

const compactText = computed(() => {
  if (props.freeSlots === 0) return t.value.cta.bid
  return `${props.freeSlots}/20`
})

function handleClick() {
  playNextKeySound()
  emit('click')
}
</script>

<template>
  <div
    role="button"
    tabindex="0"
    @click="handleClick"
    :class="[
      'ad-cta shrink-0 flex items-center cursor-pointer select-none transition-all duration-500',
      compact ? 'gap-1.5 rounded-xl px-3 h-9 border border-white/10 bg-[#0f0f12]/95 shadow-lg' : 'gap-3 rounded-xl px-4 py-2.5 md:h-[72px]'
    ]"
  >
    <span :class="['ad-cta__icon leading-none transition-all duration-500', compact ? 'text-xs text-[#00D4FF] opacity-100' : 'text-xl']">✦</span>
    
    <div v-if="!compact" class="flex flex-col gap-0.5">
      <p class="ad-cta__title text-sm font-sans font-medium whitespace-nowrap transition-all duration-500">{{ t.cta.title }}</p>
      <p class="ad-cta__sub text-xs font-sans font-extralight tracking-[0.08em] whitespace-nowrap transition-all duration-500">{{ freeSlotsText }}</p>
    </div>

    <span v-else class="text-[11px] font-mono font-medium text-white/90 whitespace-nowrap">
      {{ compactText }}
    </span>
  </div>
</template>

<style scoped>
.ad-cta {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background-color: #0f0f12;
}
.ad-cta__icon  { opacity: 0.45; filter: grayscale(1); }
.ad-cta__title { color: rgba(255,255,255,0.55); }
.ad-cta__sub   { color: rgba(255,255,255,0.35); }

.ad-cta:hover {
  border-color: rgba(0, 212, 255, 0.4);
  background-color: #1a1a1f;
  box-shadow: 0 0 22px rgba(0, 212, 255, 0.15);
}
.ad-cta:hover .ad-cta__icon  { opacity: 1; filter: grayscale(0); }
.ad-cta:hover .ad-cta__title { color: rgba(255,255,255,1); }
.ad-cta:hover .ad-cta__sub   { color: rgba(255,255,255,0.45); }
</style>
