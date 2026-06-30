<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div class="peer w-3 h-3 rounded-full border border-neutral-500 text-neutral-500 flex items-center justify-center text-[7.5px] cursor-default transition-colors hover:text-white hover:border-white shrink-0">
    i
  </div>
  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-[#030305]/95 backdrop-blur-md border border-white/10 text-neutral-400 text-[10px] font-sans font-thin tracking-[0.08em] leading-relaxed p-3 rounded-xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible hover:opacity-100 hover:visible transition-all duration-300 z-20 pointer-events-auto shadow-xl text-center">
    {{ text }}
  </div>
</template>
