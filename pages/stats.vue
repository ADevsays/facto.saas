<script setup lang="ts">
import StatsView from '~/modules/stats/views/StatsView.vue'
import { useAppSchema } from '~/composables/useAppSchema'
import { useStatsData } from '~/modules/stats/composables/useStatsData'

import es from '~/modules/stats/locales/es.json'
import en from '~/modules/stats/locales/en.json'

defineI18nRoute({
  paths: {
    es: '/stats',
    en: '/stats'
  }
})

const { t } = useLanguage({ es, en })
const { defineWebSite } = useAppSchema()
const { stats } = await useStatsData()

defineWebSite({
  name: 'Facto - Estadísticas de Facto Hoy',
  description: 'Métricas consolidadas de facturación verificada en Stripe, ritmo de lanzamientos y volumen de visitas recibidas en tiempo real por los proyectos SaaS listados en Facto.',
})

useAppSeo({
  title: () => t.value?.seo_title || 'Estadísticas del Ecosistema SaaS | Facto',
  description: () => t.value?.seo_description || 'Métricas en tiempo real, crecimiento de MRR, startups agregadas y visitas globales a los proyectos SaaS verificados en Facto.',
  customOgImage: true,
})

defineOgImageComponent('StatsOverview', {
  totalRevenue: stats.value?.summary?.totalRevenue ?? 0,
  totalMrr: stats.value?.summary?.totalMrr ?? 0,
  totalStartups: stats.value?.summary?.totalStartups ?? 0,
  totalViews: stats.value?.summary?.totalViews ?? 0,
  countriesCount: stats.value?.summary?.countriesCount ?? 0,
  categoriesCount: stats.value?.summary?.categoriesCount ?? 0,
  verifiedCount: stats.value?.summary?.verifiedCount ?? 0,
})
</script>

<template>
  <StatsView />
</template>
