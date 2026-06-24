<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useAppStatus } from '../composables/useAppStatus';
import GlassButton from './GlassButton.vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';

const container = ref<HTMLElement | null>(null);
const { isReady } = useAppStatus();
const { t } = useLanguage({ es, en });
const localePath = useLocalePath();

onMounted(async () => {
    const root = container.value;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>('.reveal-item');
    if (targets.length === 0) return;

    const { gsap } = await import('gsap');

    gsap.set(targets, { opacity: 0, y: 40 });

    const runAnimation = async () => {
        await nextTick();
        gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out',
            delay: 0.1
        });
    };

    if (isReady.value) {
        runAnimation();
    } else {
        const stop = watch(isReady, (ready) => {
            if (ready) {
                stop();
                runAnimation();
            }
        });
    }
});

defineExpose({ container });
</script>

<template>
    <div ref="container" class="absolute inset-0 z-10 bg-transparent flex justify-center items-center flex-col pointer-events-none text-center mix-blend-difference">
        <h1 
            class="mt-20 reveal-item text-white font-serif text-[12vw] md:text-[7rem] leading-[0.85] tracking-tight whitespace-pre-line"
        >
            {{ t.hero.title }}
        </h1>

        <p 
            class="reveal-item font-sans text-gray-300 text-base md:text-xl my-7 md:my-14 leading-tight max-w-xl tracking-[0.08em] font-extralight whitespace-pre-line"
        >
            {{ t.hero.subtitle }}
        </p>

    <div class="reveal-item pointer-events-auto mb-14">
        <GlassButton href="/">
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
