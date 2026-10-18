<script setup lang="ts">
import { computed } from 'vue'
import { slugify } from '~/utils/slugify'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'
import { navigateTo } from '#app'
import type { SaasListItem } from '~/modules/ranking/types'
import SaasLogo from '~/ui/components/SaasLogo.vue'
import { getGemColor } from '~/ui/const/gems'

const props = defineProps<{
  position: number
  item: SaasListItem
}>()

const rowColor = computed(() => getGemColor(props.item.categorySlug))

function formatMrr(mrr: number | null, currency: string): string | null {
  if (mrr === null) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(mrr)
}

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath(`/saas/${item.slug || slugify(item.name || '')}`)"
    class="ranking-row grid grid-cols-[1.2rem_1fr_1fr_80px] sm:grid-cols-[2rem_1fr_1fr_100px] items-center py-[18px] px-3 sm:px-5 border-b border-white/5 last:border-0 transition-all duration-300 group gap-2 sm:gap-3 cursor-pointer"
    :style="{ '--glow': rowColor }"
  >
    <span class="text-xs font-mono text-neutral-600 text-center">{{ position }}</span>

    <div class="flex items-center gap-2.5 min-w-0">
      <SaasLogo
        :src="item.logoUrl"
        :alt="item.name ?? ''"
        :initial="item.name?.[0] ?? '?'"
        size="sm"
        :gem-color="rowColor"
        :websiteUrl="item.websiteUrl"
      />
      <div class="min-w-0">
        <p class="text-sm text-white font-sans truncate">
          {{ item.name ?? '—' }}
        </p>
        <p class="text-[10px] text-neutral-600 font-sans font-extralight tracking-[0.06em] truncate">{{ item.category }}</p>
      </div>
    </div>

    <!-- Founder -->
    <div class="flex items-center gap-2.5 min-w-0">
      <template v-if="!item.founderName">
        <div class="w-[80px] flex items-center justify-center shrink-0">
          <IncognitoIcon class="w-5 h-5 text-neutral-600" />
        </div>
      </template>
      <template v-else>
        <div class="w-[80px] hidden md:flex items-center justify-center shrink-0">
          <span class="text-xs text-neutral-500 font-sans font-extralight truncate text-center w-full">
            {{ item.founderName }}
          </span>
        </div>
      </template>
    </div>

    <!-- REVENUE -->
    <div
      class="text-sm font-mono tabular-nums text-right flex items-center justify-end w-full"
      :class="item.revenue !== null && item.revenue !== undefined ? 'text-[#00D4FF]' : 'text-neutral-600'"
    >
      <template v-if="item.revenue !== null && item.revenue !== undefined">{{ item.revenue }}</template>
      <IncognitoIcon v-else class="w-4 h-4" />
    </div>
  </NuxtLink>
</template>

<style scoped>
.ranking-row:hover {
  background-color: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 60px color-mix(in srgb, var(--glow) 20%, transparent);
}
</style>
