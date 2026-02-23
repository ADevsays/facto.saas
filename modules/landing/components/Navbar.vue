<script setup lang="ts">
import { useHeaderTransform } from '../composables/useHeaderTransform';
import { useSmoothScroll } from '../composables/useSmoothScroll';
import { useBetaModal } from '../composables/useBetaModal';
import { NAV_LINKS } from '../const/navigation';

const pillRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const linksRef = ref<HTMLElement | null>(null);
const ctaRef = ref<HTMLElement | null>(null);
const { initHeaderAnimation } = useHeaderTransform();
const { scrollToSection } = useSmoothScroll();
const { open: openBetaModal } = useBetaModal();

onMounted(() => {
    if (headerRef.value && pillRef.value) {
        initHeaderAnimation(
            pillRef.value, 
            linksRef.value || undefined,
            ctaRef.value || undefined
        );
    }
});

const navLinks = NAV_LINKS;
</script>

<template>
    <header ref="headerRef" class="fixed top-0 left-0 w-full z-50 flex justify-center p-4">
        <!-- The Pill Container -->
        <nav 
            ref="pillRef"
            class="w-[92vw] md:w-[88vw] max-w-[1400px] h-16 grid grid-cols-2 md:grid-cols-3 items-center px-8 bg-transparent rounded-full border border-transparent overflow-hidden"
        >
            <!-- Logo Section (Left) -->
            <div class="flex justify-start items-center">
                <span class="font-serif text-white text-xl font-bold tracking-tighter">FACTO<span class="text-cyan-600">®</span> </span>
            </div>

            <!-- Desktop Links (Center) -->
            <div class="hidden md:flex justify-center items-center">
                <ul ref="linksRef" class="flex items-center gap-16 md:opacity-0">
                    <li v-for="link in navLinks" :key="link.name">
                        <a 
                            :href="link.href" 
                            @click="scrollToSection($event, link.href)"
                            class="font-medium text-gray-400 hover:text-white text-sm  tracking-wide transition-colors uppercase whitespace-nowrap"
                        >
                            {{ link.name }}
                        </a>
                    </li>
                </ul>
            </div>

            <!-- CTA Section (Right) -->
            <div class="flex justify-end items-center">
                <button 
                    ref="ctaRef"
                    @click="openBetaModal"
                    class="glass-fluid-btn px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center shrink-0 transition-colors"
                >
                    Empezar
                </button>
            </div>
        </nav>
    </header>
</template>

<style scoped>
/* Ensure the backdrop blur doesn't clip badly */
nav {
    will-change: width, background-color, backdrop-filter, border-color, max-width;
}

.glass-fluid-btn {
    color: #fff;
    background: linear-gradient(
        120deg, 
        rgba(255, 255, 255, 0) 30%, 
        rgba(255, 255, 255, 0.15) 50%, 
        rgba(255, 255, 255, 0) 70%
    );
    background-size: 200% auto;
    border: 1px solid transparent;
    animation: shine 12s ease-in-out infinite;
    transition: color 0.4s ease, border-color 0.4s ease;
}

.glass-fluid-btn:hover {
    border-color: rgba(0, 212, 255, 0.5);
    background-color: rgba(0, 212, 255, 0.1);
    transform: translateY(-1px);
}

@keyframes shine {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
}
</style>
