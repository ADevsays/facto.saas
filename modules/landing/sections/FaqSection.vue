<script setup lang="ts">
import { ref } from 'vue';
import FaqItem from '../components/FaqItem.vue';

const faqs = [
    {
        question: "¿Tengo que poner la API key de mi pasarela de pago?",
        answer: "Sí, para poder verificar los ingresos reales de tu startup se tomaran los datos desde tu pasarela de pago. Esto es totalmente seguro porque será un API de sólo lectura, lo que significa que no se puede hacer nada más que ver esos datos."
    },
    {
        question: "¿Por qué esto aumentará mi tráfico orgánico?",
        answer: "Cuando un sitio web es enlazado externamente por una página relevante, Google lo considera como un indicador de calidad y relevancia. Esto puede aumentar el tráfico orgánico de tu sitio web."
    },
    {
        question: "¿Qué métricas serán públicas en mi perfil?",
        answer: "Puedes decidir si adjuntar tus redes sociales o mantenerte privado. De tu startup se enseñará su ingreso mensual recurrente (MRR) y el tráfico que reciba mensualmente."
    },
    {
        question: "¿Qué gano al inscribir mi startup aquí?",
        answer: "Vas a obtener credibilidad, impresiones totalmente gratuitas desde los usuarios de Facto.saas y relevancia mediática."
    }
];

const openIndex = ref<number | null>(null);

const toggle = (index: number) => {
    if (openIndex.value !== null && openIndex.value !== index) {
        // Primero cerramos el que está abierto
        openIndex.value = null;
        // Esperamos a que la animación de cierre esté avanzada para abrir el siguiente
        setTimeout(() => {
            openIndex.value = index;
        }, 350);
    } else {
        openIndex.value = openIndex.value === index ? null : index;
    }
};
</script>

<template>
    <section id="faq" class="py-24 px-6 bg-[#030305]">
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
