<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useAppStatus } from '../composables/useAppStatus';
import { useStaggeredEntrance } from '../composables/useEntranceAnimation';
import GlassButton from './GlassButton.vue';
import { useLanguage } from '../composables/useLanguage';

const container = ref<HTMLElement | null>(null);
const { isReady } = useAppStatus();
const { t } = useLanguage();

// Setup the animation logic - Automatically maps elements with .reveal-item
const { animate } = useStaggeredEntrance(container, '.reveal-item', 0.8);

watch(isReady, async (ready) => {
    if (ready) {
        await nextTick();
        animate();
    }
}, { immediate: true });

defineExpose({
    container
});
</script>

<template>
    <div ref="container" class="absolute inset-0 z-10 bg-transparent flex justify-center items-center flex-col pointer-events-none text-center mix-blend-difference">
        <!-- Elements marked with .reveal-item move up and fade in automatically -->
        <h1 
            class="reveal-item text-white font-serif text-[12vw] md:text-[7rem] leading-[0.85] tracking-tight mb-8 opacity-0 whitespace-pre-line"
        >
            {{ t.hero.title }}
        </h1>

        <p 
            class="lg:mb-6 reveal-item font-sans text-gray-300 text-lg leading-tight mt-4 max-w-xl opacity-0 tracking-[0.08em] font-extralight whitespace-pre-line"
        >
            {{ t.hero.subtitle }}
        </p>

        <div class="reveal-item opacity-0 pointer-events-auto">
            <GlassButton href="#contact">
                {{ t.hero.cta }}
            </GlassButton>
        </div>
    </div>
</template>

<style scoped>
h1, p {
    pointer-events: none;
}
</style>
