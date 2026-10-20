<script setup lang="ts">
import RankingRow from '../components/RankingRow.vue'
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

const props = withDefaults(
  defineProps<{
    limit?: number
    showViewAll?: boolean
    hideTitle?: boolean
    scope?: 'home' | 'ranking'
  }>(),
  {
    limit: undefined,
    showViewAll: false,
    hideTitle: false,
    scope: 'ranking'
  }
)

const { rankingItems, loading, error, loadMoreRanking, loadingMore, hasMoreRanking } = useSaasList({ scope: props.scope })
const loadMoreSentinel = ref<HTMLElement | null>(null)
let loadMoreObserver: IntersectionObserver | null = null
let hasScrolled = false

async function triggerLoadMore() {
  if (loadingMore.value || !hasMoreRanking.value) return
  const loaded = await loadMoreRanking()
  if (loaded && hasScrolled) {
    await nextTick()
    const sentinel = loadMoreSentinel.value
    if (sentinel && sentinel.getBoundingClientRect().top <= window.innerHeight + 650) {
      triggerLoadMore()
    }
  }
}

function requestMoreRanking() {
  if (hasScrolled) triggerLoadMore()
}

watch(loadMoreSentinel, (sentinel) => {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null
  if (!sentinel) return

  loadMoreObserver = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) requestMoreRanking()
  }, { rootMargin: '650px 0px' })
  loadMoreObserver.observe(sentinel)
}, { flush: 'post' })

function handleScroll() {
  if (window.scrollY <= 0) return
  hasScrolled = true
  const sentinel = loadMoreSentinel.value
  if (sentinel && sentinel.getBoundingClientRect().top <= window.innerHeight + 650) {
    triggerLoadMore()
  }
}

onMounted(() => {
  hasScrolled = window.scrollY > 0
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  loadMoreObserver?.disconnect()
  window.removeEventListener('scroll', handleScroll)
})

const filteredItems = computed(() => {
  if (props.limit && props.limit > 0) {
    return rankingItems.value.slice(0, props.limit)
  }
  return rankingItems.value
})

const continuationSkeletonCount = computed(() => {
  if (!hasMoreRanking.value && !loadingMore.value) return 0
  const maxRows = props.limit && props.limit > 0 ? props.limit : 100
  const remaining = Math.max(0, maxRows - filteredItems.value.length)
  return Math.min(10, remaining)
})
</script>

<template>
  <section class="w-full py-6 pb-12 [overflow-anchor:none]" data-ranking-section>
    <div v-if="!hideTitle" class="flex items-center justify-between mb-4">
      <p class="text-[10px] font-sans font-extralight tracking-[0.15em] text-neutral-300 uppercase">{{ t.section.title }}</p>
      <NuxtLink v-if="showViewAll" :to="localePath('/ranking')" :aria-label="t.section.title || 'Ver ranking completo'" class="group text-neutral-300 hover:text-white transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="transition-transform duration-300 group-hover:translate-x-0.5">
          <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </NuxtLink>
    </div>

    <div v-if="loading || (!error && filteredItems.length === 0)" class="rounded-2xl border border-white/10 overflow-hidden [overflow-anchor:none]">
      <div class="grid grid-cols-[1.2rem_1fr_1fr_80px] sm:grid-cols-[2rem_1fr_1fr_100px] items-center py-2.5 px-3 sm:px-5 border-b border-white/10 bg-white/[0.03] gap-2 sm:gap-3">
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest text-center">#</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight">{{ t.section.col_startup }}</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight w-[80px] text-center block">{{ t.section.col_founder }}</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight text-right">{{ t.section.col_revenue }}</span>
      </div>

      <div
        v-for="n in (limit || 10)"
        :key="'rank-sk-' + n"
        class="grid grid-cols-[1.2rem_1fr_1fr_80px] sm:grid-cols-[2rem_1fr_1fr_100px] items-center py-[18px] px-3 sm:px-5 border-b border-white/5 last:border-0 gap-2 sm:gap-3 animate-pulse [overflow-anchor:none]"
      >
        <span class="text-xs font-mono text-neutral-700 text-center">{{ n }}</span>
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-white/10 shrink-0"></div>
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

    <div v-else class="rounded-2xl border border-white/10 overflow-hidden [overflow-anchor:none]">
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
        logo-size="home"
      />
      <template v-if="continuationSkeletonCount > 0">
        <div
          v-for="n in continuationSkeletonCount"
          :key="'rank-more-sk-' + n"
          :ref="n === 1 ? (el) => { loadMoreSentinel = el as HTMLElement | null } : undefined"
          class="grid grid-cols-[1.2rem_1fr_1fr_80px] sm:grid-cols-[2rem_1fr_1fr_100px] items-center py-[18px] px-3 sm:px-5 border-b border-white/5 last:border-0 gap-2 sm:gap-3 animate-pulse [overflow-anchor:none]"
          aria-hidden="true"
        >
          <span class="text-xs font-mono text-neutral-700 text-center">{{ filteredItems.length + n }}</span>
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-white/10 shrink-0"></div>
            <div class="min-w-0 flex flex-col justify-center">
              <div class="h-5 flex items-center">
                <div class="h-3.5 bg-white/15 rounded w-24"></div>
              </div>
              <div class="h-[15px] flex items-center">
                <div class="h-2 bg-white/5 rounded w-16"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-[80px] flex items-center justify-center shrink-0">
              <div class="h-3 bg-white/10 rounded w-16"></div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1">
            <div class="h-3.5 bg-white/15 rounded w-14"></div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
