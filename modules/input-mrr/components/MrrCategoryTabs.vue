<script setup lang="ts">
const active = defineModel<string>({ required: true })
defineProps<{
  categories: string[]
}>()
</script>

<template>
<nav class="mt-3 px-4 flex gap-5 sm:gap-0 sm:justify-between overflow-x-auto no-scrollbar pb-1 w-full">
    <button
      v-for="cat in categories"
      :key="cat"
      @click="active = cat"
      :class="[
        'shrink-0 text-xs font-sans font-extralight tracking-[0.1em] transition-all duration-300 pb-1 relative',
        active === cat
          ? 'text-white font-normal'
          : 'text-neutral-500 hover:text-neutral-300'
      ]"
    >
      {{ cat }}
      <div
        v-if="active === cat"
        class="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]"
      ></div>
    </button>
  </nav>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
