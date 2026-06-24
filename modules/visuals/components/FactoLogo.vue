<template>
  <div class="mt-4 flex flex-col items-center justify-center gap-4">
    <div class="flex items-center justify-center gap-3">
      <img src="/favicon.svg" alt="Facto" class="w-9 h-9 opacity-90 mt-1" />
      <span class="facto-logo font-serif text-3xl md:text-[2.5rem] tracking-tight leading-none select-none">
        Facto
      </span>
    </div>
    <p class="text-neutral-300 font-sans font-normal tracking-[0.06em] text-base text-center">
      El ranking de MRR de los mejores SaaS hispanos
    </p>
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
