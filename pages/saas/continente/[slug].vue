<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import { computed } from 'vue'
import { useSaasViewMeta } from '~/composables/useSaasViewMeta'
import SaasListView from '~/modules/visuals/views/SaasListView.vue'

defineI18nRoute({
  paths: {
    en: '/saas/continent/[slug]',
    es: '/saas/continente/[slug]'
  }
})

const route = useRoute()
const slug = route.params.slug as string
const { getContinentMeta } = useSaasViewMeta()
const { locale } = useI18n()

const continentMeta = computed(() => getContinentMeta(slug, locale.value))

useAppSeo({
  title: () => continentMeta.value.seoTitle,
  description: () => continentMeta.value.seoDescription,
})
</script>

<template>
  <SaasListView />
</template>
