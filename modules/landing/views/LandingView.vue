<script setup lang="ts">
import Hero from '../sections/Hero.vue';
import Navbar from '../components/Navbar.vue';
import { useAppStatus } from '../composables/useAppStatus';

const { isReady } = useAppStatus();
</script>

<template>
    <main class="bg-[#030305] min-h-screen">
        <Navbar />
        
        <!-- Content wrapper that waits for Prisma -->
        <div 
            class="transition-opacity duration-1000"
            :class="isReady ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        >
            <Hero />
            <section class="h-[100dvh] flex items-center justify-center bg-gray-900 border-t border-gray-800">
                <h2 class="text-white font-serif text-4xl">Siguiente Sección</h2>
            </section>
        </div>
    </main>
</template>
