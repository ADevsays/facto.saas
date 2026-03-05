<script setup lang="ts">
import { useBetaForm } from '../composables/useBetaForm';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';
import BetaStepHeader from './BetaStepHeader.vue';
import BetaTextInput from './BetaTextInput.vue';

const { form, next } = useBetaForm();
const { t } = useLanguage({ es, en });
</script>

<template>
    <div>
        <BetaStepHeader :pill="t.beta.step1.pill" :title="t.beta.step1.title" />
        <BetaTextInput
            v-model="form.startupUrl"
            type="url"
            :placeholder="t.beta.step1.placeholder"
            autofocus
            @enter="next"
        />
    </div>
</template>
