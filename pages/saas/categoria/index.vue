<script setup lang="ts">
import CategoryGridView from '~/modules/visuals/views/CategoryGridView.vue'

defineI18nRoute({
  paths: {
    en: '/saas/category',
    es: '/saas/categoria'
  }
})

const { locale } = useI18n()

useAppSeo({
  title: () => locale.value === 'en'
    ? 'Browse SaaS by Category — Verified Startups & MRR | Facto'
    : 'Explora SaaS por Categoría — Startups y MRR Verificado | Facto',
  description: () => locale.value === 'en'
    ? 'Find the best SaaS tools across all industries: AI, Marketing, FinTech, Dev Tools, and more with verified revenue metrics on Facto.'
    : 'Encuentra las mejores herramientas SaaS por industria: IA, Marketing, Finanzas, Dev Tools y más con ingresos reales verificados en Facto.',
})
</script>

<template>
  <CategoryGridView />
</template>
