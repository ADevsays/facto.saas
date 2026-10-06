<script setup lang="ts">
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()
</script>

<template>
  <div class="mt-4 flex flex-col items-center justify-center gap-8">
    <div class="flex items-center justify-center gap-3">
      <img src="/favicon.svg" alt="Facto" class="w-9 h-9 opacity-90 mt-1" />
      <span class="facto-logo font-serif text-3xl md:text-[2.5rem] tracking-tight leading-none select-none">
        Facto
      </span>
    </div>
    <div class="flex flex-col items-center justify-center gap-3 sm:gap-4">
      <h1 class="text-neutral-300 font-serif font-medium tracking-tight text-2xl md:text-3xl text-center">
        {{ t.home_header.title_start }} <span class="font-bold px-1">{{ t.home_header.title_highlight }}</span> {{ t.home_header.title_end }}
      </h1>
      <p class="text-neutral-400 font-sans font-normal text-sm md:text-base text-center max-w-2xl px-4">
        {{ t.home_header.description }}
        <NuxtLink :to="localePath('/saas')" class="text-neutral-200 hover:text-white transition-colors underline decoration-neutral-500/50 hover:decoration-neutral-400/80 underline-offset-4 ml-1">{{ t.home_header.explore_ranking }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.facto-logo {
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0) 70%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: rgba(0, 212, 255, 0.3);
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.4));
  animation: shine 12s ease-in-out infinite;
  display: inline-block;
}

@keyframes shine {
  0%   { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
</style>
