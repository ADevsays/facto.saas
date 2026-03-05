<script setup lang="ts">
import { computed } from 'vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';

const { t } = useLanguage({ es, en });

const props = defineProps<{
    modelValue: { startupUrl: string; email: string; gateway: string; gatewayOther: string };
    isLoading: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: { startupUrl: string; email: string; gateway: string; gatewayOther: string }];
    submit: [];
}>();

const gateways = [
    { id: 'Stripe', label: () => t.value.calculator.ranking.form.gateways.stripe },
    { id: 'Mercado Pago', label: () => t.value.calculator.ranking.form.gateways.mercadoPago },
    { id: 'Paddle', label: () => t.value.calculator.ranking.form.gateways.paddle },
    { id: 'Otra', label: () => t.value.calculator.ranking.form.gateways.other }
];

const isGatewaySelected = computed(() => {
    if (!props.modelValue.gateway) return false;
    if (props.modelValue.gateway === 'Otra') return props.modelValue.gatewayOther.trim().length > 0;
    return true;
});

const updateField = (field: 'startupUrl' | 'email' | 'gateway' | 'gatewayOther', value: string) => {
    emit('update:modelValue', { ...props.modelValue, [field]: value });
};

const handleGatewayClick = (gw: string) => {
    const isActive = props.modelValue.gateway === gw;
    const nextGateway = (isActive && gw !== 'Otra') ? '' : gw;
    
    const newForm = { 
        ...props.modelValue, 
        gateway: nextGateway 
    };
    
    if (nextGateway !== 'Otra') {
        newForm.gatewayOther = '';
    }
    
    emit('update:modelValue', newForm);
};
</script>

<template>
    <form class="flex flex-col gap-3" @submit.prevent="emit('submit')">
        <!-- URL & Email -->
        <div class="flex gap-2">
            <input
                :value="modelValue.startupUrl"
                type="text"
                :placeholder="t.calculator.ranking.form.urlPlaceholder"
                required
                class="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5 text-white font-sans text-sm font-light placeholder-white/20 outline-none transition-all focus:border-[#00D4FF]/30"
                @input="updateField('startupUrl', ($event.target as HTMLInputElement).value)"
            />
            <input
                :value="modelValue.email"
                type="email"
                :placeholder="t.calculator.ranking.form.emailPlaceholder"
                required
                class="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5 text-white font-sans text-sm font-light placeholder-white/20 outline-none transition-all focus:border-[#00D4FF]/30"
                @input="updateField('email', ($event.target as HTMLInputElement).value)"
            />
        </div>

        <!-- Gateway Selector -->
        <div class="flex flex-col gap-2">
            <span class="font-sans text-[10px] text-white/30 uppercase tracking-widest pl-1">{{ t.calculator.ranking.form.gatewayLabel }}</span>
            <div class="flex flex-wrap gap-1.5 items-center">
                <template v-for="gw in gateways" :key="gw.id">
                    <button
                        v-if="!(gw.id === 'Otra' && modelValue.gateway === 'Otra')"
                        type="button"
                        class="px-2.5 py-1.5 rounded-lg border font-sans text-[11px] transition-all duration-200 cursor-pointer"
                        :class="modelValue.gateway === gw.id 
                            ? 'bg-[#00D4FF]/10 border-[#00D4FF]/50 text-[#00D4FF]' 
                            : 'bg-transparent border-white/5 text-white/30 hover:border-white/15'"
                        @click="handleGatewayClick(gw.id)"
                    >
                        {{ gw.label() }}
                    </button>
                    
                    <div v-if="gw.id === 'Otra' && modelValue.gateway === 'Otra'" class="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div 
                            class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.5)] cursor-pointer" 
                            @click="handleGatewayClick('')"
                        />
                        <input
                            :value="modelValue.gatewayOther"
                            type="text"
                            :placeholder="t.calculator.ranking.form.otherPlaceholder"
                            required
                            autofocus
                            class="bg-transparent border-b border-[#00D4FF]/30 py-0.5 text-white font-sans text-[11px] outline-none placeholder-white/20 w-32 transition-all focus:border-[#00D4FF]"
                            @input="updateField('gatewayOther', ($event.target as HTMLInputElement).value)"
                            @keydown.esc="handleGatewayClick('')"
                        />
                    </div>
                </template>
            </div>
        </div>

        <button
            type="submit"
            :disabled="isLoading || !isGatewaySelected"
            class="w-full mt-3 py-2.5 rounded-xl font-sans text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-300 border"
            :class="isLoading || !isGatewaySelected
                ? 'bg-transparent text-white/20 border-white/[0.04] '
                : 'bg-white/[0.04] text-white/70 border-white/[0.07] hover:bg-white/[0.08] hover:text-white hover:border-white/15 cursor-pointer'"
        >
            {{ isLoading ? t.calculator.ranking.form.btnSending : !isGatewaySelected ? t.calculator.ranking.form.btnSelectGateway : t.calculator.ranking.form.btnSubmit }}
        </button>
    </form>
</template>
