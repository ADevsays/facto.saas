<script setup lang="ts">
import { computed } from 'vue'
import { useAdsSlots } from '~/modules/ads/composables/useAdsSlots'

definePageMeta({ layout: 'default' })

const { safeSlots, pending } = useAdsSlots()
const activeSlots = computed(() => safeSlots.value.filter(slot => slot.ad))
</script>

<template>
  <main class="min-h-screen bg-[#030305] text-white px-6 pt-28 pb-20">
    <section class="mx-auto max-w-3xl rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] p-6">
      <p class="text-xs uppercase tracking-[0.2em] text-cyan-300">Preview fixture</p>
      <h1 class="mt-2 text-2xl font-semibold">ISR ad synchronization</h1>
      <p class="mt-2 text-sm text-white/60">This Preview route reads only <code>cache_e2e_test</code>. The global marquee above uses the same isolated fixture.</p>
      <p v-if="pending" class="mt-6 text-sm text-white/50">Loading isolated ad…</p>
      <div v-else class="mt-6 space-y-3">
        <article v-for="slot in activeSlots" :key="slot.position" class="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p class="text-xs text-white/40">Slot {{ slot.position }} · ${{ slot.currentPrice }}</p>
          <p class="mt-1 font-medium">{{ slot.ad?.name }}</p>
          <p class="text-sm text-white/60">{{ slot.ad?.description }}</p>
        </article>
        <p v-if="activeSlots.length === 0" class="text-sm text-white/50">No isolated ad has been seeded yet.</p>
      </div>
    </section>
  </main>
</template>
