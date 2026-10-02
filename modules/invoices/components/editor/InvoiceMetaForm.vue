<script setup lang="ts">
import { CURRENCIES } from '../../const/currencies'
import InvoiceFormField from '../common/InvoiceFormField.vue'

defineProps<{
  number: string
  date: string
  dueDate: string
  currency: string
}>()

const emit = defineEmits<{
  (e: 'update:date', val: string): void
  (e: 'update:dueDate', val: string): void
  (e: 'update:currency', val: string): void
}>()
</script>

<template>
  <div class="flex flex-col gap-6 p-6 sm:p-8 bg-[#0A0A0C] border border-white/5 rounded-3xl font-sans">
    <div class="flex items-center gap-3 border-b border-white/5 pb-4">
      <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"></span>
      <h3 class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/60">Información General</h3>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <InvoiceFormField
        label="Nº Factura"
        :modelValue="number"
        readonly
      />

      <div class="flex flex-col gap-2">
        <label class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/45">Fecha de Emisión</label>
        <input
          :value="date"
          type="date"
          @input="emit('update:date', ($event.target as HTMLInputElement).value)"
          class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[14px] font-light transition-all duration-300 focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03]"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/45">Vencimiento</label>
        <input
          :value="dueDate"
          type="date"
          @input="emit('update:dueDate', ($event.target as HTMLInputElement).value)"
          class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[14px] font-light transition-all duration-300 focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03]"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/45">Divisa</label>
        <select
          :value="currency"
          @change="emit('update:currency', ($event.target as HTMLSelectElement).value)"
          class="w-full bg-[#12121a] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[14px] font-light transition-all duration-300 focus:outline-none focus:border-[#00D4FF]/40"
        >
          <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">
            {{ c.code }} - {{ c.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
