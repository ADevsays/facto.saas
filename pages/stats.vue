<script setup lang="ts">
import StatsView from '~/modules/stats/views/StatsView.vue'
import { useAppSchema } from '~/composables/useAppSchema'

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

defineWebSite({
  name: 'Facto - Estadísticas de Facto Hoy',
  description: 'Métricas consolidadas de facturación verificada en Stripe, ritmo de lanzamientos y volumen de visitas recibidas en tiempo real por los proyectos SaaS listados en Facto.',
})

useAppSeo({
  title: () => t.value?.seo_title || 'Estadísticas del Ecosistema SaaS | Facto',
  description: () => t.value?.seo_description || 'Métricas en tiempo real, crecimiento de MRR, startups agregadas y visitas globales a los proyectos SaaS verificados en Facto.',
  imagePath: '/og-image.png',
})
</script>

<template>
  <StatsView />
</template>
