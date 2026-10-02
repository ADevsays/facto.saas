<script setup lang="ts">
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

defineProps<{
  revenueDisplay: string
  viewsDisplay: string
}>()
</script>

<template>
  <div class="my-5 rounded-2xl p-5 border border-white/10 bg-surface-elevated hover:border-[#00D4FF]/30 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col items-center relative overflow-hidden group">
    <!-- Subtle Ambient Radial Glow -->
    <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#00D4FF]/10 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Rocket Icon -->
    <div class="w-9 h-9 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/25 flex items-center justify-center mb-3 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.15)] relative z-10">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
      </svg>
    </div>

    <!-- Two Metrics Columns -->
    <div class="w-full flex items-center justify-center gap-6 relative z-10">
      <!-- Left: Facturado -->
      <div class="flex-1 flex flex-col items-center">
        <span class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
          {{ revenueDisplay }}
        </span>
        <span class="text-[10px] font-sans font-medium text-neutral-400 uppercase tracking-widest mt-1">
          {{ t.share_achievement.billed }}
        </span>
      </div>

      <!-- Vertical Divider -->
      <div class="w-px h-10 bg-white/10"></div>

      <!-- Right: Visitas Reales -->
      <div class="flex-1 flex flex-col items-center">
        <span class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
          {{ viewsDisplay }}
        </span>
        <span class="text-[10px] font-sans font-medium text-neutral-400 uppercase tracking-widest mt-1">
          {{ t.share_achievement.real_views }}
        </span>
      </div>
    </div>

    <!-- Bottom Tag -->
    <div class="mt-4 pt-3 border-t border-white/5 w-full text-center relative z-10">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[11px] font-mono text-[#00D4FF] tracking-wide">
        {{ t.share_achievement.top_percent }}
      </span>
    </div>
  </div>
</template>
