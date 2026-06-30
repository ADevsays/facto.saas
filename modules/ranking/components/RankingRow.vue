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

function formatMrr(mrr: number | null, currency: string): string {
  if (mrr === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(mrr)
}

function handleClick(isIncognito: boolean, name: string | null) {
  if (isIncognito || !name) return
  navigateTo(`/saas/${slugify(name)}`)
}
</script>

<template>
  <div
    @click="handleClick(item.isIncognito, item.name)"
    class="ranking-row grid grid-cols-[1.2rem_1fr_1fr_80px] sm:grid-cols-[2rem_1fr_1fr_100px] items-center py-[18px] px-3 sm:px-5 border-b border-white/5 last:border-0 transition-all duration-300 group gap-2 sm:gap-3"
    :class="item.isIncognito ? 'cursor-default' : 'cursor-pointer'"
    :style="{ '--glow': rowColor }"
  >

    <span class="text-xs font-mono text-neutral-600 text-center">{{ position }}</span>

    <div class="flex items-center gap-2.5 min-w-0">
      <SaasLogo
        :src="!item.isIncognito ? item.logoUrl : null"
        :alt="item.name ?? ''"
        :initial="item.isIncognito ? '?' : (item.name?.[0] ?? '?')"
        size="sm"
        :gem-color="rowColor"
      />
      <div class="min-w-0">
        <p class="text-sm text-white font-sans truncate">
          {{ item.isIncognito ? '— Anónimo —' : (item.name ?? '—') }}
        </p>
        <p class="text-[10px] text-neutral-600 font-sans font-extralight tracking-[0.06em] truncate">{{ item.category }}</p>
      </div>
    </div>

    <!-- Founder -->
    <div class="flex items-center gap-2.5 min-w-0">
      <template v-if="item.isIncognito || !item.founderName">
        <div class="w-[80px] flex items-center justify-center shrink-0">
          <IncognitoIcon class="w-5 h-5 text-neutral-600" />
        </div>
      </template>
      <template v-else>
        <div class="w-[80px] flex items-center justify-center shrink-0 hidden md:flex">
          <span class="text-xs text-neutral-500 font-sans font-extralight truncate text-center w-full">
            {{ item.founderName }}
          </span>
        </div>
      </template>
    </div>

    <!-- MRR -->
    <div
      class="text-sm font-mono tabular-nums text-right flex items-center justify-end w-full"
      :class="item.mrr !== null ? 'text-[#00D4FF]' : 'text-neutral-600'"
    >
      <template v-if="item.mrr !== null">{{ formatMrr(item.mrr, item.currency) }}</template>
      <IncognitoIcon v-else class="w-4 h-4" />
    </div>

  </div>
</template>

<style scoped>
.ranking-row:hover {
  background-color: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 60px color-mix(in srgb, var(--glow) 20%, transparent);
}
</style>
