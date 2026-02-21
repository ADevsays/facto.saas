<script setup lang="ts">
import { useSmoothScroll } from '../composables/useSmoothScroll';
import IconArrowRight from './icons/IconArrowRight.vue';

defineProps<{
    href: string;
}>();

const { scrollToSection } = useSmoothScroll();
</script>

<template>
    <div class="mb-32 text-center md:text-left">
        <a 
            :href="href" 
            @click="scrollToSection($event, href)"
            class="group inline-block relative"
        >
            <h2 class="text-white font-serif text-[15vw] md:text-[12rem] leading-[0.85] tracking-tighter hover:text-[#00D4FF] transition-colors duration-700 uppercase">
                Let's <br>
                <span class="flex items-center gap-4 md:gap-12">
                    Talk
                    <span class="inline-flex items-center justify-center w-[12vw] h-[12vw] md:w-32 md:h-32 rounded-full border border-[#00D4FF] group-hover:bg-[#00D4FF] transition-all duration-700">
                        <IconArrowRight class="w-[6vw] h-[6vw] md:w-16 md:h-16 text-[#00D4FF] group-hover:text-black transition-colors" />
                    </span>
                </span>
            </h2>
        </a>
    </div>
</template>

<style scoped>
h2 {
    font-feature-settings: "ss01", "ss02";
}
</style>
