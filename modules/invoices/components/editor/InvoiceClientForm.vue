<script setup lang="ts">
import type { InvoiceClient } from '../../types'
import InvoiceFormField from '../common/InvoiceFormField.vue'

const props = defineProps<{
  client: InvoiceClient
}>()

const emit = defineEmits<{
  (e: 'update:client', client: InvoiceClient): void
}>()

const updateField = (key: keyof InvoiceClient, val: string) => {
  emit('update:client', { ...props.client, [key]: val })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 sm:p-8 bg-[#0A0A0C] border border-white/5 rounded-3xl font-sans">
    <div class="flex items-center gap-3 border-b border-white/5 pb-4">
      <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"></span>
      <h3 class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/60">Datos del Cliente</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InvoiceFormField
        label="Nombre / Razón Social"
        :modelValue="client.name"
        placeholder="Ej: Stripe Inc. o Juan Pérez"
        required
        @update:modelValue="val => updateField('name', String(val))"
      />
      <InvoiceFormField
        label="NIF / RFC / Tax ID"
        :modelValue="client.taxId"
        placeholder="Ej: B-12345678"
        @update:modelValue="val => updateField('taxId', String(val))"
      />
      <InvoiceFormField
        label="Email del Cliente"
        type="email"
        :modelValue="client.email"
        placeholder="facturacion@cliente.com"
        @update:modelValue="val => updateField('email', String(val))"
      />
      <InvoiceFormField
        label="Dirección"
        :modelValue="client.address"
        placeholder="Dirección completa del cliente"
        @update:modelValue="val => updateField('address', String(val))"
      />
    </div>
  </div>
</template>
