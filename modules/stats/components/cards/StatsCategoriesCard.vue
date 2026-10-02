<script setup lang="ts">
import type { StatCategoryPoint } from '../../types'
import es from '../../locales/es.json'
import en from '../../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

defineProps<{
  byCategory: StatCategoryPoint[]
}>()
</script>

<template>
  <div class="p-6 sm:p-7 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col gap-4">
    <div class="flex items-center justify-between border-b border-white/5 pb-3">
      <div class="flex items-center gap-2">
        <svg class="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1"/>
          <rect width="7" height="7" x="14" y="3" rx="1"/>
          <rect width="7" height="7" x="14" y="14" rx="1"/>
          <rect width="7" height="7" x="3" y="14" rx="1"/>
        </svg>
        <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase">
          {{ t?.bento?.categories_title }}
        </span>
      </div>
      <span class="text-xs text-neutral-500 font-sans font-extralight">{{ byCategory.length }} verticals</span>
    </div>

    <div class="flex flex-col gap-2.5">
      <div
        v-for="cat in byCategory.slice(0, 6)"
        :key="cat.slug"
        class="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
      >
        <NuxtLink :to="localePath(`/saas/categoria/${cat.slug}`)" class="text-xs text-neutral-300 hover:text-[#00D4FF] font-sans truncate transition-colors">
          {{ cat.name }}
        </NuxtLink>
        <div class="flex items-center gap-3 shrink-0">
          <span class="text-xs font-sans text-neutral-400 font-medium tabular-nums lining-nums">{{ cat.count.toLocaleString('en-US') }}</span>
          <span v-if="cat.totalMrr > 0" class="text-xs font-sans text-emerald-400 font-bold tabular-nums lining-nums">
            ${{ cat.totalMrr.toLocaleString('en-US') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
