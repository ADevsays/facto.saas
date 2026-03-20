<script setup lang="ts">
defineProps<{
  position: number
  name: string
  category: string
  mrr: string
  founder?: string
  founderAvatar?: string
}>()

const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f97316', '#ef4444', '#3b82f6']

function colorFor(pos: number) {
  return colors[(pos - 1) % colors.length]
}
</script>

<template>
  <div class="grid grid-cols-[2rem_1fr_1fr_auto] items-center py-3.5 px-5 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors duration-200 group cursor-pointer gap-3">

    <!-- Pos + Ícono + Nombre -->
    <span class="text-xs font-mono text-neutral-600 text-center">{{ position }}</span>

    <div class="flex items-center gap-2.5 min-w-0">
      <div
        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
        :style="{ backgroundColor: colorFor(position) + '33', border: `1px solid ${colorFor(position)}55` }"
      >
        <span :style="{ color: colorFor(position) }">{{ name[0] }}</span>
      </div>
      <div class="min-w-0">
        <p class="text-sm text-white font-sans truncate">{{ name }}</p>
        <p class="text-[10px] text-neutral-600 font-sans font-extralight tracking-[0.06em] truncate">{{ category }}</p>
      </div>
    </div>

    <!-- Founder -->
    <div class="flex items-center gap-2 min-w-0">
      <div class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[9px] text-neutral-400">
        {{ founder ? founder[0] : '?' }}
      </div>
      <span class="text-xs text-neutral-400 font-sans font-extralight truncate hidden md:block">{{ founder ?? '—' }}</span>
    </div>

    <!-- MRR -->
    <span class="text-sm font-mono text-[#00D4FF] tabular-nums text-right">{{ mrr }}</span>

  </div>
</template>
