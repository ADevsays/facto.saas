<script setup lang="ts">
defineProps<{
  name: string
  category: string
  mrr: string
  rank?: number
  revenue?: string
  multiplier?: string
}>()
</script>

<template>
  <article class="saas-card group shrink-0 w-64 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3.5 flex flex-col gap-2 cursor-pointer transition-all duration-500 hover:border-[#00D4FF]/30">

    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <span class="text-xs font-serif text-white/60">{{ name[0] }}</span>
      </div>

      <div>
        <p class="font-sans text-sm font-medium text-white leading-tight truncate">{{ name }}</p>
        <p class="text-[10px] font-sans font-extralight tracking-[0.06em] text-neutral-500 uppercase mt-0.5">{{ category }}</p>
      </div>
    </div>

    <div class="mt-auto pt-2 border-t border-white/5">
      <div class="flex items-center justify-between gap-2">
        <div class="flex flex-col">
          <span class="text-[9px] font-sans font-extralight tracking-[0.1em] text-neutral-600 uppercase">MRR</span>
          <span class="text-xs font-mono text-white">{{ mrr }}</span>
        </div>
        <div v-if="revenue" class="flex flex-col items-center">
          <span class="text-[9px] font-sans font-extralight tracking-[0.1em] text-neutral-600 uppercase">Revenue</span>
          <span class="text-xs font-mono text-neutral-300">{{ revenue }}</span>
        </div>
        <div v-if="multiplier" class="flex flex-col items-end">
          <span class="text-[9px] font-sans font-extralight tracking-[0.1em] text-neutral-600 uppercase">Multiple</span>
          <span class="text-xs font-mono text-[#00D4FF]">{{ multiplier }}</span>
        </div>
      </div>
      <span v-if="rank" class="text-[10px] font-mono text-[#00D4FF] opacity-50 mt-1.5 block">#{{ rank }}</span>
    </div>
  </article>
</template>

<style scoped>
.saas-card:hover {
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.06), 0 4px 16px rgba(0, 0, 0, 0.4);
  background-color: rgba(255, 255, 255, 0.07);
}
</style>


