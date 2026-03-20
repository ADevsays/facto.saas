<script setup lang="ts">
const props = defineProps<{
  name: string
  tagline: string
  emoji: string
  color?: string
}>()

const borderStyle = computed(() => props.color
  ? { border: `1px solid ${props.color}55`, backgroundColor: `${props.color}0d` }
  : {}
)

const hoverStyle = computed(() => props.color
  ? { '--glow': `${props.color}30` }
  : { '--glow': 'rgba(255,255,255,0.06)' }
)
</script>

<template>
  <article
    class="ad-card shrink-0 flex items-center gap-4 rounded-xl px-6 py-4 cursor-pointer transition-all duration-500 select-none border border-white/10 bg-white/5"
    :style="{ ...borderStyle, ...hoverStyle }"
  >
    <span class="text-2xl leading-none">{{ emoji }}</span>
    <div class="flex flex-col gap-0.5">
      <p class="text-white text-sm font-sans font-medium whitespace-nowrap">{{ name }}</p>
      <p class="text-neutral-400 text-xs font-sans font-extralight tracking-[0.08em] whitespace-nowrap">{{ tagline }}</p>
    </div>
    <span
      class="ml-4 text-[10px] font-sans font-extralight tracking-[0.15em] uppercase border px-2 py-0.5 rounded-full"
      :style="color ? { color, borderColor: `${color}55` } : { color: '#00D4FF', borderColor: 'rgba(0,212,255,0.3)' }"
    >
      Ad
    </span>
  </article>
</template>

<style scoped>
.ad-card:hover {
  background-color: rgba(255, 255, 255, 0.09);
  border-color: color-mix(in srgb, var(--glow) 80%, white);
  box-shadow: 0 0 20px var(--glow);
}
</style>
