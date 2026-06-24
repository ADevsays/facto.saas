<template>
  <div class="saas-card-skeleton shrink-0 w-64 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm py-[18px] px-3.5 flex flex-col gap-3">
    <!-- Header: Logo y textos -->
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg animate-pulse bg-white/5 shrink-0"></div>
      <div class="flex flex-col gap-1.5 flex-1 min-w-0">
        <div class="h-3.5 rounded bg-white/10 animate-pulse w-3/4"></div>
        <div class="h-2 rounded bg-white/5 animate-pulse w-1/2"></div>
      </div>
    </div>

    <!-- Divider and Info Grid -->
    <div class="mt-auto pt-2 border-t border-white/5 flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex flex-col gap-1">
          <div class="h-2 rounded bg-white/5 animate-pulse w-8"></div>
          <div class="h-3 rounded bg-white/10 animate-pulse w-10"></div>
        </div>
        <div class="flex flex-col items-center gap-1">
          <div class="h-2 rounded bg-white/5 animate-pulse w-12"></div>
          <div class="h-3 rounded bg-white/10 animate-pulse w-14"></div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="h-2 rounded bg-white/5 animate-pulse w-10"></div>
          <div class="h-3 rounded bg-white/10 animate-pulse w-8"></div>
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
