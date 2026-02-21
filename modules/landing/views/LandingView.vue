<script setup lang="ts">
import Hero from '../sections/Hero.vue';
import PainSection from '../sections/PainSection.vue';
import SolutionSection from '../sections/SolutionSection.vue';
import ProcessSection from '../sections/ProcessSection.vue';
import FaqSection from '../sections/FaqSection.vue';
import Footer from '../sections/Footer.vue';
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
            
            <!-- Pulling up the next section to eliminate dead space -->
            <div class="relative z-20">
                <PainSection />
            </div>
            <SolutionSection />
            <ProcessSection />
            <FaqSection />
            <Footer />
        </div>
    </main>
</template>
