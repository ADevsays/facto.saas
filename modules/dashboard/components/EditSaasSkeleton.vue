<template>
  <div class="space-y-10 animate-fade-in w-full">
    <!-- Header Title Skeleton -->
    <div class="space-y-2.5">
      <div class="h-8 w-64 bg-neutral-800/80 rounded-xl animate-pulse"></div>
      <div class="h-4 w-96 max-w-full bg-neutral-800/50 rounded-lg animate-pulse"></div>
    </div>

    <!-- Block 1: Basic Information Skeleton -->
    <section class="bg-surface-elevated border border-white/10 rounded-3xl p-8 md:p-10 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div class="h-6 w-44 bg-neutral-700/60 rounded-lg animate-pulse"></div>
        <div class="h-5 w-20 bg-neutral-800/70 rounded-full animate-pulse"></div>
      </div>

      <!-- Name & Category row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="space-y-2">
          <div class="h-3 w-20 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="h-[46px] w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 w-24 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="h-[46px] w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <!-- Logo Dropzone Skeleton -->
      <div class="space-y-2">
        <div class="h-3 w-16 bg-neutral-700/50 rounded animate-pulse"></div>
        <div class="w-full h-32 border border-dashed border-white/15 rounded-2xl bg-surface-dark flex flex-col items-center justify-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-neutral-700/60 border border-white/10 animate-pulse"></div>
          <div class="h-3 w-48 bg-neutral-700/40 rounded animate-pulse"></div>
        </div>
      </div>

      <!-- Description Skeleton -->
      <div class="space-y-2">
        <div class="h-3 w-28 bg-neutral-700/50 rounded animate-pulse"></div>
        <div class="h-24 w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
      </div>

      <!-- Website & Country Skeleton -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
        <div class="flex-1 space-y-2">
          <div class="h-3 w-20 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="h-[50px] w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        </div>
        <div class="shrink-0 space-y-2 sm:w-44">
          <div class="h-3 w-16 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="h-[50px] w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- Block 2: Value & Growth Skeleton -->
    <section class="bg-surface-elevated border border-white/10 rounded-3xl p-8 md:p-10 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div class="h-6 w-60 bg-neutral-700/60 rounded-lg animate-pulse"></div>
        <div class="h-5 w-16 bg-neutral-800/70 rounded-full animate-pulse"></div>
      </div>

      <!-- Problem Solved & Value Proposition Symmetrical Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-2">
          <div class="h-3 w-36 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="h-[76px] w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 w-36 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="h-[76px] w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <!-- Acquisition Channels & Tech Stack Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-2">
          <div class="h-3 w-40 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="h-[46px] w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 w-32 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="h-[46px] w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- Block 3: GitHub Sync Skeleton -->
    <section class="bg-surface-elevated border border-white/10 rounded-3xl p-8 md:p-10 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div class="h-6 w-48 bg-neutral-700/60 rounded-lg animate-pulse"></div>
        <div class="h-5 w-16 bg-neutral-800/70 rounded-full animate-pulse"></div>
      </div>
      <div class="flex gap-3">
        <div class="h-12 flex-1 bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        <div class="h-12 w-28 bg-surface-dark rounded-xl animate-pulse shrink-0"></div>
      </div>
    </section>

    <!-- Block 4: FAQ Skeleton -->
    <section class="bg-surface-elevated border border-white/10 rounded-3xl p-8 md:p-10 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div class="h-6 w-40 bg-neutral-700/60 rounded-lg animate-pulse"></div>
        <div class="h-8 w-28 bg-surface-dark rounded-xl animate-pulse"></div>
      </div>
      <div class="space-y-6">
        <div class="space-y-3 pb-6 border-b border-white/5 last:border-b-0 last:pb-0">
          <div class="flex items-center gap-3">
            <div class="h-[46px] flex-1 bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
            <div class="h-11 w-11 bg-surface-dark rounded-xl animate-pulse shrink-0"></div>
          </div>
          <div class="h-16 w-full bg-surface-dark border border-white/10 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- Block 5: Visibility Toggle Card Skeleton -->
    <section class="bg-surface-elevated border border-white/10 rounded-3xl p-6 md:p-8 flex items-center justify-between gap-4">
      <div class="space-y-2">
        <div class="h-5 w-48 bg-neutral-700/60 rounded-lg animate-pulse"></div>
        <div class="h-3.5 w-72 bg-neutral-700/40 rounded animate-pulse"></div>
      </div>
      <div class="h-10 w-28 bg-surface-dark rounded-xl animate-pulse shrink-0"></div>
    </section>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
