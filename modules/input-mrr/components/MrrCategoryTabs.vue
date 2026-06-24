<script setup lang="ts">
import ParticleText from '~/ui/components/ParticleText.vue'
defineProps<{
  categories: { name: string; slug: string }[]
  active: string
}>()

defineEmits<{
  (e: 'select', slug: string): void
}>()
</script>

<template>
<nav class="mt-3 px-4 flex gap-5 sm:gap-0 sm:justify-between overflow-x-auto no-scrollbar pb-1 w-full">
    <button
      v-for="(cat, index) in categories"
      :key="index"
      @click="$emit('select', cat.slug)"
      :class="[
        'shrink-0 text-xs font-sans font-extralight tracking-[0.1em] transition-all duration-300 pb-1 relative',
        active === cat.slug
          ? 'text-white font-normal'
          : 'text-neutral-500 hover:text-neutral-300'
      ]"
    >
      <ParticleText :text="cat.name" />
      <div
        v-if="active === cat.slug"
        class="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"
      ></div>
    </button>
  </nav>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

