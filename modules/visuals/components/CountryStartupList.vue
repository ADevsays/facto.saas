<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { HelpCircle } from 'lucide-vue-next'
import type { CountryStartupItem, CountryStartupPage } from '~/modules/ranking/types'
import SaasLogo from '~/ui/components/SaasLogo.vue'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'

const props = defineProps<{ country: string }>()
const localePath = useLocalePath()

const items = ref<CountryStartupItem[]>([])
const loading = ref(false)
const loaded = ref(false)
const hasMore = ref(true)
const rootRef = ref<HTMLElement | null>(null)
const moreRef = ref<HTMLElement | null>(null)
let initialObserver: IntersectionObserver | null = null
let moreObserver: IntersectionObserver | null = null

function formatRevenue(value: number | null) {
  if (value === null) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

function observeMore() {
  moreObserver?.disconnect()
  if (moreRef.value && hasMore.value) moreObserver?.observe(moreRef.value)
}

async function loadNext() {
  if (loading.value || (loaded.value && !hasMore.value)) return
  loading.value = true
  try {
    const page = await $fetch<CountryStartupPage>('/api/ranking/list', {
      query: {
        scope: 'country',
        country: props.country,
        limit: 12,
        offset: items.value.length
      }
    })
    items.value.push(...page.items)
    hasMore.value = page.hasMore
  } finally {
    loaded.value = true
    loading.value = false
    nextTick(observeMore)
  }
}

onMounted(() => {
  initialObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    initialObserver?.disconnect()
    loadNext()
  }, { rootMargin: '200px 0px' })
  if (rootRef.value) initialObserver.observe(rootRef.value)

  moreObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) loadNext()
  }, { rootMargin: '200px 0px' })
})

onUnmounted(() => {
  initialObserver?.disconnect()
  moreObserver?.disconnect()
})
</script>

<template>
  <div ref="rootRef" class="mt-6">
    <div v-if="loading && items.length === 0" class="flex flex-col gap-2.5">
      <div v-for="n in 3" :key="n" class="h-[68px] rounded-2xl bg-white/[0.03] animate-pulse" />
    </div>

    <div v-else-if="items.length" class="flex flex-col gap-2.5">
      <NuxtLink
        v-for="startup in items"
        :key="startup.slug"
        :to="localePath(`/saas/${startup.slug}`)"
        class="flex items-center justify-between gap-4 p-3 md:p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all duration-300 group/startup cursor-pointer"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <SaasLogo
            :src="startup.logoUrl"
            :alt="startup.name"
            :initial="startup.name.slice(0, 1).toUpperCase()"
            size="md"
            rounded="xl"
            :website-url="startup.websiteUrl"
            class="shrink-0 group-hover/startup:scale-105 transition-transform duration-300"
          />
          <div class="font-sans text-sm md:text-base font-medium text-neutral-200 group-hover/startup:text-[#00D4FF] transition-colors truncate">
            {{ startup.name }}
          </div>
        </div>

        <div class="text-right min-w-[75px] shrink-0">
          <span class="font-mono text-xs md:text-sm font-medium text-white inline-flex items-center justify-end">
            <template v-if="!startup.hasProvider">
              <IncognitoIcon class="w-5 h-5 text-neutral-400" />
            </template>
            <template v-else-if="formatRevenue(startup.revenue)">{{ formatRevenue(startup.revenue) }}</template>
            <HelpCircle v-else class="w-5 h-5 text-neutral-400" title="Revenue no confirmado" aria-label="Revenue no confirmado" />
          </span>
          <span class="text-[10px] block text-neutral-500 font-sans tracking-wider uppercase mt-0.5">Revenue</span>
        </div>
      </NuxtLink>
      <div v-if="hasMore" ref="moreRef" class="h-px" />
      <div v-if="loading" class="h-[68px] rounded-2xl bg-white/[0.03] animate-pulse" />
    </div>
  </div>
</template>
