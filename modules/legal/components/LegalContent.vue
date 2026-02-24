<script setup lang="ts">
interface Section {
    title: string;
    content: string;
}

defineProps<{
    title: string;
    subtitle: string;
    sections: Section[];
}>();
</script>

<template>
    <div class="min-h-screen bg-[#030305] text-white pt-32 pb-20 px-6">
        <div class="max-w-3xl mx-auto">
            <h1 class="font-serif text-5xl md:text-7xl mb-6 tracking-tight">{{ title }}</h1>
            <p class="text-gray-400 text-lg md:text-xl font-light mb-20 tracking-wide">{{ subtitle }}</p>

            <div class="space-y-16">
                <section v-for="section in sections" :key="section.title" class="reveal-on-scroll">
                    <h2 class="text-xs uppercase tracking-[0.3em] text-gray-500 mb-6 font-bold">{{ section.title }}</h2>
                    <p class="text-gray-300 leading-relaxed font-light text-lg">
                        {{ section.content }}
                    </p>
                </section>
            </div>

            <div class="mt-32 pt-12 border-t border-white/5">
                <NuxtLink 
                    to="/" 
                    class="text-xs uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors inline-flex items-center gap-2 group"
                >
                    <svg class="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Volver al inicio
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.font-serif {
    font-family: 'Playfair Display', serif;
}
.font-sans {
    font-family: 'Inter', sans-serif;
}
</style>
