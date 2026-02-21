<script setup lang="ts">
import StatusPill from '../components/StatusPill.vue';
import SolutionCard from '../components/SolutionCard.vue';
import IconCode from '../components/icons/IconCode.vue';
import IconRocket from '../components/icons/IconRocket.vue';
import IconLayers from '../components/icons/IconLayers.vue';

const cards = [
    {
        icon: IconCode,
        title: "Arquitectura Escalable",
        description: "Construimos con las tecnologías más modernas para que tu web crezca sin límites ni deudas técnicas."
    },
    {
        icon: IconRocket,
        title: "SEO de Alto Rendimiento",
        description: "No solo es rápida, también es visible. Optimizamos cada etiqueta para que Google adore tu nuevo sitio."
    },
    {
        icon: IconLayers,
        title: "Diseño Modular",
        description: "Componentes limpios y reutilizables que permiten iteraciones rápidas y un mantenimiento supersencillo."
    }
];
</script>

<template>
    <section class="py-32 px-6 bg-[#030305] overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <!-- Header Part -->
            <div class="mb-24 flex flex-col justify-center items-center ">
                <StatusPill 
                    text="LA SOLUCIÓN FACTOS" 
                    :pulse="false" 
                    class="mb-2 font-bold !text-[#00D4FF]" 
                />
                
                <h2 class="uppercase text-center text-white font-serif text-[clamp(2.5rem,4vw,2.75rem)] leading-[1.2] tracking-tight lg:w-1/2">
                    Tu visión en una <br>
                    <span class="outline-text">máquina</span>
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
.outline-text {
    background: linear-gradient(
        120deg, 
        rgba(255, 255, 255, 0) 30%, 
        rgba(255, 255, 255, 0.8) 50%, 
        rgba(255, 255, 255, 0) 70%
    );
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: rgba(0, 212, 255, 0.3);
    filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.4));
    animation: shine 12s ease-in-out infinite;
    display: inline-block;
}

@keyframes shine {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
}

/* Aplicar el celeste del botón a toda la pill */
:deep(.text-white\/70) {
    color: #00D4FF !important;
    opacity: 1 !important;
}
</style>
