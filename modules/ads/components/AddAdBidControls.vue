<script setup lang="ts">
import { ref, watch } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  customBid: number
  minPrice: number
}>()

const emit = defineEmits<{
  (e: 'update:customBid', val: number): void
  (e: 'decrement'): void
  (e: 'increment', amount?: number): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const inputVal = ref(String(props.customBid))

watch(() => props.customBid, (newVal) => {
  inputVal.value = String(newVal)
})

function handleFocus(e: Event) {
  const target = e.target as HTMLInputElement
  target.select()
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const raw = target.value.replace(/[^0-9]/g, '')
  inputVal.value = raw
  const parsed = parseInt(raw, 10)
  if (!isNaN(parsed) && parsed >= props.minPrice) {
    emit('update:customBid', parsed)
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    ;(e.target as HTMLInputElement).blur()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    emit('increment', 1)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    emit('decrement')
  }
}

function handleBlur() {
  const parsed = parseInt(inputVal.value, 10)
  if (isNaN(parsed) || parsed < props.minPrice) {
    inputVal.value = String(props.minPrice)
    emit('update:customBid', props.minPrice)
  } else {
    inputVal.value = String(parsed)
    emit('update:customBid', parsed)
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-0.5">
      <span>{{ t.modal.sale.your_bid }}</span>
      <span class="text-xs font-mono text-neutral-400 lowercase font-normal">
        {{ t.modal.sale.min_base }} <strong class="text-white">${{ minPrice }} USD</strong>
      </span>
    </div>

    <!-- Stepper control with auto-selecting direct numeric input -->
    <div class="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-1 sm:p-1.5 focus-within:border-[#00D4FF]/40 transition-colors">
      <button
        type="button"
        @click="emit('decrement')"
        :disabled="customBid <= minPrice"
        class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
        :aria-label="t.modal.sale.decrease_bid"
      >
        <Minus class="w-4 h-4" />
      </button>

      <div 
        class="flex items-center justify-center gap-1 min-w-0 flex-1 px-2 cursor-text"
        @click="inputRef?.focus()"
      >
        <span class="text-2xl font-mono font-bold text-[#00D4FF] select-none">$</span>
        <input
          ref="inputRef"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          :value="inputVal"
          @focus="handleFocus"
          @click="handleFocus"
          @input="handleInput"
          @keydown="handleKeyDown"
          @blur="handleBlur"
          class="w-20 sm:w-24 bg-transparent text-center text-2xl font-mono font-bold text-[#00D4FF] tracking-tight focus:outline-none focus:bg-white/[0.04] rounded-lg py-0.5 transition-colors selection:bg-[#00D4FF]/40 selection:text-white"
          aria-label="Cantidad de puja"
        />
        <span class="text-xs font-mono font-bold text-neutral-400 uppercase shrink-0 select-none">USD</span>
      </div>

      <button
        type="button"
        @click="emit('increment', 1)"
        class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
        :aria-label="t.modal.sale.increase_bid"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="amount in [5, 10, 25]"
        :key="amount"
        type="button"
        @click="emit('increment', amount)"
        class="rounded-lg border border-white/10 bg-white/[0.035] px-2 py-1.5 text-[11px] font-mono font-bold text-neutral-300 transition-all hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/10 hover:text-white active:scale-[0.98] cursor-pointer"
      >
        +{{ amount }}
      </button>
    </div>

  </div>
</template>
