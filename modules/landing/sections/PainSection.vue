<script setup lang="ts">
import StatusPill from '../components/StatusPill.vue';
import FeatureCard from '../components/FeatureCard.vue';

// Simple Icons as components
const BrainIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z' }),
    h('path', { d: 'M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z' })
]);

const ZapIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z' })
]);

const TargetIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('circle', { cx: '12', cy: '12', r: '6' }),
    h('circle', { cx: '12', cy: '12', r: '2' })
]);

const cards = [
    {
        icon: BrainIcon,
        title: "Psicología de Conversión",
        description: "No solo creamos interfaces bonitas. Diseñamos flujos cognitivos que guían al usuario hacia la acción de forma instintiva."
    },
    {
        icon: ZapIcon,
        title: "Velocidad Extrema",
        description: "Optimizamos cada línea de código y cada imagen para asegurar una carga instantánea. El 53% de los usuarios abandonan si tarda +3s."
    },
    {
        icon: TargetIcon,
        title: "Enfoque en Resultados",
        description: "Implementamos analítica avanzada y seguimiento de eventos para que sepas exactamente qué está pasando en tu landing."
    }
];
</script>

<template>
    <section class="py-8 px-6 bg-[#030305] overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <!-- Header Part -->
            <div class="mb-20">
                <StatusPill text="SOUND FAMILIAR?" pulse-color="#FF4D00" class="mb-8" />
                
                <h2 class="text-white font-serif text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.1] tracking-tight lg:w-1/2">
                    Tu landing no vende <br>
                    <span class="text-[#FF4D00]">porque no impacta.</span>
                </h2>
            </div>

            <!-- Cards Part -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                <FeatureCard 
                    v-for="card in cards" 
                    :key="card.title"
                    :title="card.title"
                    :description="card.description"
                    :icon="card.icon"
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
