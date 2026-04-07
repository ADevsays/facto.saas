<script setup lang="ts">
import type { SaasListItem } from '~/modules/ranking/types'

defineProps<{
  position: number
  item: SaasListItem
}>()

const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f97316', '#ef4444', '#3b82f6']

function colorFor(pos: number) {
  return colors[(pos - 1) % colors.length]
}

function formatMrr(mrr: number | null, currency: string): string {
  if (mrr === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(mrr)
}
</script>

<template>
  <div class="grid grid-cols-[1.2rem_1fr_1fr_auto] sm:grid-cols-[2rem_1fr_1fr_auto] items-center py-3.5 px-3 sm:px-5 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors duration-200 group cursor-pointer gap-2 sm:gap-3">

    <span class="text-xs font-mono text-neutral-600 text-center">{{ position }}</span>

    <div class="flex items-center gap-2.5 min-w-0">
      <div
        v-if="item.logoUrl && !item.isIncognito"
        class="w-7 h-7 rounded-lg overflow-hidden shrink-0"
      >
        <img :src="item.logoUrl" :alt="item.name ?? ''" class="w-full h-full object-cover" />
      </div>
      <div
        v-else
        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
        :style="{ backgroundColor: colorFor(position) + '33', border: `1px solid ${colorFor(position)}55` }"
      >
        <span :style="{ color: colorFor(position) }">
          {{ item.isIncognito ? '?' : (item.name?.[0] ?? '?') }}
        </span>
      </div>
      <div class="min-w-0">
        <p class="text-sm text-white font-sans truncate">
          {{ item.isIncognito ? '— Anónimo —' : (item.name ?? '—') }}
        </p>
        <p class="text-[10px] text-neutral-600 font-sans font-extralight tracking-[0.06em] truncate">{{ item.category }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2 min-w-0">
      <div class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[9px] text-neutral-400">
        {{ item.isIncognito ? '?' : (item.founderName?.[0] ?? '?') }}
      </div>
      <span class="text-xs text-neutral-400 font-sans font-extralight truncate hidden md:block">
        {{ item.isIncognito ? '—' : (item.founderName ?? '—') }}
      </span>
    </div>

    <span
      class="text-sm font-mono tabular-nums text-right"
      :class="item.mrr !== null ? 'text-[#00D4FF]' : 'text-neutral-600'"
    >
      {{ formatMrr(item.mrr, item.currency) }}
    </span>

  </div>
</template>
