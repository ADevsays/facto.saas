<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useAppStatus } from '../composables/useAppStatus';
import { useStaggeredEntrance } from '../composables/useEntranceAnimation';
import GlassButton from './GlassButton.vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';

const container = ref<HTMLElement | null>(null);
const { isReady } = useAppStatus();
const { t } = useLanguage({ es, en });

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
            class="mt-20 reveal-item text-white font-serif text-[12vw] md:text-[7rem] leading-[0.85] tracking-tight opacity-0 whitespace-pre-line"
        >
            {{ t.hero.title }}
        </h1>

        <p 
            class="reveal-item font-sans text-gray-300 text-base md:text-xl my-7 md:my-14 leading-tight  max-w-xl opacity-0 tracking-[0.08em] font-extralight whitespace-pre-line"
        >
            {{ t.hero.subtitle }}
        </p>

        <div class="reveal-item opacity-0 pointer-events-auto mb-14">
            <GlassButton href="#contact">
                {{ t.hero.cta }}
            </GlassButton>
            <p v-if="t.hero.share" class="mt-4 text-[10px] md:text-xs uppercase tracking-[0.2em] text-white opacity-50">
                ({{ t.hero.share }})
            </p>
        </div>

    </div>
</template>

<style scoped>
h1, p {
    pointer-events: none;
}
</style>
