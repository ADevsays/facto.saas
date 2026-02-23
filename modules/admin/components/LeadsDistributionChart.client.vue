<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
    title: string
    data: Record<string, number>
    labels?: Record<string, string>
}>()

const COLORS = ['rgba(0,212,255,0.7)', 'rgba(124,58,237,0.7)', 'rgba(245,158,11,0.7)', 'rgba(16,185,129,0.7)', 'rgba(244,63,94,0.7)']

const chartData = computed(() => {
    const keys = Object.keys(props.data)
    return {
        labels: keys.map(k => props.labels?.[k] ?? k),
        datasets: [{
            data: keys.map(k => props.data[k]),
            backgroundColor: COLORS.slice(0, keys.length),
            borderWidth: 0,
            hoverOffset: 6,
        }],
    }
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right' as const,
            labels: {
                color: 'rgba(255,255,255,0.4)',
                padding: 14,
                font: { family: 'Inter', size: 11 },
                boxWidth: 8,
                boxHeight: 8,
                borderRadius: 4,
            },
        },
    },
    cutout: '72%',
}
</script>

<template>
    <div
        class="rounded-2xl p-6"
        style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);"
    >
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 mb-5">{{ title }}</p>
        <div style="height: 180px;">
            <Doughnut :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>
