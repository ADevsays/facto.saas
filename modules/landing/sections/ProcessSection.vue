<script setup lang="ts">
import StatusPill from '../components/StatusPill.vue';
import GlassButton from '../components/GlassButton.vue';
import ProcessStepCard from '../components/ProcessStepCard.vue';

const steps = [
    {
        number: "01",
        title: "Inscribe tu startup",
        duration: "1 min",
        description: "Agrega tu startup totalmente gratis en un click. Vuélvete un founder reconocido o mantente anónimo."
    },
    {
        number: "02",
        title: "Pon tu API key de sólo lectura",
        duration: "1 min",
        description: "Para que los datos sean reales, los traeremos directamente de tu pasarela de pago con seguridad."
    },
    {
        number: "03",
        title: "Presume tu nuevo backlink",
        duration: "5 min",
        description: "Eso es todo. Comparte en tus redes sociales que un sitio profesional te está enlazando junto a tus resultados reales."
    }
];
</script>

<template>
    <section id="process" class="relative py-32 px-6 bg-[#08080A] overflow-hidden">
        <!-- Subtle Grid/Mesh Background -->
        <div class="absolute inset-0 z-0 opacity-[0.02]" 
             style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 60px 60px;">
        </div>

        <!-- Decoration Line - Master Horizontal (Tenue) -->
        <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

        <div class="max-w-7xl mx-auto relative z-10">
            <!-- Header Part -->
            <div class="mb-24">
                <StatusPill 
                    text="NUESTRO PROCESO" 
                    :pulse="false" 
                    class="mb-8 !text-gray-300" 
                />
                
                <h2 class="text-white font-serif text-[clamp(2.5rem,8vw,4rem)] leading-[1.1] tracking-[-0.08em]  lg:w-1/2">
                    De ser ignorado a tener <br>
                    <span class="text-gray-400">tráfico orgánico</span>
                </h2>
            </div>

            <!-- Process Cards - Clean Border Logic (Divide) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <ProcessStepCard 
                    v-for="step in steps" 
                    :key="step.number"
                    v-bind="step"
                />
            </div>

            <!-- Final CTA Part -->
            <div class="mt-16 flex flex-col items-center justify-center text-center">
                <!-- Vertical Line (Extra Tenue) -->
                <div class="w-[2px] h-20 bg-gradient-to-b from-white/5 to-transparent mb-12"></div>
                <h3 class="text-white font-serif text-3xl mb-10 max-w-lg leading-tight">
                    ¿Listo para explotar tu tráfico?
                </h3>
                <GlassButton href="#contact">
                    Sé uno de los primeros
                </GlassButton>
            </div>
        </div>
    </section>
</template>

<style scoped>
/* Unificar colores de la sección en gris claro */
:deep(.text-white\/70) {
    color: #9CA3AF !important;
    opacity: 1 !important;
}
</style>
