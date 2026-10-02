<script setup lang="ts">
import InvoiceGeneratorView from '~/modules/invoices/views/InvoiceGeneratorView.vue'

defineI18nRoute({
  paths: {
    en: '/tools/invoice-generator',
    es: '/herramientas/generador-de-facturas'
  }
})
</script>

<template>
  <InvoiceGeneratorView />
</template>
