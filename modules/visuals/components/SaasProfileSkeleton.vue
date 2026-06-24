<template>
  <main class="min-h-screen bg-[#030305] text-white overflow-hidden relative isolate flex flex-col items-center pt-14 pb-20 px-6 w-full">
    <!-- Background effects -->
    <div class="absolute inset-0 z-[-1] pointer-events-none flex items-center justify-center">
      <div class="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <!-- Breadcrumb Skeleton -->
    <div class="w-full max-w-5xl mb-6 flex items-center gap-2">
      <div class="h-3 w-16 bg-white/5 rounded animate-pulse"></div>
      <div class="h-3 w-3 bg-white/5 rounded animate-pulse"></div>
      <div class="h-3 w-28 bg-white/10 rounded animate-pulse"></div>
    </div>

    <!-- Header Skeleton -->
    <div class="flex flex-col max-w-5xl mx-auto mb-14 w-full">
      <div class="flex flex-row items-center justify-between gap-4 mb-6 w-full">
        <div class="flex flex-row items-center gap-3 md:gap-4">
          <div class="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse shrink-0"></div>
          <div class="h-8 md:h-10 w-44 md:w-64 bg-white/10 rounded-lg animate-pulse"></div>
        </div>
        <div class="w-20 md:w-28 h-8 md:h-10 rounded-full bg-white/[0.05] animate-pulse shrink-0"></div>
      </div>
      <div class="flex flex-col gap-2 w-full max-w-3xl">
        <div class="h-3.5 bg-white/5 rounded animate-pulse w-full"></div>
        <div class="h-3.5 bg-white/5 rounded animate-pulse w-5/6"></div>
      </div>
    </div>

    <!-- Metrics Grid Skeleton -->
    <div class="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-12">
      <div v-for="i in 5" :key="'metric-' + i" :class="[
        'border border-white/10 bg-white/[0.03] rounded-2xl p-5 flex flex-col items-center text-center justify-center h-28',
        i === 1 || i === 2 || i === 5 ? 'col-span-2 md:col-span-1' : 'col-span-1'
      ]">
        <div class="h-2 w-12 bg-white/5 rounded animate-pulse mb-3"></div>
        <div class="h-6 w-20 bg-white/10 rounded animate-pulse mb-3"></div>
        <div class="h-2 w-16 bg-white/5 rounded animate-pulse"></div>
      </div>
    </div>

    <!-- Chart Card Skeleton -->
    <div class="w-full max-w-5xl mx-auto bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[#00D4FF]/[0.01] to-transparent pointer-events-none"></div>
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex flex-col gap-2">
          <div class="h-2.5 w-24 bg-white/5 rounded animate-pulse"></div>
          <div class="h-6 w-48 bg-white/10 rounded animate-pulse"></div>
        </div>
        <div class="flex gap-2">
          <div class="w-20 h-7 rounded-full bg-white/[0.05] animate-pulse"></div>
          <div class="w-24 h-7 rounded-full bg-white/[0.05] animate-pulse"></div>
        </div>
      </div>
      <!-- Simulated Chart lines/area -->
      <div class="h-[300px] border border-dashed border-white/5 rounded-2xl flex items-center justify-center bg-white/[0.01] relative overflow-hidden">
        <div class="absolute inset-0 flex items-end justify-between px-10 pb-6">
          <div v-for="h in [40, 60, 50, 75, 90, 85, 110, 130, 120, 160]" :key="h" 
               class="w-[6%] bg-white/[0.03] rounded-t-lg animate-pulse" 
               :style="{ height: h + 'px' }"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}
</style>
