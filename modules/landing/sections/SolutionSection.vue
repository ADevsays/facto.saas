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
    <section id="solution" class="py-32 pb-40 px-6 bg-[#030305] overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <!-- Header Part -->
            <div class="mb-24 flex flex-col justify-center items-center ">
                <StatusPill 
                    text="LA SOLUCIÓN FACTO" 
                    :pulse="false" 
                    class="mb-2 font-bold !text-[#00D4FF]" 
                />
                
                <h2 class="uppercase text-center text-white font-serif text-[clamp(2.5rem,8vw,4.8rem)] leading-[1.2] tracking-tight lg:w-full">
                    Conviértete en una <br>
                    <span class="outline-text">startup verificada</span>
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
