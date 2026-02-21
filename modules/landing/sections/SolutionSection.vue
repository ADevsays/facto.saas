<script setup lang="ts">
import StatusPill from '../components/StatusPill.vue';
import SolutionCard from '../components/SolutionCard.vue';
import IconShieldCheck from '../components/icons/IconShieldCheck.vue';
import IconRocket from '../components/icons/IconRocket.vue';
import IconLayers from '../components/icons/IconLayers.vue';

const cards = [
    {
        icon: IconShieldCheck,
        title: "Credibilidad Real",
        description: "Tu MRR será público y verificable. Tendrás un certificado de tus resultados."
    },
    {
        icon: IconRocket,
        title: "SEO potenciado",
        description: "Serás enlazado por una página relevante. ¡SEO mejorado gratis!"
    },
    {
        icon: IconLayers,
        title: "Análisis profundo",
        description: "Tienes una biblioteca de tu competencia al alcance de tu mano, ¡y sus resultados!"
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
