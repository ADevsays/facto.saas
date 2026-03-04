<script setup lang="ts">
import { useSaasCalculator } from '../composables/useSaasCalculator';
import CalcInput from './CalcInput.vue';

const { inputs } = useSaasCalculator();
</script>

<template>
    <div class="flex flex-col gap-5 p-8 bg-[#0A0A0C] border border-white/5 rounded-3xl">

        <div class="flex flex-col gap-2.5">
            <p class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/45 m-0">¿Cómo mides tus ingresos?</p>
            <div class="flex gap-2 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
                <button
                    class="flex-1 py-2.5 rounded-lg font-sans text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
                    :class="inputs.revenueType === 'mrr' ? 'bg-white/[0.08] text-white' : 'bg-transparent text-white/35'"
                    @click="inputs.revenueType = 'mrr'"
                >Por mes</button>
                <button
                    class="flex-1 py-2.5 rounded-lg font-sans text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
                    :class="inputs.revenueType === 'arr' ? 'bg-white/[0.08] text-white' : 'bg-transparent text-white/35'"
                    @click="inputs.revenueType = 'arr'"
                >Por año</button>
            </div>
        </div>

        <CalcInput
            v-model="inputs.revenue"
            :label="inputs.revenueType === 'mrr' ? 'Ingresos recurrentes al mes' : 'Ingresos recurrentes al año'"
            prefix="$"
            :min="0"
            :step="500"
            :hint="inputs.revenueType === 'mrr' ? 'Solo suscripciones y contratos — sin cobros únicos' : 'Total de contratos y suscripciones del año'"
        />

        <CalcInput
            v-model="inputs.growthRate"
            label="¿Cuánto creces cada mes?"
            suffix="%"
            :min="0"
            :max="200"
            :step="1"
            hint="Promedio de los últimos 3 meses. Si no has crecido, pon 0"
        />

        <CalcInput
            v-model="inputs.churnRate"
            label="¿Cuántos clientes pierdes al mes?"
            suffix="%"
            :min="0"
            :max="100"
            :step="0.5"
            hint="De cada 100 clientes, ¿cuántos se van? Ej: si pierdes 5 → pon 5"
        />

        <CalcInput
            v-model="inputs.marginPercent"
            label="¿Qué porcentaje de lo que cobras te queda?"
            suffix="%"
            :min="0"
            :max="100"
            :step="1"
            hint="Después de pagar servidores, APIs y soporte. No cuentes tu sueldo"
        />

    </div>
</template>
