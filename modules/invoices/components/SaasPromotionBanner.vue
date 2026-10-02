<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl px-8 py-6 md:py-8 text-white font-sans border-t border-white/5 my-12">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <p class="font-sans text-[14px] text-white/50 font-light leading-relaxed max-w-lg">
        Si ya tienes MRR, Facto lo certifica.
      </p>
      <NuxtLink
        :to="localePath('/add')"
        class="shrink-0 inline-flex items-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full px-6 py-3 hover:scale-[1.02] transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.3),0_0_30px_rgba(0,212,255,0.15)]"
      >
        Agregar mi SaaS
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>
