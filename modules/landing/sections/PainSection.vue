<script setup lang="ts">
import SectionHeaderAnimated from '../components/SectionHeaderAnimated.vue';
import FeatureCard from '../components/FeatureCard.vue';

const accentColor = '#ffe200';

const cards = [
    {
        icon: "🔥",
        title: "Psicología de Conversión",
        description: "No solo creamos interfaces bonitas. Diseñamos flujos cognitivos que guían al usuario hacia la acción de forma instintiva."
    },
    {
        icon: "⚡",
        title: "Velocidad Extrema",
        description: "Optimizamos cada línea de código y cada imagen para asegurar una carga instantánea. El 53% de los usuarios abandonan si tarda +3s."
    },
    {
        icon: "🎯",
        title: "Enfoque en Resultados",
        description: "Implementamos analítica avanzada y seguimiento de eventos para que sepas exactamente qué está pasando en tu landing."
    }
];
</script>

<template>
    <section class="py-16 px-6 bg-[#030305] overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <!-- Header Componentized -->
            <SectionHeaderAnimated 
                pill-text="SOUND FAMILIAR?"
                title-main="Tu landing no vende"
                title-accent="porque no impacta."
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
                    "El diseño es el embajador silencioso de tu marca."
                </p>
            </div>
        </div>
    </section>
</template>
