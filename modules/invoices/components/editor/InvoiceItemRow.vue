<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceItem } from '../../types'
import { formatShort } from '../../const/currencies'

const props = defineProps<{
  item: InvoiceItem
  currency: string
  canRemove: boolean
}>()

const emit = defineEmits<{
  (e: 'update:item', item: InvoiceItem): void
  (e: 'remove'): void
}>()

const rowTotal = computed(() => (Number(props.item.qty) || 0) * (Number(props.item.price) || 0))

const updateField = (key: keyof InvoiceItem, val: any) => {
  emit('update:item', { ...props.item, [key]: val })
}
</script>

<template>
  <div class="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 transition-all duration-200 hover:border-white/[0.10] space-y-3">
    <!-- Descripción (protagonista) -->
    <input
      :value="item.description"
      @input="updateField('description', ($event.target as HTMLInputElement).value)"
      placeholder="Nombre del servicio o producto"
      class="w-full bg-transparent text-white font-sans text-[14px] font-light placeholder-white/20 focus:outline-none"
    />

    <!-- Cantidad × Precio = Total -->
    <div class="flex items-center gap-2 flex-wrap">
      <div class="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2">
        <span class="font-sans text-[10px] uppercase tracking-[0.1em] text-white/30 shrink-0">Cant.</span>
        <input
          :value="item.qty"
          type="number"
          min="1"
          @input="updateField('qty', ($event.target as HTMLInputElement).value)"
          class="w-10 bg-transparent text-white font-sans text-[13px] text-center focus:outline-none"
        />
      </div>

      <span class="text-white/20 font-sans text-[12px]">×</span>

      <div class="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 flex-1 min-w-[90px]">
        <span class="font-sans text-[10px] uppercase tracking-[0.1em] text-white/30 shrink-0">Precio</span>
        <input
          :value="item.price"
          type="number"
          min="0"
          step="0.01"
          @input="updateField('price', ($event.target as HTMLInputElement).value)"
          class="w-full bg-transparent text-white font-sans text-[13px] text-right focus:outline-none"
        />
      </div>

      <span class="text-white/20 font-sans text-[12px]">=</span>

      <span class="font-sans text-[14px] font-semibold text-[#00D4FF] min-w-[60px] text-right">
        {{ formatShort(rowTotal, currency) }}
      </span>

      <button
        v-if="canRemove"
        type="button"
        @click="emit('remove')"
        title="Eliminar"
        class="ml-auto opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 transition-all duration-200 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
