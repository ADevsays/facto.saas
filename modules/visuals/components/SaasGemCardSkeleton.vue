<template>
  <div class="gem-card-skeleton relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 flex flex-col justify-between h-[210px]">
    <!-- Top Row: Logo, Name, Category and Views -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <!-- Logo Box -->
        <div class="w-12 h-12 rounded-xl bg-white/10 shrink-0"></div>
        <!-- Name & Category Pill -->
        <div class="flex flex-col gap-2 flex-1 min-w-0">
          <div class="h-4 rounded-md bg-white/15 w-3/5"></div>
          <div class="h-3 rounded-full bg-white/5 w-2/5"></div>
        </div>
      </div>
      <!-- Views Counter Skeleton -->
      <div class="flex flex-col items-end gap-1 shrink-0">
        <div class="h-2 rounded bg-white/5 w-8"></div>
        <div class="h-3 rounded bg-white/10 w-6 mt-0.5"></div>
      </div>
    </div>

    <!-- Description Skeleton: 2 lines -->
    <div class="flex flex-col gap-2 mt-1">
      <div class="h-2.5 rounded bg-white/5 w-full"></div>
      <div class="h-2.5 rounded bg-white/5 w-4/5"></div>
    </div>

    <!-- Bottom Row: MRR & Revenue -->
    <div class="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
      <div class="flex flex-col gap-1">
        <div class="h-2 rounded bg-white/5 w-8"></div>
        <div class="h-3.5 rounded bg-white/15 w-14"></div>
      </div>
      <div class="flex flex-col items-end gap-1">
        <div class="h-2 rounded bg-white/5 w-12"></div>
        <div class="h-3.5 rounded bg-white/15 w-14"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gem-card-skeleton {
  position: relative;
  overflow: hidden;
}

.gem-card-skeleton::after {
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
    rgba(255, 255, 255, 0.02) 20%,
    rgba(255, 255, 255, 0.06) 60%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2.2s infinite ease-in-out;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
