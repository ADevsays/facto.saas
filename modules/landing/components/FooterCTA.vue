<script setup lang="ts">
import { useBetaModal } from '../composables/useBetaModal';
import IconArrowRight from './icons/IconArrowRight.vue';

defineProps<{
    href: string;
}>();

const { open } = useBetaModal();
</script>

<template>
    <div class="mb-32 text-center md:text-left">
        <button 
            @click="open"
            class="group inline-block relative transition-all duration-700 p-8 -m-8 hover:drop-shadow-[0_0_80px_rgba(180,240,255,0.25)] text-left"
        >
            <h2 class="text-white font-serif text-[15vw] md:text-[12rem] leading-[0.85] tracking-tighter transition-all duration-700 uppercase">
                Entra a  <br>
                <span class="flex items-center gap-4 md:gap-12">
                    <span class="outline-text">Facto</span>
                    <span class="inline-flex items-center mt-2 lg:mt-8 justify-center w-[12vw] h-[12vw] md:w-32 md:h-32 rounded-full border border-[#00D4FF] transition-all duration-700 group-hover:scale-[1.02]">
                        <IconArrowRight class="w-[6vw] h-[6vw] md:w-16 md:h-16 text-[#00D4FF] transition-colors" />
                    </span>
                </span>
            </h2>
        </button>
    </div>
</template>

<style scoped>
h2 {
    font-feature-settings: "ss01", "ss02";
}
</style>
