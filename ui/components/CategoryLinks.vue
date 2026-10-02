<script setup lang="ts">
import { ROUTES } from '~/utils/routes'

interface CategoryItem {
  id: string
  name: string
  slug: string
}

defineProps<{
  categories: CategoryItem[]
}>()

const localePath = useLocalePath()
const { locale } = useI18n()
</script>

<template>
  <nav class="flex flex-wrap gap-x-8 gap-y-3.5 w-full justify-center items-center">
    <NuxtLink
      :to="localePath('/saas')"
      class="shrink-0 text-xs font-sans font-extralight tracking-[0.15em] text-neutral-500 hover:text-neutral-300 transition-all duration-300 pb-0.5 uppercase"
    >
      {{ locale === 'en' ? 'All' : 'Todas' }}
    </NuxtLink>
    <NuxtLink
      v-for="cat in categories"
      :key="cat.id"
      :to="localePath(`${ROUTES.CATEGORY}/${cat.slug}`)"
      class="shrink-0 text-xs font-sans font-extralight tracking-[0.15em] text-neutral-500 hover:text-neutral-300 transition-all duration-300 pb-0.5 uppercase"
    >
      {{ cat.name }}
    </NuxtLink>
  </nav>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
