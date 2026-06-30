<script setup lang="ts">
import { computed } from 'vue'
import { slugify } from '~/utils/slugify'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'
import SaasLogo from '~/ui/components/SaasLogo.vue'
import { getGemColor } from '~/ui/const/gems'

const props = defineProps<{
  name: string
  category: string
  categorySlug: string
  mrr: string
  revenue?: string
  logoUrl?: string | null
  isIncognito?: boolean
  index?: number
  labelLeft?: string
  labelRight?: string
}>()

const gemColor = computed(() => getGemColor(props.categorySlug))
const hasGlow = computed(() => props.index !== undefined && [0, 3, 4, 7, 9].includes(props.index % 10))
const cardStyle = computed(() => ({
  '--glow': gemColor.value
}))
</script>

<template>
  <NuxtLink 
    :to="`/saas/${slugify(props.name)}`" 
    class="saas-card group shrink-0 w-64 rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-sm py-[18px] px-3.5 flex flex-col gap-2 cursor-pointer transition-all duration-500"
    :class="{ 'has-glow': hasGlow }"
    :style="cardStyle"
  >

    <div class="flex items-center gap-2 min-w-0">
      <SaasLogo
        :src="!isIncognito ? logoUrl : null"
        :alt="name"
        :initial="isIncognito ? '?' : name[0].toUpperCase()"
        size="md"
        :gem-color="gemColor"
      />

      <div class="min-w-0">
        <p class="font-sans text-sm font-medium text-white leading-tight truncate">{{ isIncognito ? '— Anónimo —' : name }}</p>
        <p class="text-[10px] font-sans font-extralight tracking-[0.06em] text-neutral-400 uppercase mt-0.5 truncate">{{ category }}</p>
      </div>
    </div>

    <div class="mt-auto pt-2 border-t border-white/10">
      <div class="flex items-center justify-between gap-2">
        <div class="flex flex-col">
          <span class="text-[9px] font-sans font-extralight tracking-[0.1em] text-neutral-500 uppercase">{{ labelLeft || 'MRR' }}</span>
          <span class="text-xs font-mono text-white">
            <template v-if="mrr !== '—'">{{ mrr }}</template>
            <IncognitoIcon v-else class="w-4 h-4 text-neutral-600 inline" />
          </span>
        </div>
        <div v-if="revenue" class="flex flex-col items-end">
          <span class="text-[9px] font-sans font-extralight tracking-[0.1em] text-neutral-500 uppercase">{{ labelRight || 'ARR' }}</span>
          <span class="text-xs font-mono text-neutral-200">
            <template v-if="revenue !== '—'">{{ revenue }}</template>
            <IncognitoIcon v-else class="w-4 h-4 text-[#00D4FF]/60 inline" />
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.saas-card {
  position: relative;
  overflow: hidden;
}

.saas-card.has-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at -10% 50%, color-mix(in srgb, var(--glow) 10%, transparent) 0%, transparent 80%);
  z-index: 0;
  pointer-events: none;
}

.saas-card > * {
  position: relative;
  z-index: 1;
}

.saas-card:hover {
  box-shadow: 0 0 28px color-mix(in srgb, var(--glow) 15%, transparent), 0 0 60px color-mix(in srgb, var(--glow) 5%, transparent), 0 6px 24px rgba(0, 0, 0, 0.5);
  border-color: color-mix(in srgb, var(--glow) 50%, white);
}
</style>


