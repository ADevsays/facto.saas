<script setup lang="ts">
import { ref, computed } from 'vue';
import FaqItem from '../components/FaqItem.vue';
import { useLanguage } from '../composables/useLanguage';

const { t } = useLanguage();
const faqs = computed(() => t.value.faq.questions);

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
                    {{ t.faq.title }}
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
