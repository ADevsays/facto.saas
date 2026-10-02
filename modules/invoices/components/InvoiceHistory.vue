<script setup lang="ts">
import type { Invoice } from '../types'
import { formatShort } from '../const/currencies'
import { formatDate } from '../utils/formatters'

defineProps<{
  invoices: Invoice[]
  currency: string
  hasProfile?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', invoice: Invoice): void
  (e: 'delete', id: string): void
  (e: 'new'): void
  (e: 'setup'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-4 text-white font-sans w-full">

    <!-- Hint contextual: solo visible si aún no hay datos de emisor -->
    <div
      v-if="!hasProfile"
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 bg-[#00D4FF]/[0.04] border border-[#00D4FF]/[0.12] rounded-2xl"
    >
      <div class="flex items-start gap-3">
        <svg class="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-sans text-[13px] font-medium text-white/80">Antes de emitir facturas, guarda tus datos como emisor.</p>
          <p class="font-sans text-[12px] font-light text-white/40 mt-0.5">Tu nombre, NIF y dirección aparecerán en cada factura que generes.</p>
        </div>
      </div>
      <button
        type="button"
        @click="emit('setup')"
        class="shrink-0 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#00D4FF] border border-[#00D4FF]/20 rounded-full px-4 py-2 hover:bg-[#00D4FF]/[0.08] transition-all cursor-pointer whitespace-nowrap"
      >
        Completar datos
      </button>
    </div>

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 sm:p-8 bg-[#0A0A0C] border border-white/5 rounded-3xl">
      <div>
        <h2 class="text-xl font-serif font-bold text-white tracking-tight">Facturas Guardadas</h2>
        <p class="font-sans text-[13px] font-light text-white/50 mt-1">
          Gestiona las facturas creadas localmente en tu navegador.
        </p>
      </div>

      <button
        type="button"
        @click="emit('new')"
        class="bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full px-7 py-3.5 hover:scale-[1.03] transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.4),0_0_30px_rgba(0,212,255,0.2)] flex items-center gap-2"
      >
        <span>+</span> Nueva Factura
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="invoices.length === 0"
      class="p-12 sm:p-16 bg-[#0A0A0C] border border-white/5 rounded-3xl text-center flex flex-col items-center justify-center gap-4"
    >
      <div class="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-xl text-[#00D4FF]">
        📄
      </div>
      <div>
        <h3 class="text-lg font-serif font-medium text-white mb-1">No tienes facturas emitidas aún</h3>
        <p class="font-sans text-[13px] font-light text-white/40 max-w-sm mx-auto">
          Crea tu primera factura profesional en PDF de forma gratuita y sin registro.
        </p>
      </div>
      <button
        type="button"
        @click="emit('new')"
        class="mt-2 px-6 py-3 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[11px] uppercase tracking-[0.15em] font-medium text-white transition-all"
      >
        Crear primera factura
      </button>
    </div>

    <!-- Invoices list -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="inv in [...invoices].reverse()"
        :key="inv.id"
        @click="emit('select', inv)"
        class="p-5 bg-[#0A0A0C] hover:bg-[#101014] border border-white/5 hover:border-[#00D4FF]/30 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-[11px] text-white/40 group-hover:text-[#00D4FF] group-hover:border-[#00D4FF]/30 transition-colors">
            PDF
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-semibold text-white group-hover:text-[#00D4FF] transition-colors">
                {{ inv.number }}
              </span>
              <span class="text-[10px] uppercase tracking-[0.15em] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/40 border border-white/5">
                {{ formatDate(inv.date) }}
              </span>
            </div>
            <p class="font-sans text-[13px] text-white/40 mt-0.5">
              Cliente: <span class="text-white/80 font-medium">{{ inv.client.name || 'Sin cliente' }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-white/5">
          <div class="text-right">
            <span class="font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-white/35 block">Total</span>
            <span class="font-sans font-bold text-base text-[#00D4FF]">
              {{ formatShort(inv.total, inv.currency || currency) }} {{ inv.currency || currency }}
            </span>
          </div>

          <button
            type="button"
            @click.stopPropagation="emit('delete', inv.id)"
            title="Eliminar factura"
            class="text-white/30 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
