<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div 
    class="p-6 md:p-8 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col justify-between relative overflow-hidden shadow-lg"
  >
    <div>
      <div v-if="title || $slots.icon" class="flex items-center gap-2 mb-4">
        <slot name="icon" />
        <span v-if="title" class="text-[10px] font-sans font-medium tracking-[0.2em] text-neutral-400 uppercase">
          {{ title }}
        </span>
      </div>
      <slot />
    </div>
    <slot name="footer" />
  </div>
</template>
