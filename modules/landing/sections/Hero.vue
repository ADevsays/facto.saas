<script setup lang="ts">
import Prisma3D from '../components/Prisma3D.vue';
import HeroText from '../components/HeroText.vue';

const heroRef = ref<HTMLElement | null>(null);
const heroTextComp = ref<any>(null);
</script>

<template>
    <section ref="heroRef" class="relative w-full h-[100dvh] overflow-hidden bg-[#030305] isolate">
        <Prisma3D
            v-if="heroRef"
            :scroll-trigger="heroRef"
            :text-element="heroTextComp?.container"
        />
        <HeroText ref="heroTextComp" />
    </section>
</template>
