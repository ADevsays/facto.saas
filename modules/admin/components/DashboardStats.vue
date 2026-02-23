<script setup lang="ts">
import LeadsTrendChart from './LeadsTrendChart.client.vue'
import LeadsDistributionChart from './LeadsDistributionChart.client.vue'

interface DashboardStats {
    total: number
    byDay: Record<string, number>
    byGateway: Record<string, number>
    byMotivation: Record<string, number>
}

defineProps<{
    stats: DashboardStats
}>()

const MOTIVATION_LABELS: Record<string, string> = {
    reach: 'Aumentar alcance',
    authority: 'Autoridad',
    seo: 'SEO',
    investment: 'Inversión',
}
</script>

<template>
    <div v-if="stats">
        <div class="mb-10">
            <p class="font-serif text-7xl text-white leading-none">{{ stats.total }}</p>
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-600 mt-2">leads totales</p>
        </div>

        <div class="w-full h-px bg-white/5 mb-10" />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <LeadsTrendChart :by-day="stats.byDay" />
            <LeadsDistributionChart
                title="Pasarela de pago"
                :data="stats.byGateway"
            />
            <LeadsDistributionChart
                title="Motivación principal"
                :data="stats.byMotivation"
                :labels="MOTIVATION_LABELS"
            />
        </div>
    </div>
</template>
