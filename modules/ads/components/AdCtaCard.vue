<template>
  <div
    role="button"
    class="ad-cta shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer select-none transition-all duration-500"
  >
    <span class="ad-cta__icon text-xl leading-none transition-all duration-500">✦</span>
    <div class="flex flex-col gap-0.5">
      <p class="ad-cta__title text-sm font-sans font-medium whitespace-nowrap transition-all duration-500">Anúnciate aquí</p>
      <p class="ad-cta__sub text-xs font-sans font-extralight tracking-[0.08em] whitespace-nowrap transition-all duration-500">2/20 cupos libres</p>
    </div>
  </div>
</template>

<style scoped>
.ad-cta {
  border: 1px solid rgba(255, 255, 255, 0.04);
  background-color: #0f0f12;
}
.ad-cta__icon  { opacity: 0.45; filter: grayscale(1); }
.ad-cta__title { color: rgba(255,255,255,0.55); }
.ad-cta__sub   { color: rgba(255,255,255,0.35); }

.ad-cta:hover {
  border-color: rgba(255, 255, 255, 0.18);
  background-color: #1a1a1f;
  box-shadow: 0 0 22px rgba(255, 255, 255, 0.05);
}
.ad-cta:hover .ad-cta__icon  { opacity: 1; filter: grayscale(0); }
.ad-cta:hover .ad-cta__title { color: rgba(255,255,255,1); }
.ad-cta:hover .ad-cta__sub   { color: rgba(255,255,255,0.45); }
</style>
