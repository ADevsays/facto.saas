<script setup lang="ts">
import { computed } from 'vue'
import { formatShort } from '../../const/currencies'
import { computeInvoiceSummary } from '../../utils/calculations'
import type { InvoiceItem } from '../../types'

const props = defineProps<{
  items: InvoiceItem[]
  taxRate: number
  currency: string
}>()

const emit = defineEmits<{
  (e: 'update:taxRate', val: number): void
}>()

const summary = computed(() => {
  return computeInvoiceSummary(props.items, props.taxRate)
})
</script>

<template>
  <div class="mt-6 pt-5 flex flex-col items-end font-sans">
    <div class="w-full sm:w-72 flex flex-col gap-2.5 text-sm">
      <div class="flex justify-between items-center text-white/40 text-[12px]">
        <span>Subtotal</span>
        <span class="font-light text-white/60 font-mono">{{ formatShort(summary.subtotal, currency) }}</span>
      </div>
      <div class="flex justify-between items-center text-white/40 text-[12px]">
        <span class="flex items-center gap-2">
          Impuesto
          <input
            :value="taxRate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            @input="emit('update:taxRate', Number(($event.target as HTMLInputElement).value) || 0)"
            class="w-14 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-center text-white text-[12px] focus:outline-none focus:border-[#00D4FF]/40"
          />
          %
        </span>
        <span class="font-light text-white/60 font-mono">{{ formatShort(summary.taxAmount, currency) }}</span>
      </div>
      <div class="flex justify-between items-center pt-4 mt-1">
        <span class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/40">Total</span>
        <span class="font-sans font-bold text-xl text-[#00D4FF]">
          {{ formatShort(summary.total, currency) }} <span class="text-sm font-normal text-white/40">{{ currency }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
