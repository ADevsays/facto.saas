<script setup lang="ts">
import type { Lead } from '../types/lead'

const MOTIVATION_LABELS: Record<string, string> = {
    reach: 'Aumentar alcance',
    authority: 'Autoridad',
    seo: 'SEO',
    investment: 'Inversión',
}

defineProps<{ lead: Lead }>()
</script>

<template>
    <tr
        class="transition-colors group"
        style="border-bottom: 1px solid rgba(255,255,255,0.03);"
        @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background = ''"
    >
        <td class="px-6 py-4 text-sm text-white/70 font-medium">{{ lead.email }}</td>
        <td class="px-6 py-4">
            <a
                :href="lead.startup_url"
                target="_blank"
                class="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
            >
                {{ lead.startup_url.replace(/^https?:\/\//, '') }}
            </a>
        </td>
        <td class="px-6 py-4 text-sm text-gray-500">{{ lead.gateway }}</td>
        <td class="px-6 py-4 text-sm text-gray-500">{{ MOTIVATION_LABELS[lead.motivation] ?? lead.motivation }}</td>
        <td class="px-6 py-4 text-sm text-gray-600">{{ new Date(lead.submitted_at).toLocaleDateString('es-ES') }}</td>
    </tr>
</template>
