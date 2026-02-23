<script setup lang="ts">
import type { Lead } from '../types/lead'
import LeadsTableRow from './LeadsTableRow.vue'

defineProps<{
    leads: Lead[]
    total: number
    page: number
    limit: number
}>()

defineEmits<{ next: []; prev: [] }>()

const COLUMNS = ['Email', 'Startup', 'Gateway', 'Motivación', 'Fecha']
</script>

<template>
    <div
        class="rounded-2xl overflow-hidden"
        style="border: 1px solid rgba(255,255,255,0.07);"
    >
        <div
            class="flex items-center justify-between px-6 py-4"
            style="border-bottom: 1px solid rgba(255,255,255,0.05);"
        >
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">Leads registrados</p>
            <span class="text-[10px] uppercase tracking-widest text-gray-600">{{ total }} en total</span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <th
                            v-for="col in COLUMNS"
                            :key="col"
                            class="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-600"
                        >
                            {{ col }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <LeadsTableRow v-for="lead in leads" :key="lead.id" :lead="lead" />
                </tbody>
            </table>
        </div>

        <div
            class="flex items-center justify-between px-6 py-4"
            style="border-top: 1px solid rgba(255,255,255,0.05);"
        >
            <button
                class="text-[11px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                :disabled="page <= 1"
                @click="$emit('prev')"
            >
                ← Anterior
            </button>
            <span class="text-[10px] text-gray-700">{{ page }} / {{ Math.ceil(total / limit) }}</span>
            <button
                class="text-[11px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                :disabled="page * limit >= total"
                @click="$emit('next')"
            >
                Siguiente →
            </button>
        </div>
    </div>
</template>
