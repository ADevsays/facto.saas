<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import { computed } from 'vue'
import { useCategories } from '~/composables/useCategories'
import SaasListView from '~/modules/visuals/views/SaasListView.vue'

const route = useRoute()
const slug = route.params.slug as string
const { categories, fetchCategories } = useCategories()

await fetchCategories()

const category = computed(() => categories.value.find(c => c.slug === slug))

useSeoMeta({
  title: () => category.value ? `${category.value.name} - Startups y SaaS | Facto` : 'Categoría | Facto',
  description: () => category.value?.description || `Descubre y filtra las mejores startups SaaS en la categoría ${slug}.`
})
</script>

<template>
  <SaasListView />
</template>
