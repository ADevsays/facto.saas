<script setup lang="ts">
import { ref } from 'vue';
import GlassButton from './GlassButton.vue';

const container = ref<HTMLElement | null>(null);

defineExpose({
    container
});
</script>

<template>
    <div ref="container" class="absolute inset-0 z-10 bg-transparent flex justify-center items-center flex-col pointer-events-none text-center  mix-blend-difference">
        <!-- Text with mix-blend-difference -->
        <div class="flex flex-col items-center">
            <h1 class="text-white font-serif text-[12vw] md:text-[7rem] leading-[0.85] tracking-tight mb-8">
                Landing Pages <br>That Convert.
            </h1>

            <GlassButton href="#contact">
                Comenzar proyecto
            </GlassButton>

            <p class="font-sans text-gray-300 text-lg md:text-xl mt-4 max-w-xl opacity-70 uppercase tracking-[0.2em] font-light">
                Diseño 3D impulsado por datos
            </p>
        </div>
    </div>
</template>

<style scoped>
h1, p {
    pointer-events: none;
}
</style>
