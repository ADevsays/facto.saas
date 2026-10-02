<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import { computed } from 'vue'
import { useCategories } from '~/composables/useCategories'
import { useSaasViewMeta } from '~/composables/useSaasViewMeta'
import SaasListView from '~/modules/visuals/views/SaasListView.vue'

defineI18nRoute({
  paths: {
    en: '/saas/category/[slug]',
    es: '/saas/categoria/[slug]'
  }
})

const route = useRoute()
const slug = route.params.slug as string
const { categories, fetchCategories } = useCategories()
const { getCategoryMeta } = useSaasViewMeta()

await fetchCategories()

const category = computed(() => categories.value.find(c => c.slug === slug))

const { locale } = useI18n()

const categoryMeta = computed(() => getCategoryMeta(slug, category.value?.name, locale.value))

useAppSeo({
  title: () => categoryMeta.value.seoTitle,
  description: () => categoryMeta.value.seoDescription,
})
</script>

<template>
  <SaasListView />
</template>
