<script setup lang="ts">
defineProps<{
    loading: boolean
    title?: string
}>()

defineEmits<{
    refresh: []
    logout: []
}>()
</script>

<template>
    <div class="flex items-center justify-between mb-12">
        <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-cyan-600 mb-1">Facto · Admin</p>
            <h1 class="font-serif text-4xl text-white">{{ title || 'Admin' }}</h1>
            <div class="flex items-center gap-4 mt-3">
                <NuxtLink to="/admin/leads" class="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-white transition-colors">
                    Beta Leads
                </NuxtLink>
                <span class="text-neutral-800">·</span>
                <NuxtLink to="/admin/pending" class="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-[#00D4FF] transition-colors">
                    Pendientes
                </NuxtLink>
                <span class="text-neutral-800">·</span>
                <NuxtLink to="/admin/reportes" class="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-white transition-colors">
                    Reportes
                </NuxtLink>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <button
                class="text-[11px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors disabled:opacity-30"
                :disabled="loading"
                @click="$emit('refresh')"
            >
                {{ loading ? 'Cargando…' : 'Actualizar' }}
            </button>
            <span class="text-gray-800">·</span>
            <button
                class="text-[11px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                @click="$emit('logout')"
            >
                Salir
            </button>
        </div>
    </div>
</template>
