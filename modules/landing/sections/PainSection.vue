<script setup lang="ts">
import SectionHeaderAnimated from '../components/SectionHeaderAnimated.vue';
import FeatureCard from '../components/FeatureCard.vue';

const accentColor = 'red';

const cards = [
    {
        icon: "🛑",
        title: "Desconfianza total",
        description: "Presumes tu MRR con capturas de pantalla y nadie te cree."
    },
    {
        icon: "🥀",
        title: "Irrelevancia Extrema",
        description: "No apareces en ninguna plataforma referente en español."
    },
    {
        icon: "📌",
        title: "Sin alternativas",
        description: "Allá afuera solo manejan Stripe y no tu pasarela para enseñar tu MRR."
    }
];
</script>

<template>
    <section class="py-16 px-6 bg-[#030305] overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <!-- Header Componentized -->
            <SectionHeaderAnimated 
                pill-text="¿TE SUENA?"
                title-main="Tu saas está"
                title-accent="siendo ignorado"
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
                    Pero hay una solución...
                </p>
            </div>
        </div>
    </section>
</template>
