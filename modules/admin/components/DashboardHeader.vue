<script setup lang="ts">
defineProps<{
    loading: boolean
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
            <h1 class="font-serif text-4xl text-white">Beta Leads</h1>
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
