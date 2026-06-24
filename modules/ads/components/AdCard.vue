<script setup lang="ts">
const props = defineProps<{
  name: string
  description: string
  url: string
  image_url: string
}>()

const hoverStyle = computed(() => {
  return { '--glow': 'rgba(0, 212, 255, 0.2)' }
})
</script>

<template>
  <a
    :href="url"
    target="_blank"
    class="ad-card shrink-0 flex items-center gap-4 rounded-xl px-6 py-4 cursor-pointer transition-all duration-500 select-none border border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
    :style="hoverStyle"
  >
    <img :src="image_url" :alt="name" class="w-8 h-8 object-contain rounded-md" />
    <div class="flex flex-col gap-0.5">
      <p class="text-white text-sm font-sans font-medium whitespace-nowrap">{{ name }}</p>
      <p class="text-neutral-400 text-xs font-sans font-extralight tracking-[0.08em] whitespace-nowrap">{{ description }}</p>
    </div>
    <span
      class="ml-4 text-[10px] font-sans font-extralight tracking-[0.15em] uppercase border px-2 py-0.5 rounded-full text-[#00D4FF] border-[#00D4FF]/30"
    >
      Ad
    </span>
  </a>
</template>

<style scoped>
.ad-card:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: color-mix(in srgb, var(--glow) 80%, white);
  box-shadow: 0 0 20px var(--glow);
}
</style>
