<script setup lang="ts">
import CountryGridView from '~/modules/visuals/views/CountryGridView.vue'

defineI18nRoute({
  paths: {
    en: '/saas/country',
    es: '/saas/pais'
  }
})

const { locale } = useI18n()

useAppSeo({
  title: () => locale.value === 'en'
    ? 'Browse SaaS by Country — Global Startups & MRR Ranking | Facto'
    : 'Explora SaaS por País — Ranking Global de Startups y MRR | Facto',
  description: () => locale.value === 'en'
    ? 'Discover the most profitable software companies and startups by country with real verified revenue metrics on Facto.'
    : 'Descubre las startups y empresas de software más rentables por país con métricas de facturación real verificadas en Facto.',
})
</script>

<template>
  <CountryGridView />
</template>
