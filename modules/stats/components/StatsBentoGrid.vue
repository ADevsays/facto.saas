<script setup lang="ts">
import type { StatsOverviewResponse } from '../types'
import StatsStartupsCard from './cards/StatsStartupsCard.vue'
import StatsMrrCard from './cards/StatsMrrCard.vue'
import StatsVelocityCard from './cards/StatsVelocityCard.vue'
import StatsDailyViewsCard from './cards/StatsDailyViewsCard.vue'
import StatsCumulativeViewsCard from './cards/StatsCumulativeViewsCard.vue'
import StatsCategoriesCard from './cards/StatsCategoriesCard.vue'
import StatsCountriesCard from './cards/StatsCountriesCard.vue'

defineProps<{
  timeline: StatsOverviewResponse['timeline']
  byCategory: StatsOverviewResponse['byCategory']
  byCountry: StatsOverviewResponse['byCountry']
  summary: StatsOverviewResponse['summary']
}>()
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
    <!-- 1. Startups Acumuladas (2 Cols) -->
    <StatsStartupsCard
      :daily="timeline.daily"
      :total-startups="summary.totalStartups"
    />

    <!-- 2. MRR Verificado (1 Col) -->
    <StatsMrrCard
      :daily="timeline.daily"
      :total-mrr="summary.totalMrr"
    />

    <!-- 3. Ritmo Diario de Incorporaciones (1 Col) -->
    <StatsVelocityCard
      :daily="timeline.daily"
    />

    <!-- 4. Visitas Diarias a Perfiles (2 Cols) -->
    <StatsDailyViewsCard
      :daily="timeline.daily"
    />

    <!-- 5. Evolución de Visitas Acumuladas (2 Cols) -->
    <StatsCumulativeViewsCard
      :daily="timeline.daily"
      :total-views="summary.totalViews"
    />

    <!-- 6. Top Categorías (1 Col) -->
    <StatsCategoriesCard
      :by-category="byCategory"
    />

    <!-- 7. Liderazgo por Países (3 Cols) -->
    <StatsCountriesCard
      :by-country="byCountry"
    />
  </section>
</template>
