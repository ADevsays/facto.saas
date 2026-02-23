<script setup lang="ts">
import { useBetaForm } from '../composables/useBetaForm';

const { form, next } = useBetaForm();
</script>

<template>
    <div>
        <p class="text-gray-600 text-xs uppercase tracking-widest mb-4">Último paso</p>
        <h2 class="font-serif text-4xl md:text-5xl text-white mb-10 leading-tight">
            Tu email
        </h2>
        <input
            v-model="form.email"
            type="email"
            placeholder="ejemplo@tuempresa.com"
            class="w-full bg-transparent border-b py-4 text-white text-xl outline-none placeholder-white/15 transition-colors focus:border-cyan-500"
            style="border-color: rgba(255,255,255,0.12);"
            @keydown.enter="next"
        />
        <p class="text-gray-700 text-xs mt-5">
            Solo aceptaremos <span class="text-gray-500">50 startups</span> para la fase de lanzamiento.
        </p>
    </div>
</template>

<style scoped>
input { caret-color: #00D4FF; }
</style>
