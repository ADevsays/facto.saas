<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const props = defineProps<{ byDay: Record<string, number> }>()

const chartData = computed(() => ({
    labels: Object.keys(props.byDay),
    datasets: [{
        label: 'Leads',
        data: Object.values(props.byDay),
        borderColor: 'rgba(0,212,255,0.7)',
        backgroundColor: 'rgba(0,212,255,0.04)',
        borderWidth: 1.5,
        pointRadius: 2.5,
        pointBackgroundColor: 'rgba(0,212,255,0.9)',
        tension: 0.4,
        fill: true,
    }],
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.25)', maxTicksLimit: 7, font: { family: 'Inter', size: 10 } },
        },
        y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.25)', stepSize: 1, font: { family: 'Inter', size: 10 } },
            beginAtZero: true,
        },
    },
}
</script>

<template>
    <div
        class="rounded-2xl p-6"
        style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);"
    >
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 mb-5">Tendencia · 30 días</p>
        <div style="height: 180px;">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>
