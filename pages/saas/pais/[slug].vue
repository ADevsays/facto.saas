<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import { computed } from 'vue'
import { useCountries } from '~/composables/useCountries'
import { useSaasViewMeta } from '~/composables/useSaasViewMeta'
import SaasListView from '~/modules/visuals/views/SaasListView.vue'

defineI18nRoute({
  paths: {
    en: '/saas/country/[slug]',
    es: '/saas/pais/[slug]'
  }
})

const route = useRoute()
const slug = route.params.slug as string
const { countries, fetchCountries } = useCountries()
const { getCountryMeta } = useSaasViewMeta()

await fetchCountries()

const country = computed(() => countries.value.find(c => c.slug === slug))

const { locale } = useI18n()

const countryMeta = computed(() => getCountryMeta(slug, country.value?.name, locale.value))

useAppSeo({
  title: () => countryMeta.value.seoTitle,
  description: () => countryMeta.value.seoDescription,
})
</script>

<template>
  <SaasListView />
</template>
