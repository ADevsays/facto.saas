<script setup lang="ts">
import StatusPill from '../components/StatusPill.vue';
import SolutionCard from '../components/SolutionCard.vue';
import IconShieldCheck from '../components/icons/IconShieldCheck.vue';
import IconRocket from '../components/icons/IconRocket.vue';
import IconLayers from '../components/icons/IconLayers.vue';
import { useLanguage } from '../composables/useLanguage';
import { computed } from 'vue';

const { t } = useLanguage();

const cards = computed(() => [
    {
        icon: IconShieldCheck,
        title: t.value.solution.cards[0].title,
        description: t.value.solution.cards[0].description
    },
    {
        icon: IconRocket,
        title: t.value.solution.cards[1].title,
        description: t.value.solution.cards[1].description
    },
    {
        icon: IconLayers,
        title: t.value.solution.cards[2].title,
        description: t.value.solution.cards[2].description
    }
]);
</script>

<template>
    <section id="solution" class="py-32 pb-40 px-6 bg-[#030305] overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <!-- Header Part -->
            <div class="mb-24 flex flex-col justify-center items-center ">
                <StatusPill 
                    :text="t.solution.pill" 
                    :pulse="false" 
                    class="mb-4 font-bold !text-[#00D4FF]" 
                />
                
                <h2 class="uppercase text-center text-white font-serif text-[clamp(2rem,8vw,4.8rem)] leading-[1.2] tracking-tight lg:w-full">
                    {{ t.solution.titleBase }} <br>
                    <span class="outline-text">{{ t.solution.titleAccent }}</span>
                </h2>
            </div>

            <!-- Cards Part -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SolutionCard 
                    v-for="card in cards" 
                    :key="card.title"
                    :title="card.title"
                    :description="card.description"
                    :icon="card.icon"
                />
            </div>
        </div>
    </section>
</template>

<style scoped>
/* Aplicar el celeste del botón a toda la pill */
:deep(.text-white\/70) {
    color: #00D4FF !important;
    opacity: 1 !important;
}
</style>
