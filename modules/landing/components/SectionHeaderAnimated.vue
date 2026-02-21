<script setup lang="ts">
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import StatusPill from './StatusPill.vue';

const props = defineProps<{
    pillText: string;
    titleMain: string;
    titleAccent: string;
    accentColor: string;
    bounceInterval?: number;
}>();

const highlightRef = ref<HTMLElement | null>(null);

const runAttentionAnimation = () => {
    if (!highlightRef.value) return;

    const tl = gsap.timeline({
        onComplete: () => {
            setTimeout(runAttentionAnimation, props.bounceInterval || 10000);
        }
    });

    tl.to(highlightRef.value, {
        scale: 1.05,
        duration: 0.15,
        ease: 'power2.out'
    })
    .to(highlightRef.value, {
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1.2, 0.3)'
    });
};

onMounted(() => {
    setTimeout(runAttentionAnimation, 1000);
});
</script>

<template>
    <div class="mb-24 flex flex-col justify-center items-center gap-8">
        <StatusPill :text="pillText" :pulse-color="accentColor" class="mb-8" />
        
        <h2 class="uppercase text-white font-serif text-[clamp(2.5rem,8vw,7rem)] leading-[0.9] tracking-[-0.08em] lg:w-full text-center">
            {{ titleMain }} <br>
            <span 
                ref="highlightRef"
                class="inline-block"
                :style="{ color: accentColor }"
            >
                {{ titleAccent }}
            </span>
        </h2>
    </div>
</template>
