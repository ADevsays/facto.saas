<script setup lang="ts">
import SectionHeaderAnimated from '../components/SectionHeaderAnimated.vue';
import FeatureCard from '../components/FeatureCard.vue';
import { useLanguage } from '../composables/useLanguage';
import { computed } from 'vue';

const accentColor = 'red';
const { t } = useLanguage();

const cards = computed(() => t.value.pain.cards.map((card, index) => ({
    icon: index === 0 ? "🛑" : index === 1 ? "🥀" : "📌",
    title: card.title,
    description: card.description
})));
</script>

<template>
    <section class="py-16 px-6 bg-[#030305] overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <!-- Header Componentized -->
            <SectionHeaderAnimated 
                :pill-text="t.pain.pill"
                :title-main="t.pain.titleMain"
                :title-accent="t.pain.titleAccent"
                :accent-color="accentColor"
                :bounce-interval="10000"
            />

            <!-- Cards Part -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <FeatureCard 
                    v-for="card in cards" 
                    :key="card.title"
                    :title="card.title"
                    :description="card.description"
                    :icon="card.icon"
                    :color="accentColor"
                />
            </div>

            <!-- Bottom Text -->
            <div class="text-center">
                <p class="text-white/40 italic text-2xl font-serif">
                    {{ t.pain.solutionText }}
                </p>
            </div>
        </div>
    </section>
</template>
