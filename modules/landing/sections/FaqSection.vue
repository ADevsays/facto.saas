<script setup lang="ts">
import { ref } from 'vue';
import FaqItem from '../components/FaqItem.vue';

const faqs = [
    {
        question: "¿Cuánto tiempo toma desarrollar una landing page?",
        answer: "Nuestro proceso estándar toma entre 2 y 3 semanas. Esto nos permite asegurar que cada detalle técnico, desde la optimización del modelo 3D hasta el rendimiento SEO, sea impecable."
    },
    {
        question: "¿Por qué el diseño 3D es mejor para la conversión?",
        answer: "El 3D inmersivo captura la atención de inmediato y aumenta el tiempo de permanencia. Un usuario que interactúa con la página tiene un 40% más de probabilidades de recordar tu marca y completar una acción."
    },
    {
        question: "¿Qué tecnologías utilizan para el desarrollo?",
        answer: "Trabajamos con Nuxt 3 para la velocidad del lado del servidor, GSAP para animaciones fluidas y Three.js o WebGL refinada para la integración de elementos 3D de alta gama."
    },
    {
        question: "¿Tendré control sobre el contenido después del lanzamiento?",
        answer: "Absolutamente. Entregamos el proyecto con una estructura modular limpia. Si lo deseas, podemos integrar un CMS para que puedas actualizar textos e imágenes sin tocar una sola línea de código."
    }
];

const openIndex = ref<number | null>(null);

const toggle = (index: number) => {
    openIndex.value = openIndex.value === index ? null : index;
};
</script>

<template>
    <section class="py-24 px-6 bg-[#030305]">
        <div class="max-w-3xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-white font-serif text-[clamp(2rem,5vw,3.5rem)] tracking-tight mb-4 italic">
                    Preguntas frecuentes
                </h2>
                <div class="w-12 h-[1px] bg-[#00D4FF] mx-auto opacity-50"></div>
            </div>

            <div class="space-y-2 px-2">
                <FaqItem 
                    v-for="(faq, index) in faqs" 
                    :key="index"
                    :question="faq.question"
                    :answer="faq.answer"
                    :is-open="openIndex === index"
                    @toggle="toggle(index)"
                />
            </div>
        </div>
    </section>
</template>

<style scoped>
/* Transición suave para el acordeón */
.transition-all {
    transition-duration: 400ms;
}
</style>
