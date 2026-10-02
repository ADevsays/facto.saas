<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Invoice, InvoiceProfile, InvoiceItem, InvoiceClient } from '../types'
import { CURRENCIES } from '../const/currencies'
import { formatShort } from '../const/currencies'
import { todayISO, dueDateISO, generateInvoiceNumber } from '../utils/formatters'
import { computeInvoiceSummary } from '../utils/calculations'
import InvoiceItemRow from './editor/InvoiceItemRow.vue'
import InvoiceTotalsSummary from './editor/InvoiceTotalsSummary.vue'
import InvoicePreviewPane from './InvoicePreviewPane.vue'

const props = defineProps<{
  invoice: Invoice | null
  profile: InvoiceProfile
  currency: string
  taxRate: number
  nextNumber: number
}>()

const emit = defineEmits<{
  (e: 'save', invoice: Invoice): void
  (e: 'preview', invoice: Invoice): void
  (e: 'cancel'): void
}>()

const isEditing = computed(() => !!props.invoice)
const showMobilePreview = ref(false)
const notesOpen = ref(!!(props.invoice?.notes || props.invoice?.paymentInfo))

const client = ref<InvoiceClient>({
  name: props.invoice?.client.name || '',
  email: props.invoice?.client.email || '',
  address: props.invoice?.client.address || '',
  taxId: props.invoice?.client.taxId || ''
})

const createEmptyItem = (): InvoiceItem => ({ description: '', qty: 1, price: 0 })

const items = ref<InvoiceItem[]>(
  props.invoice?.items?.length ? props.invoice.items.map(i => ({ ...i })) : [createEmptyItem()]
)

const date = ref(props.invoice?.date || todayISO())
const dueDate = ref(props.invoice?.dueDate || dueDateISO())
const cur = ref(props.invoice?.currency || props.currency || 'USD')
const tax = ref(props.invoice?.taxRate ?? props.taxRate ?? 0)
const notes = ref(props.invoice?.notes || '')
const paymentInfo = ref(props.invoice?.paymentInfo ?? props.profile.paymentInfo ?? '')
const number = ref(props.invoice?.number || generateInvoiceNumber(props.nextNumber))

const updateItem = (idx: number, newItem: InvoiceItem) => { items.value[idx] = newItem }
const removeItem = (idx: number) => {
  if (items.value.length === 1) return
  items.value = items.value.filter((_, i) => i !== idx)
}
const addItem = () => items.value.push(createEmptyItem())

const summary = computed(() => computeInvoiceSummary(items.value, tax.value))

const buildInvoice = (): Invoice => ({
  id: props.invoice?.id || crypto.randomUUID(),
  number: number.value,
  date: date.value,
  dueDate: dueDate.value,
  client: { ...client.value },
  items: items.value.map(i => ({
    description: i.description,
    qty: Number(i.qty) || 0,
    price: Number(i.price) || 0
  })),
  currency: cur.value,
  taxRate: Number(tax.value) || 0,
  notes: notes.value,
  paymentInfo: paymentInfo.value,
  subtotal: summary.value.subtotal,
  total: summary.value.total,
  createdAt: props.invoice?.createdAt || new Date().toISOString()
})

const liveInvoice = computed(() => buildInvoice())

