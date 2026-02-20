<script setup lang="ts">
import { useHeaderTransform } from '../composables/useHeaderTransform';

const pillRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const linksRef = ref<HTMLElement | null>(null);
const { initHeaderAnimation } = useHeaderTransform();

onMounted(() => {
    if (headerRef.value && pillRef.value) {
        initHeaderAnimation(headerRef.value, pillRef.value, linksRef.value || undefined);
    }
});

const navLinks = [
    { name: 'Expertise', href: '#expertise' },
    { name: 'Process', href: '#process' },
    { name: 'Results', href: '#results' },
];
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
                <span class="font-serif text-white text-xl font-bold tracking-tighter">FACTOS<span class="text-cyan-400">®</span></span>
            </div>

            <!-- Desktop Links (Center) -->
            <div class="hidden md:flex justify-center items-center">
                <ul ref="linksRef" class="flex items-center gap-16 md:opacity-0">
                    <li v-for="link in navLinks" :key="link.name">
                        <a :href="link.href" class="text-gray-400 hover:text-white text-sm font-medium tracking-wide transition-colors uppercase whitespace-nowrap">
                            {{ link.name }}
                        </a>
                    </li>
                </ul>
            </div>

            <!-- CTA Section (Right) -->
            <div class="flex justify-end items-center">
                <a 
                    href="https://cal.com/motionviz/15min?overlayCalendar=true"
                    target="_blank"
                    class="bg-white text-black px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors flex items-center space-x-2 shrink-0"
                >
                    <span class="hidden xs:inline">Book a Call</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </a>
            </div>
        </nav>
    </header>
</template>

<style scoped>
/* Ensure the backdrop blur doesn't clip badly */
nav {
    will-change: width, background-color, backdrop-filter, border-color, max-width;
}
</style>
