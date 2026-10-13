<script setup lang="ts">
import VisualsView from '../modules/visuals/views/VisualsView.vue'
import { useAppSchema } from '~/composables/useAppSchema'
import type { SaasListItem } from '~/modules/ranking/types'

const { t } = useI18n()
const { defineWebSite } = useAppSchema()

// Resolve the lightweight catalog during SSR so direct loads render complete
// content and hydration reuses the exact same payload without another request.
await useFetch<SaasListItem[]>('/api/ranking/list?limit=1000', {
  key: 'facto-saas-list-data',
  server: true,
  default: () => [],
  getCachedData: (key, nuxtApp) => {
    const cached = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    return Array.isArray(cached) && cached.length === 0 ? undefined : cached
  },
})

defineWebSite({
  name: 'Facto',
  description: t('seo.home_desc'),
})

useAppSeo({
  title: () => t('seo.home_title'),
  description: () => t('seo.home_desc'),
})
</script>

<template>
  <VisualsView />
</template>