const handleSave = () => emit('save', buildInvoice())
const handlePreview = () => emit('preview', buildInvoice())

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    handleSave()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="w-full font-sans text-white">

    <!-- Mobile preview toggle -->
    <div class="lg:hidden flex justify-end mb-6">
      <button
        type="button"
        @click="showMobilePreview = !showMobilePreview"
        class="text-[10px] uppercase tracking-[0.15em] font-medium text-[#00D4FF] border border-[#00D4FF]/20 rounded-full px-4 py-2 hover:bg-[#00D4FF]/[0.06] transition-all cursor-pointer"
      >
        {{ showMobilePreview ? 'Editar' : 'Ver factura' }}
      </button>
    </div>
    <div v-if="showMobilePreview" class="lg:hidden mb-10">
      <InvoicePreviewPane :invoice="liveInvoice" :profile="profile" />
    </div>

    <!-- Split layout -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">

      <!-- ═══ COLUMNA IZQUIERDA: FORMULARIO ═══ -->
      <div class="space-y-5">

        <!-- ▸ SECCIÓN: META -->
        <div class="bg-[#0A0A0C] border border-white/5 rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-2.5 mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"></span>
            <span class="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-white/40">Datos de la Factura</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Nº -->
            <div class="space-y-2">
              <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">Nº Factura</label>
              <div class="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 text-white/40 font-mono text-[13px]">{{ number }}</div>
            </div>
            <!-- Fecha -->
            <div class="space-y-2">
              <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">Fecha</label>
              <input
                v-model="date"
                type="date"
                class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[13px] font-light focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03] transition-all duration-300 cursor-pointer"
              />
            </div>
            <!-- Vencimiento -->
            <div class="space-y-2">
              <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">Vencimiento</label>
              <input
                v-model="dueDate"
                type="date"
                class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[13px] font-light focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03] transition-all duration-300 cursor-pointer"
              />
            </div>
            <!-- Divisa -->
            <div class="space-y-2">
              <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">Divisa</label>
              <select
                v-model="cur"
                class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[13px] font-light focus:outline-none focus:border-[#00D4FF]/40 transition-all duration-300 cursor-pointer"
              >
                <option v-for="c in CURRENCIES" :key="c.code" :value="c.code" class="bg-[#0A0A0C]">
                  {{ c.code }} — {{ c.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- ▸ SECCIÓN: CLIENTE -->
        <div class="bg-[#0A0A0C] border border-white/5 rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-2.5 mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"></span>
            <span class="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-white/40">Cliente</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">
                Nombre / Razón Social <span class="text-[#00D4FF]">*</span>
              </label>
              <input
                v-model="client.name"
                placeholder="Stripe Inc."
                class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[13px] font-light placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03] transition-all duration-300"
              />
            </div>
            <div class="space-y-2">
              <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">NIF / RFC / Tax ID</label>
              <input
                v-model="client.taxId"
                placeholder="B-12345678"
                class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[13px] font-light placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03] transition-all duration-300"
              />
            </div>
            <div class="space-y-2">
              <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">Email</label>
              <input
                v-model="client.email"
                type="email"
                placeholder="facturacion@empresa.com"
                class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[13px] font-light placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03] transition-all duration-300"
              />
            </div>
            <div class="space-y-2">
              <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">Dirección</label>
              <input
                v-model="client.address"
                placeholder="Dirección completa"
                class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[13px] font-light placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03] transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <!-- ▸ SECCIÓN: CONCEPTOS -->
        <div class="bg-[#0A0A0C] border border-white/5 rounded-3xl p-6 sm:p-8">
          <div class="flex items-center gap-2.5 mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"></span>
            <span class="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-white/40">Conceptos</span>
          </div>

          <div class="space-y-3">
            <InvoiceItemRow
              v-for="(item, idx) in items"
              :key="idx"
              :item="item"
              :currency="cur"
              :canRemove="items.length > 1"
              @update:item="newItem => updateItem(idx, newItem)"
              @remove="removeItem(idx)"
            />
          </div>

          <button
            type="button"
            @click="addItem"
            class="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.10] text-white/35 hover:text-white/60 hover:border-white/20 text-[11px] uppercase tracking-[0.15em] font-medium transition-all duration-200 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar concepto
          </button>

          <!-- Totals -->
          <InvoiceTotalsSummary
            :items="items"
            v-model:taxRate="tax"
            :currency="cur"
          />
        </div>

        <!-- ▸ SECCIÓN: NOTAS (colapsable) -->
        <div class="bg-[#0A0A0C] border border-white/5 rounded-3xl overflow-hidden">
          <button
            type="button"
            @click="notesOpen = !notesOpen"
            class="w-full flex items-center justify-between px-6 sm:px-8 py-5 cursor-pointer group"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#00D4FF] group-hover:shadow-[0_0_8px_#00D4FF] transition-all"></span>
              <span class="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-white/35 group-hover:text-white/60 transition-colors">Notas y Pago</span>
            </div>
            <svg
              class="w-3.5 h-3.5 text-white/25 transition-transform duration-200 group-hover:text-white/50"
              :class="notesOpen ? 'rotate-180' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="notesOpen" class="px-6 sm:px-8 pb-6 sm:pb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">Datos de Pago</label>
                <textarea
                  v-model="paymentInfo"
                  rows="3"
                  placeholder="Banco, IBAN, SWIFT..."
                  class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[13px] font-light placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03] transition-all resize-none"
                ></textarea>
              </div>
              <div class="space-y-2">
                <label class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">Notas</label>
                <textarea
                  v-model="notes"
                  rows="3"
                  placeholder="Términos, observaciones..."
                  class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[13px] font-light placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03] transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </Transition>
        </div>

        <!-- ▸ ACCIONES (sticky bottom) -->
        <div class="sticky bottom-4 z-20">
          <div class="bg-[#0A0A0C]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl px-6 py-4 flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div>
              <p class="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-white/30 mb-0.5">Total</p>
              <p class="font-sans font-bold text-xl text-[#00D4FF]">
                {{ formatShort(summary.total, cur) }} <span class="text-sm font-normal text-white/40">{{ cur }}</span>
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="handlePreview"
                class="lg:hidden px-5 py-2.5 rounded-full border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-sans text-[10px] uppercase tracking-[0.15em] font-medium transition-all duration-200 cursor-pointer"
              >
                Vista previa
              </button>
              <button
                type="button"
                @click="handleSave"
                class="bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full px-7 py-3 hover:scale-[1.02] transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.3),0_0_30px_rgba(0,212,255,0.15)] cursor-pointer"
              >
                {{ isEditing ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ COLUMNA DERECHA: LIVE PREVIEW ═══ -->
      <div class="hidden lg:block sticky top-6">
        <InvoicePreviewPane :invoice="liveInvoice" :profile="profile" />
      </div>
    </div>
  </div>
</template>
