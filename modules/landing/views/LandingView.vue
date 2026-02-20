<script setup lang="ts">
import Hero from '../sections/Hero.vue';
import Navbar from '../components/Navbar.vue';
</script>

<template>
    <main class="bg-[#030305]">
        <Navbar />
        <Hero />
        <section class="h-[100dvh] flex items-center justify-center bg-gray-900 border-t border-gray-800">
            <h2 class="text-white font-serif text-4xl">Siguiente Sección</h2>
        </section>
    </main>
</template>
