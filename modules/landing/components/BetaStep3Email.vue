<script setup lang="ts">
import { useBetaForm } from '../composables/useBetaForm';
import { useLanguage } from '../composables/useLanguage';
import BetaStepHeader from './BetaStepHeader.vue';
import BetaTextInput from './BetaTextInput.vue';

const { form, next } = useBetaForm();
const { t } = useLanguage();
</script>

<template>
    <div>
        <BetaStepHeader :pill="t.beta.step3.pill" :title="t.beta.step3.title" />
        <BetaTextInput
            v-model="form.email"
            type="email"
            :placeholder="t.beta.step3.placeholder"
            @enter="next"
        />
        <p class="text-gray-700 text-xs mt-5">
            {{ t.beta.step3.disclaimer.start }}
            <span class="text-gray-500">{{ t.beta.step3.disclaimer.highlight }}</span>
            {{ t.beta.step3.disclaimer.end }}
        </p>
    </div>
</template>
