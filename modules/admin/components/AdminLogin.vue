<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
    error?: string
}>()

const emit = defineEmits<{
    login: [key: string]
}>()

const keyInput = ref('')

const handleLogin = () => {
    if (!keyInput.value.trim()) return
    emit('login', keyInput.value)
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center px-6">
        <div
            class="w-full max-w-lg rounded-3xl px-12 py-14"
            style="background: rgba(10,10,14,0.99); border: 1px solid rgba(255,255,255,0.08);"
        >
            <p class="text-[10px] uppercase tracking-[0.2em] text-cyan-600 mb-2">Facto</p>
            <h1 class="font-serif text-4xl text-white mb-12 leading-tight">
                Panel de<br>acceso
            </h1>

            <input
                v-model="keyInput"
                type="password"
                placeholder="Admin key"
                class="w-full bg-transparent border-b py-3 text-white text-base outline-none placeholder-white/15 transition-colors focus:border-cyan-500"
                style="border-color: rgba(255,255,255,0.12); caret-color: #00D4FF;"
                @keydown.enter="handleLogin"
                autofocus
            />

            <p v-if="error" class="text-[11px] text-red-400/80 mt-3 tracking-wide">
                {{ error }}
            </p>

            <button
                class="login-btn mt-10 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest"
                @click="handleLogin"
            >
                Entrar
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.login-btn {
    color: #000;
    background: #ffffff;
    border: 1px solid rgba(255,255,255,0.6);
    transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}
.login-btn:hover {
    background: rgba(255,255,255,0.9);
    box-shadow:
        0 0 15px rgba(255,255,255,0.35),
        0 0 30px rgba(0,212,255,0.2),
        0 0 45px rgba(0,212,255,0.08);
    transform: translateY(-1px);
}
</style>
