<template>
  <div class="saas-card-skeleton shrink-0 w-64 rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-sm py-[18px] px-3.5 flex flex-col gap-2">
    <!-- Header: Logo y textos -->
    <div class="flex items-center gap-2 min-w-0">
      <div class="w-8 h-8 rounded-lg bg-white/10 shrink-0"></div>
      <div class="flex flex-col gap-1 flex-1 min-w-0">
        <div class="h-3.5 rounded bg-white/15 w-3/4"></div>
        <div class="h-2.5 rounded bg-white/5 w-1/2 mt-0.5"></div>
      </div>
    </div>

    <!-- Divider and Bottom Row (Exact 2 columns matching SaasCard) -->
    <div class="mt-auto pt-2 border-t border-white/10">
      <div class="flex items-center justify-between gap-2">
        <div class="flex flex-col gap-1">
          <div class="h-2 rounded bg-white/5 w-8"></div>
          <div class="h-3.5 rounded bg-white/15 w-12"></div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="h-2 rounded bg-white/5 w-8"></div>
          <div class="h-3.5 rounded bg-white/15 w-12"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.saas-card-skeleton {
  position: relative;
  overflow: hidden;
}

.saas-card-skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.03) 20%,
    rgba(255, 255, 255, 0.08) 60%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2.2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
