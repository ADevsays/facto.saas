<script setup lang="ts">
import { ref } from 'vue'
import type { InvoiceProfile } from '../types'
import { CURRENCIES } from '../const/currencies'

const props = defineProps<{
  profile: InvoiceProfile
  currency: string
  taxRate: number
}>()

const emit = defineEmits<{
  (e: 'save', payload: { profile: InvoiceProfile; currency: string; taxRate: number }): void
  (e: 'close'): void
}>()

const form = ref<InvoiceProfile>({ ...props.profile })
const cur = ref(props.currency || 'USD')
const tax = ref(props.taxRate || 0)

const handleSave = () => {
  emit('save', {
    profile: { ...form.value },
    currency: cur.value,
    taxRate: Number(tax.value) || 0
  })
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    @click.self="emit('close')"
  >
    <div
      class="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 text-white font-sans"
    >
      <div class="flex justify-between items-center border-b border-white/10 pb-4">
        <h2 class="text-xl font-serif font-bold text-white tracking-tight">Configuración del Emisor</h2>
        <button
          type="button"
          @click="emit('close')"
          class="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
        >
          ✕
        </button>
      </div>

      <div class="space-y-4">
        <h3 class="text-xs uppercase tracking-wider text-[#00D4FF] font-semibold">Tus Datos de Facturación</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-neutral-400 block mb-1 font-medium">Nombre / Empresa *</label>
            <input
              v-model="form.name"
              placeholder="Tu nombre o razón social"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
          <div>
            <label class="text-xs text-neutral-400 block mb-1 font-medium">NIF / RFC / Tax ID</label>
            <input
              v-model="form.taxId"
              placeholder="Identificador fiscal"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
        </div>

        <div>
          <label class="text-xs text-neutral-400 block mb-1 font-medium">Dirección Completa</label>
          <input
            v-model="form.address"
            placeholder="Calle, ciudad, país"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-neutral-400 block mb-1 font-medium">Email de Contacto</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="tu@email.com"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
          <div>
            <label class="text-xs text-neutral-400 block mb-1 font-medium">Teléfono</label>
            <input
              v-model="form.phone"
              placeholder="+1 234 567 890"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
        </div>

        <div>
          <label class="text-xs text-neutral-400 block mb-1 font-medium">Datos de Pago Predeterminados</label>
          <textarea
            v-model="form.paymentInfo"
            rows="2"
            placeholder="Banco, IBAN, SWIFT..."
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#00D4FF] resize-none"
          ></textarea>
        </div>

        <h3 class="text-xs uppercase tracking-wider text-[#00D4FF] font-semibold pt-2">Valores Predeterminados</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-neutral-400 block mb-1 font-medium">Divisa Principal</label>
            <select
              v-model="cur"
              class="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
            >
              <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">
                {{ c.code }} - {{ c.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs text-neutral-400 block mb-1 font-medium">Impuesto Predeterminado (%)</label>
            <input
              v-model="tax"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end items-center gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          @click="emit('close')"
          class="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs uppercase tracking-wider font-semibold text-neutral-300 transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="handleSave"
          class="bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full px-6 py-2.5 hover:scale-[1.03] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>
