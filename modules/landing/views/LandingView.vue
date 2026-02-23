<script setup lang="ts">
import Hero from '../sections/Hero.vue';
import PainSection from '../sections/PainSection.vue';
import SolutionSection from '../sections/SolutionSection.vue';
import ProcessSection from '../sections/ProcessSection.vue';
import FaqSection from '../sections/FaqSection.vue';
import Footer from '../sections/Footer.vue';
import Navbar from '../components/Navbar.vue';
import BetaAccessModal from '../sections/BetaAccessModal.vue';
import { useLanguage } from '../composables/useLanguage';
import { useAppStatus } from '../composables/useAppStatus';

const { isReady } = useAppStatus();
const { detectLanguage } = useLanguage();

onMounted(() => {
    detectLanguage();
});
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
    <BetaAccessModal />
</template>

<style>
.outline-text {
    background: linear-gradient(
        120deg, 
        rgba(255, 255, 255, 0) 30%, 
        rgba(255, 255, 255, 0.8) 50%, 
        rgba(255, 255, 255, 0) 70%
    );
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: rgba(0, 212, 255, 0.3);
    filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.4));
    animation: shine 12s ease-in-out infinite;
    display: inline-block;
}

@keyframes shine {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
}

html {
  scroll-behavior: smooth;
}

/* Offset para que las secciones no queden tapadas por el navbar fijo */
#solution, #process, #faq, #contact {
  scroll-margin-top: 120px;
}
</style>
