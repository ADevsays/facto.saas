<script setup lang="ts">
const emit = defineEmits<{ close: [] }>();
</script>

<template>
    <div class="py-16 text-center">
        <div
            class="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center"
            style="background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25);"
        >
            <svg class="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </div>
        <h3 class="font-serif text-3xl text-white mb-3">Solicitud enviada</h3>
        <p class="text-gray-500 text-sm max-w-xs mx-auto">
            Te contactaremos pronto con los detalles de tu acceso.
        </p>
        <button
            @click="emit('close')"
            class="mt-8 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all"
            style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.35);"
        >
            Cerrar
        </button>
    </div>
</template>
