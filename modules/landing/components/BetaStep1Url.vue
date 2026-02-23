<script setup lang="ts">
import { useBetaForm } from '../composables/useBetaForm';

const { form, next } = useBetaForm();
</script>

<template>
    <div>
        <p class="text-gray-600 text-xs uppercase tracking-widest mb-4">Tu startup</p>
        <h2 class="font-serif text-4xl md:text-5xl text-white mb-10 leading-tight">
            ¿Cuál es la URL<br>de tu startup?
        </h2>
        <input
            v-model="form.startupUrl"
            type="url"
            placeholder="https://tu-startup.com"
            class="w-full bg-transparent border-b py-4 text-white text-xl outline-none placeholder-white/15 transition-colors focus:border-cyan-500"
            style="border-color: rgba(255,255,255,0.12);"
            @keydown.enter="next"
            autofocus
        />
    </div>
</template>

<style scoped>
input { caret-color: #00D4FF; }
</style>
