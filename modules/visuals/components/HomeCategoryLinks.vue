<script setup lang="ts">
const categories = ['Productivity', 'Design', 'Infrastructure' ]
const active = ref('All')
</script>

<template>
  <nav class="flex gap-5 overflow-x-auto no-scrollbar pb-1 w-full justify-center">
    <button
      v-for="cat in categories"
      :key="cat"
      @click="active = cat"
      :class="[
        'shrink-0 text-xs font-sans font-extralight tracking-[0.1em] transition-all duration-300 pb-0.5',
        active === cat
          ? 'text-white border-b border-white/40'
          : 'text-neutral-500 hover:text-neutral-300'
      ]"
    >
      {{ cat }}
    </button>
  </nav>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
