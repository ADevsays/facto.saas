<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Invoice, InvoiceProfile } from '../types'
import { formatShort } from '../const/currencies'
import { formatDate } from '../utils/formatters'
import { computeInvoiceSummary } from '../utils/calculations'

const props = defineProps<{
  invoice: Invoice
  profile: InvoiceProfile
  compact?: boolean
}>()

const exportRef = ref<HTMLElement | null>(null)
const isExporting = ref(false)

const summary = computed(() => computeInvoiceSummary(props.invoice.items, props.invoice.taxRate))
const cur = computed(() => props.invoice.currency)

const handleExport = async () => {
  if (!exportRef.value || isExporting.value) return
  isExporting.value = true
  try {
    const html2pdf = (await import('html2pdf.js')).default
    await html2pdf().set({
      margin: 0,
      filename: `${props.invoice.number}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    }).from(exportRef.value).save()
  } catch (err) {
    console.error('Error generating PDF:', err)
  } finally {
    isExporting.value = false
  }
}

defineExpose({ exportRef, handleExport })
</script>

<template>
  <div class="bg-[#0A0A0C] border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"></span>
        <span class="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-white/40">Vista Previa</span>
      </div>
      <button
        type="button"
        @click="handleExport"
        :disabled="isExporting"
        class="inline-flex items-center gap-1.5 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full py-2.5 px-5 hover:scale-[1.02] transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.3),0_0_30px_rgba(0,212,255,0.15)] disabled:opacity-50 cursor-pointer"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ isExporting ? 'Generando...' : 'Exportar PDF' }}
      </button>
    </div>

    <!-- ═══ VISTA PREVIA (UI) — compacta, responsive ═══ -->
    <div class="overflow-y-auto rounded-xl bg-black/30 p-3 max-h-[600px]">
      <div
        class="bg-white text-neutral-900 rounded-lg shadow-2xl mx-auto font-sans"
        style="width: 100%; padding: clamp(20px, 5%, 40px); box-sizing: border-box; font-size: 11px; line-height: 1.5;"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 14px; margin-bottom: 18px;">
          <div>
            <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.04em; color: #111; margin-bottom: 2px;">FACTURA</div>
            <div style="font-size: 9px; color: #999; font-family: monospace; letter-spacing: 0.05em;">{{ invoice.number }}</div>
          </div>
          <div style="text-align: right; color: #555; font-size: 10px; line-height: 1.7;">
            <div><span style="font-weight: 700; color: #111;">Fecha:</span> {{ formatDate(invoice.date) }}</div>
            <div><span style="font-weight: 700; color: #111;">Venc.:</span> {{ formatDate(invoice.dueDate) }}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 18px;">
          <div style="flex: 1;">
            <div style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #bbb; margin-bottom: 5px;">De</div>
            <div style="font-weight: 700; font-size: 11px; color: #111; margin-bottom: 2px;">{{ profile.name || '—' }}</div>
            <div v-if="profile.taxId" style="color: #666; font-size: 10px;">{{ profile.taxId }}</div>
            <div v-if="profile.address" style="color: #666; font-size: 10px;">{{ profile.address }}</div>
            <div v-if="profile.email" style="color: #666; font-size: 10px;">{{ profile.email }}</div>
          </div>
          <div style="width: 150px;">
            <div style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #bbb; margin-bottom: 5px;">Para</div>
            <div style="font-weight: 700; font-size: 11px; color: #111; margin-bottom: 2px;">{{ invoice.client.name || '—' }}</div>
            <div v-if="invoice.client.taxId" style="color: #666; font-size: 10px;">{{ invoice.client.taxId }}</div>
            <div v-if="invoice.client.address" style="color: #666; font-size: 10px;">{{ invoice.client.address }}</div>
            <div v-if="invoice.client.email" style="color: #666; font-size: 10px;">{{ invoice.client.email }}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
          <thead>
            <tr style="border-bottom: 1px solid #111; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #333;">
              <th style="text-align: left; padding: 5px 4px 5px 0;">Descripción</th>
              <th style="text-align: center; padding: 5px 4px; width: 35px;">Cant.</th>
              <th style="text-align: right; padding: 5px 4px; width: 55px;">Precio</th>
              <th style="text-align: right; padding: 5px 0 5px 4px; width: 60px;">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in invoice.items" :key="i" style="border-bottom: 1px solid #eee; color: #333;">
              <td style="padding: 6px 4px 6px 0; font-size: 11px;">{{ item.description || '—' }}</td>
              <td style="text-align: center; padding: 6px 4px; font-size: 11px;">{{ item.qty }}</td>
              <td style="text-align: right; padding: 6px 4px; font-size: 11px;">{{ formatShort(item.price, cur) }}</td>
              <td style="text-align: right; padding: 6px 0 6px 4px; font-weight: 700; font-size: 11px;">{{ formatShort(item.qty * item.price, cur) }}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
          <div style="width: 150px;">
            <div style="display: flex; justify-content: space-between; color: #666; padding: 2px 0; font-size: 10px;">
              <span>Subtotal</span><span>{{ formatShort(summary.subtotal, cur) }}</span>
            </div>
            <div v-if="invoice.taxRate > 0" style="display: flex; justify-content: space-between; color: #666; padding: 2px 0; font-size: 10px;">
              <span>Impuesto ({{ invoice.taxRate }}%)</span><span>{{ formatShort(summary.taxAmount, cur) }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #111; margin-top: 5px; padding-top: 5px; font-weight: 800; font-size: 12px; color: #111;">
              <span>Total</span><span>{{ formatShort(summary.total, cur) }} {{ cur }}</span>
            </div>
          </div>
        </div>

        <div v-if="invoice.paymentInfo || invoice.notes" style="border-top: 1px solid #eee; padding-top: 10px; font-size: 10px; color: #666; line-height: 1.6;">
          <div v-if="invoice.paymentInfo" style="margin-bottom: 6px;">
            <div style="font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 0.08em; font-size: 8px; margin-bottom: 3px;">Datos de Pago</div>
            <div style="white-space: pre-line;">{{ invoice.paymentInfo }}</div>
          </div>
          <div v-if="invoice.notes">
            <div style="font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 0.08em; font-size: 8px; margin-bottom: 3px;">Notas</div>
            <div style="white-space: pre-line;">{{ invoice.notes }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ EXPORT TEMPLATE (oculto, fuera de pantalla) — A4 real ═══ -->
  <!-- Este div NUNCA es visible. Solo html2pdf lo lee al exportar. -->
  <div style="position: fixed; left: -9999px; top: 0; pointer-events: none; z-index: -1;">
    <div
      ref="exportRef"
      style="width: 794px; padding: 56px 64px; box-sizing: border-box; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; background: white; color: #111;"
    >
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 22px; margin-bottom: 32px;">
        <div>
          <div style="font-size: 30px; font-weight: 800; letter-spacing: -0.04em; color: #111; margin-bottom: 4px;">FACTURA</div>
          <div style="font-size: 12px; color: #999; font-family: monospace; letter-spacing: 0.06em;">{{ invoice.number }}</div>
        </div>
        <div style="text-align: right; color: #555; font-size: 13px; line-height: 1.9;">
          <div><span style="font-weight: 700; color: #111;">Fecha:</span> {{ formatDate(invoice.date) }}</div>
          <div><span style="font-weight: 700; color: #111;">Vencimiento:</span> {{ formatDate(invoice.dueDate) }}</div>
        </div>
      </div>

      <!-- Parties -->
      <div style="display: flex; justify-content: space-between; gap: 32px; margin-bottom: 40px;">
        <div style="flex: 1;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; margin-bottom: 8px;">De</div>
          <div style="font-weight: 700; font-size: 15px; color: #111; margin-bottom: 4px;">{{ profile.name || '—' }}</div>
          <div v-if="profile.taxId" style="color: #555; font-size: 13px; margin-top: 2px;">{{ profile.taxId }}</div>
          <div v-if="profile.address" style="color: #555; font-size: 13px; margin-top: 2px;">{{ profile.address }}</div>
          <div v-if="profile.email" style="color: #555; font-size: 13px; margin-top: 2px;">{{ profile.email }}</div>
        </div>
        <div style="width: 250px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; margin-bottom: 8px;">Para</div>
          <div style="font-weight: 700; font-size: 15px; color: #111; margin-bottom: 4px;">{{ invoice.client.name || '—' }}</div>
          <div v-if="invoice.client.taxId" style="color: #555; font-size: 13px; margin-top: 2px;">{{ invoice.client.taxId }}</div>
          <div v-if="invoice.client.address" style="color: #555; font-size: 13px; margin-top: 2px;">{{ invoice.client.address }}</div>
          <div v-if="invoice.client.email" style="color: #555; font-size: 13px; margin-top: 2px;">{{ invoice.client.email }}</div>
        </div>
      </div>

      <!-- Items -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <thead>
          <tr style="border-bottom: 1.5px solid #111; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #333;">
            <th style="text-align: left; padding: 10px 8px 10px 0;">Descripción</th>
            <th style="text-align: center; padding: 10px 8px; width: 60px;">Cant.</th>
            <th style="text-align: right; padding: 10px 8px; width: 90px;">Precio</th>
            <th style="text-align: right; padding: 10px 0 10px 8px; width: 100px;">Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in invoice.items" :key="i" style="border-bottom: 1px solid #eee; color: #333;">
            <td style="padding: 12px 8px 12px 0; font-size: 14px;">{{ item.description || '—' }}</td>
            <td style="text-align: center; padding: 12px 8px; font-size: 14px;">{{ item.qty }}</td>
            <td style="text-align: right; padding: 12px 8px; font-size: 14px;">{{ formatShort(item.price, cur) }}</td>
            <td style="text-align: right; padding: 12px 0 12px 8px; font-weight: 700; font-size: 14px;">{{ formatShort(item.qty * item.price, cur) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
        <div style="width: 250px;">
          <div style="display: flex; justify-content: space-between; color: #666; padding: 5px 0; font-size: 13px;">
            <span>Subtotal</span><span>{{ formatShort(summary.subtotal, cur) }}</span>
          </div>
          <div v-if="invoice.taxRate > 0" style="display: flex; justify-content: space-between; color: #666; padding: 5px 0; font-size: 13px;">
            <span>Impuesto ({{ invoice.taxRate }}%)</span><span>{{ formatShort(summary.taxAmount, cur) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 2px solid #111; margin-top: 8px; padding-top: 10px; font-weight: 800; font-size: 17px; color: #111;">
            <span>Total</span><span>{{ formatShort(summary.total, cur) }} {{ cur }}</span>
          </div>
        </div>
      </div>

      <!-- Notes / Payment -->
      <div v-if="invoice.paymentInfo || invoice.notes" style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 13px; color: #666; line-height: 1.7;">
        <div v-if="invoice.paymentInfo" style="margin-bottom: 14px;">
          <div style="font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin-bottom: 5px;">Datos de Pago</div>
          <div style="white-space: pre-line;">{{ invoice.paymentInfo }}</div>
        </div>
        <div v-if="invoice.notes">
          <div style="font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin-bottom: 5px;">Notas</div>
          <div style="white-space: pre-line;">{{ invoice.notes }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
