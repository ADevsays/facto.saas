<script setup lang="ts">
import RankingRow from '../components/RankingRow.vue'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

const props = withDefaults(
  defineProps<{
    limit?: number
    showViewAll?: boolean
    hideTitle?: boolean
  }>(),
  {
    limit: undefined,
    showViewAll: false,
    hideTitle: false
  }
)

const { rankingItems, loading, error, fetchAll } = useSaasList()

onMounted(fetchAll)

const filteredItems = computed(() => {
  if (props.limit && props.limit > 0) {
    return rankingItems.value.slice(0, props.limit)
  }
  return rankingItems.value
})
</script>

<template>
  <section class="w-full py-6 pb-12">
    <div v-if="!hideTitle" class="flex items-center justify-between mb-4">
      <p class="text-[10px] font-sans font-extralight tracking-[0.15em] text-neutral-300 uppercase">{{ t.section.title }}</p>
      <NuxtLink v-if="showViewAll" :to="localePath('/ranking')" class="group text-neutral-300 hover:text-white transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="transition-transform duration-300 group-hover:translate-x-0.5">
          <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </NuxtLink>
    </div>

    <div v-if="loading" class="rounded-2xl border border-white/10 overflow-hidden">
      <div class="grid grid-cols-[1.2rem_1fr_1fr_80px] sm:grid-cols-[2rem_1fr_1fr_100px] items-center py-2.5 px-3 sm:px-5 border-b border-white/10 bg-white/[0.03] gap-2 sm:gap-3">
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest text-center">#</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight">{{ t.section.col_startup }}</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight w-[80px] text-center block">{{ t.section.col_founder }}</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight text-right">{{ t.section.col_revenue }}</span>
      </div>

      <div
        v-for="n in (limit || 10)"
        :key="'rank-sk-' + n"
        class="grid grid-cols-[1.2rem_1fr_1fr_80px] sm:grid-cols-[2rem_1fr_1fr_100px] items-center py-[18px] px-3 sm:px-5 border-b border-white/5 last:border-0 gap-2 sm:gap-3 animate-pulse"
      >
        <span class="text-xs font-mono text-neutral-700 text-center">{{ n }}</span>
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-white/10 shrink-0"></div>
          <div class="flex flex-col gap-1.5 flex-1 min-w-0">
            <div class="h-3.5 bg-white/15 rounded w-24"></div>
            <div class="h-2 bg-white/5 rounded w-16"></div>
          </div>
        </div>
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-5 h-5 rounded-full bg-white/5 shrink-0"></div>
          <div class="h-3 bg-white/10 rounded w-20"></div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="h-3.5 bg-white/15 rounded w-14"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-16 text-red-500/70 text-sm font-sans font-extralight">
      {{ error }}
    </div>

    <div v-else-if="filteredItems.length === 0" class="text-center py-16 text-neutral-600 text-sm font-sans font-extralight">
      {{ t.section.no_results }}
    </div>

    <div v-else class="rounded-2xl border border-white/10 overflow-hidden">
      <div class="grid grid-cols-[1.2rem_1fr_1fr_80px] sm:grid-cols-[2rem_1fr_1fr_100px] items-center py-2.5 px-3 sm:px-5 border-b border-white/10 bg-white/[0.03] gap-2 sm:gap-3">
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest text-center">#</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight">{{ t.section.col_startup }}</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight w-[80px] text-center block">{{ t.section.col_founder }}</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight text-right">{{ t.section.col_revenue }}</span>
      </div>

      <RankingRow
        v-for="(item, index) in filteredItems"
        :key="item.id"
        :position="index + 1"
        :item="item"
      />
    </div>
  </section>
</template>
