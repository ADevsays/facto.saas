<script setup lang="ts">
import RankingRow from '../components/RankingRow.vue'

const { rankingItems, loading, error, fetchAll } = useSaasList()
const { query, setQuery, filterItems } = useStartupSearch()

onMounted(fetchAll)

const filteredItems = computed(() => filterItems(rankingItems.value))
</script>

<template>
  <section class="w-full py-8 pb-20">
    <div class="flex items-center justify-between mb-5">
      <p class="text-[10px] font-sans font-extralight tracking-[0.15em] text-neutral-600 uppercase">Ranking</p>
    </div>

    <div v-if="loading" class="text-center py-16 text-neutral-600 text-sm font-sans font-extralight">
      Cargando ranking...
    </div>

    <div v-else-if="error" class="text-center py-16 text-red-500/70 text-sm font-sans font-extralight">
      {{ error }}
    </div>

    <div v-else-if="filteredItems.length === 0" class="text-center py-16 text-neutral-600 text-sm font-sans font-extralight">
      No se encontraron resultados
    </div>

    <div v-else class="rounded-2xl border border-white/10 overflow-hidden">
      <div class="grid grid-cols-[1rem_1fr_1fr_auto] sm:grid-cols-[2rem_1fr_1fr_auto] items-center py-2.5 px-3 sm:px-5 border-b border-white/10 bg-white/[0.03] gap-2 sm:gap-3">
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest text-center">#</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight">Startup</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight">Founder</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight text-right">MRR</span>
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
