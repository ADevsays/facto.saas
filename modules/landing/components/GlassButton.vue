<script setup lang="ts">
import { useSmoothScroll } from '../composables/useSmoothScroll';
import { useBetaModal } from '../composables/useBetaModal';

const props = defineProps<{
    href?: string;
    text?: string;
}>();

const { scrollToSection } = useSmoothScroll();
const { open } = useBetaModal();

const handleClick = (e: Event) => {
    if (props.href === '#contact') {
        e.preventDefault();
        open();
        return;
    }
    if (props.href?.startsWith('#')) {
        scrollToSection(e, props.href);
    }
};
</script>

<template>
    <div class="my-6 pointer-events-auto">            
        <a 
            :href="href || '#'"
            @click="handleClick"
            class="group bg-white text-black relative inline-flex items-center justify-center px-6 py-3  md:px-10 md:py-4 font-bold uppercase tracking-widest text-xs md:text-sm rounded-full transition-all duration-700 hover:scale-[1.03]"
        >
            <span class="relative z-10 flex items-center gap-2">
                <slot>{{ text || 'Comenzar proyecto' }}</slot>
                <svg class="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </span>
        </a>
    </div>
</template>

<style scoped>
/* White Neon Glow Hover Effect */
.group:hover {
    box-shadow: 
        0 0 15px rgba(255, 255, 255, 0.5),
        0 0 30px rgba(0, 212, 255, 0.3),
        0 0 45px rgba(0, 212, 255, 0.1) !important;
}
</style>
