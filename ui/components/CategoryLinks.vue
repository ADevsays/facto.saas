<script setup lang="ts">
interface CategoryItem {
  id: string
  name: string
  slug: string
}

defineProps<{
  categories: CategoryItem[]
}>()

const emit = defineEmits<{
  (e: 'select', slug: string): void
  (e: 'select-all'): void
}>()
</script>

<template>
  <nav class="flex flex-wrap gap-x-8 gap-y-3.5 w-full justify-center items-center">
    <button
      @click="emit('select-all')"
      class="shrink-0 text-xs font-sans font-extralight tracking-[0.15em] text-neutral-500 hover:text-neutral-300 transition-all duration-300 pb-0.5 uppercase"
    >
      Todas
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id"
      @click="emit('select', cat.slug)"
      class="shrink-0 text-xs font-sans font-extralight tracking-[0.15em] text-neutral-500 hover:text-neutral-300 transition-all duration-300 pb-0.5 uppercase"
    >
      {{ cat.name }}
    </button>
  </nav>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
