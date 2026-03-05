<script setup lang="ts">
import { useSaasCalculator } from '../composables/useSaasCalculator';
import CalcInput from './CalcInput.vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';

const { inputs } = useSaasCalculator();
const { t } = useLanguage({ es, en });
</script>

<template>
    <div class="flex flex-col gap-5 p-8 bg-[#0A0A0C] border border-white/5 rounded-3xl">

        <div class="flex flex-col gap-2.5">
            <p class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/45 m-0">{{ t?.calculator.inputs.revenueType }}</p>
            <div class="flex gap-2 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
                <button
                    class="flex-1 py-2.5 rounded-lg font-sans text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
                    :class="inputs.revenueType === 'mrr' ? 'bg-white/[0.08] text-white' : 'bg-transparent text-white/35'"
                    @click="inputs.revenueType = 'mrr'"
                >{{ t?.calculator.inputs.monthly }}</button>
                <button
                    class="flex-1 py-2.5 rounded-lg font-sans text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
                    :class="inputs.revenueType === 'arr' ? 'bg-white/[0.08] text-white' : 'bg-transparent text-white/35'"
                    @click="inputs.revenueType = 'arr'"
                >{{ t?.calculator.inputs.annual }}</button>
            </div>
        </div>

        <CalcInput
            v-model="inputs.revenue"
            :label="inputs.revenueType === 'mrr' ? t?.calculator.inputs.revenue.mrrLabel : t?.calculator.inputs.revenue.arrLabel"
            prefix="$"
            :min="0"
            :step="500"
            :hint="inputs.revenueType === 'mrr' ? t?.calculator.inputs.revenue.mrrHint : t?.calculator.inputs.revenue.arrHint"
        />

        <CalcInput
            v-model="inputs.growthRate"
            :label="t?.calculator.inputs.growth.label"
            suffix="%"
            :min="0"
            :max="200"
            :step="1"
            :hint="t?.calculator.inputs.growth.hint"
        />

        <CalcInput
            v-model="inputs.churnRate"
            :label="t?.calculator.inputs.churn.label"
            suffix="%"
            :min="0"
            :max="100"
            :step="0.5"
            :hint="t?.calculator.inputs.churn.hint"
        />

        <CalcInput
            v-model="inputs.marginPercent"
            :label="t?.calculator.inputs.margin.label"
            suffix="%"
            :min="0"
            :max="100"
            :step="1"
            :hint="t?.calculator.inputs.margin.hint"
        />

    </div>
</template>
