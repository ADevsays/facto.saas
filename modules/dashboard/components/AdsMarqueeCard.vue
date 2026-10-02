<script setup lang="ts">
import type { Ad } from '~/modules/ads/types'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

defineProps<{
  ad: Ad
}>()

defineEmits<{
  (e: 'reclaim', position: number): void
  (e: 'edit', ad: Ad): void
}>()
</script>

<template>
  <div
    class="p-6 rounded-3xl bg-surface-elevated border transition-all duration-300 relative flex flex-col justify-between hover:border-white/20"
    :class="ad.position === 1 ? 'border-[#FFD700]/30 shadow-[0_0_30px_rgba(255,215,0,0.06)]' : 'border-white/10'"
  >
    <!-- Card Header: Position & Status -->
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2">
        <span
          class="px-2.5 py-1 rounded-xl text-xs font-mono font-bold tracking-wider"
          :class="ad.position === 1 ? 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/40' : 'bg-white/5 text-white border border-white/10'"
        >
          {{ t.ads?.slot_position.replace('{pos}', String(ad.position || '—')) }}
        </span>
        <span class="text-xs font-mono text-neutral-400">
          ${{ ad.price || 1 }} USD
        </span>
      </div>

      <!-- Status Badge -->
      <span
        v-if="ad.is_active"
        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        {{ t.ads?.status_active }}
      </span>
      <span
        v-else
        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20"
      >
        {{ t.ads?.status_outbid }}
      </span>
    </div>

    <!-- Card Body: Ad info -->
    <div class="flex items-start gap-3.5 mb-5">
      <div class="w-12 h-12 rounded-2xl border border-white/10 bg-[#030305] overflow-hidden shrink-0 flex items-center justify-center">
        <img v-if="ad.image_url" :src="ad.image_url" :alt="ad.name" class="w-full h-full object-cover" />
        <span v-else class="font-serif text-base font-bold text-neutral-400">{{ ad.name?.charAt(0) || 'A' }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <h4 class="font-sans font-medium text-white text-sm md:text-base truncate">{{ ad.name }}</h4>
        <p v-if="ad.description" class="text-xs text-neutral-400 line-clamp-2 mt-1 font-extralight tracking-[0.04em] leading-relaxed">{{ ad.description }}</p>
        <a
          :href="ad.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-[11px] text-[#00D4FF] hover:underline truncate max-w-full mt-1.5"
        >
          <span class="truncate">{{ ad.url }}</span>
          <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    </div>

    <!-- Actions & Metadata -->
    <div class="pt-3.5 border-t border-white/5 flex items-center justify-between text-xs gap-3">
      <span class="text-[11px] text-neutral-500 font-mono">
        {{ t.ads?.registered_date.replace('{date}', new Date(ad.created_at).toLocaleDateString()) }}
      </span>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="$emit('edit', ad)"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white text-xs font-sans transition-all cursor-pointer"
        >
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          <span>Editar</span>
        </button>

        <!-- If outbid, action to rebuy/outbid back -->
        <button
          v-if="!ad.is_active && ad.position"
          @click="$emit('reclaim', ad.position)"
          class="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-sans transition-all duration-500 hover:scale-[1.02] cursor-pointer"
        >
          {{ t.ads?.recover_slot }}
        </button>
      </div>
    </div>
  </div>
</template>
