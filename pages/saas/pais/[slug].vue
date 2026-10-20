<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import { computed } from 'vue'
import { useSaasViewMeta } from '~/composables/useSaasViewMeta'
import SaasListView from '~/modules/visuals/views/SaasListView.vue'

defineI18nRoute({
  paths: {
    en: '/saas/country/[slug]',
    es: '/saas/pais/[slug]'
  }
})

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { getCountryMeta } = useSaasViewMeta()
const { data: countries } = await useLazyFetch<Array<{ name: string, slug: string }>>('/api/countries', {
  key: 'seo-countries',
  server: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
})

const country = computed(() => countries.value?.find(c => c.slug === slug.value))

const { locale } = useI18n()

const countryMeta = computed(() => getCountryMeta(slug.value, country.value?.name, locale.value))

useAppSeo({
  title: () => countryMeta.value.seoTitle,
  description: () => countryMeta.value.seoDescription,
})
</script>

<template>
  <SaasListView />
</template>
