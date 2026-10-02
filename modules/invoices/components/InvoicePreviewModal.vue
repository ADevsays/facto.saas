<script setup lang="ts">
import { ref } from 'vue'
import type { Invoice, InvoiceProfile } from '../types'
import { formatShort } from '../const/currencies'
import { formatDate } from '../utils/formatters'
import { computeInvoiceSummary } from '../utils/calculations'

const props = defineProps<{
  invoice: Invoice
  profile: InvoiceProfile
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const previewRef = ref<HTMLElement | null>(null)
const isExporting = ref(false)

const { subtotal, taxAmount, total } = computeInvoiceSummary(props.invoice.items, props.invoice.taxRate)
const cur = props.invoice.currency

const handleExport = async () => {
  if (!previewRef.value || isExporting.value) return
  isExporting.value = true
  try {
    const html2pdf = (await import('html2pdf.js')).default
    const opt = {
      margin: 0,
      filename: `${props.invoice.number}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    }
    await html2pdf().set(opt).from(previewRef.value).save()
  } catch (err) {
    console.error('Error generating PDF:', err)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    @click.self="emit('close')"
  >
    <div
      class="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
    >
      <!-- Modal header bar -->
      <div class="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#12121a]">
        <div class="flex items-center gap-3">
          <span class="text-xs uppercase tracking-wider text-[#00D4FF] font-semibold">Vista Previa</span>
          <span class="text-xs text-neutral-400 font-mono">{{ invoice.number }}</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="handleExport"
            :disabled="isExporting"
            class="bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full px-5 py-2 hover:scale-[1.03] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.4)] disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>⬇</span> {{ isExporting ? 'Generando PDF...' : 'Exportar PDF' }}
          </button>
          <button
            type="button"
            @click="emit('close')"
            class="text-neutral-400 hover:text-white text-xs uppercase tracking-wider font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <!-- Printable A4 document container -->
      <div class="p-6 overflow-y-auto bg-neutral-900/50 flex-1">
        <div
          ref="previewRef"
          class="bg-white text-neutral-900 p-8 sm:p-12 rounded-xl shadow-2xl mx-auto max-w-2xl text-sm font-sans"
          style="min-height: 297mm; box-sizing: border-box;"
        >
          <!-- Document Header -->
          <div class="flex justify-between items-start border-b border-neutral-200 pb-6 mb-8">
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-neutral-900 mb-1">FACTURA</h1>
              <p class="text-sm font-mono text-neutral-500 font-semibold">{{ invoice.number }}</p>
            </div>
            <div class="text-right text-xs text-neutral-600 space-y-1">
              <div><span class="font-medium text-neutral-800">Fecha:</span> {{ formatDate(invoice.date) }}</div>
              <div><span class="font-medium text-neutral-800">Vencimiento:</span> {{ formatDate(invoice.dueDate) }}</div>
            </div>
          </div>

          <!-- Issuer and Client Grid -->
          <div class="grid grid-cols-2 gap-8 mb-8 text-xs leading-relaxed">
            <div>
              <p class="font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">De (Emisor)</p>
              <p class="font-bold text-neutral-900 text-sm mb-1">{{ profile.name || '—' }}</p>
              <p v-if="profile.taxId" class="text-neutral-600">NIF/RFC: {{ profile.taxId }}</p>
              <p v-if="profile.address" class="text-neutral-600">{{ profile.address }}</p>
              <p v-if="profile.email" class="text-neutral-600">{{ profile.email }}</p>
              <p v-if="profile.phone" class="text-neutral-600">{{ profile.phone }}</p>
            </div>

            <div>
              <p class="font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">Para (Cliente)</p>
              <p class="font-bold text-neutral-900 text-sm mb-1">{{ invoice.client.name || '—' }}</p>
              <p v-if="invoice.client.taxId" class="text-neutral-600">NIF/RFC: {{ invoice.client.taxId }}</p>
              <p v-if="invoice.client.address" class="text-neutral-600">{{ invoice.client.address }}</p>
              <p v-if="invoice.client.email" class="text-neutral-600">{{ invoice.client.email }}</p>
            </div>
          </div>

          <!-- Items Table -->
          <table class="w-full text-xs text-left mb-8 border-collapse">
            <thead>
              <tr class="border-b-2 border-neutral-900 text-neutral-900 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-2.5">Descripción</th>
                <th class="py-2.5 text-center w-16">Cant.</th>
                <th class="py-2.5 text-right w-24">Precio</th>
                <th class="py-2.5 text-right w-28">Importe</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200">
              <tr v-for="(item, i) in invoice.items" :key="i" class="text-neutral-800">
                <td class="py-3 pr-2">{{ item.description || '—' }}</td>
                <td class="py-3 text-center">{{ item.qty }}</td>
                <td class="py-3 text-right">{{ formatShort(item.price, cur) }}</td>
                <td class="py-3 text-right font-medium">{{ formatShort(item.qty * item.price, cur) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals summary -->
          <div class="flex justify-end mb-10">
            <div class="w-64 space-y-2 text-xs">
              <div class="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span class="font-medium text-neutral-900">{{ formatShort(subtotal, cur) }}</span>
              </div>
              <div v-if="invoice.taxRate > 0" class="flex justify-between text-neutral-600">
                <span>Impuesto ({{ invoice.taxRate }}%):</span>
                <span class="font-medium text-neutral-900">{{ formatShort(taxAmount, cur) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t-2 border-neutral-900 font-bold text-base text-neutral-900">
                <span>Total:</span>
                <span>{{ formatShort(total, cur) }} {{ cur }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Info & Notes -->
          <div class="space-y-6 pt-6 border-t border-neutral-200 text-xs leading-relaxed text-neutral-700">
            <div v-if="invoice.paymentInfo">
              <h4 class="font-bold text-neutral-900 uppercase tracking-wider text-[10px] mb-1">Datos de Pago</h4>
              <p class="whitespace-pre-line text-neutral-600">{{ invoice.paymentInfo }}</p>
            </div>
            <div v-if="invoice.notes">
              <h4 class="font-bold text-neutral-900 uppercase tracking-wider text-[10px] mb-1">Notas</h4>
              <p class="whitespace-pre-line text-neutral-600">{{ invoice.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
