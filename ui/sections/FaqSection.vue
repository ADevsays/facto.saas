<script setup lang="ts">
import { ref } from 'vue';
import FaqItem from '../components/FaqItem.vue';

defineProps<{
    title: string;
    faqs: Array<{ question: string; answer: string }>;
}>();

const openIndex = ref<number | null>(null);
</script>

<template>
    <section id="faq" class="py-24 px-6 bg-[#030305]">
        <div class="max-w-3xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-white font-serif text-[clamp(2rem,5vw,3.5rem)] tracking-tight mb-4 italic">
                    {{ title }}
                </h2>
                <div class="w-12 h-[1px] bg-[#00D4FF] mx-auto opacity-50"></div>
            </div>

            <div class="space-y-2 px-2">
                <FaqItem 
                    v-for="(faq, index) in faqs" 
                    :key="index"
                    :question="faq.question"
                    :answer="faq.answer"
                    :isOpen="openIndex === Number(index)"
                    @toggle="openIndex = openIndex === Number(index) ? null : Number(index)"
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
