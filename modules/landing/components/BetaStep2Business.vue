<script setup lang="ts">
import { computed } from 'vue';
import { useBetaForm } from '../composables/useBetaForm';
import { useLanguage } from '../composables/useLanguage';
import BetaStepHeader from './BetaStepHeader.vue';
import BetaRadioItem from './BetaRadioItem.vue';

const { form, gateways, selectGateway } = useBetaForm();
const { t } = useLanguage();

const motivations = computed(() => [
    { value: 'reach', label: t.value.beta.step2.motivations.reach },
    { value: 'authority', label: t.value.beta.step2.motivations.authority },
    { value: 'seo', label: t.value.beta.step2.motivations.seo },
    { value: 'investment', label: t.value.beta.step2.motivations.investment },
]);
</script>

<template>
    <div>
        <BetaStepHeader :pill="t.beta.step2.pill" :title="t.beta.step2.title" />

        <div class="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
                <p class="text-xs uppercase tracking-widest text-gray-500 mb-4">{{ t.beta.step2.gatewayPill }}</p>
                <div class="flex flex-col">
                    <template v-for="gw in gateways" :key="gw">
                        <BetaRadioItem
                            v-if="gw !== 'Otra' || form.gateway !== 'Otra'"
                            :label="gw === 'Otra' ? t.beta.step2.other : gw"
                            :isActive="form.gateway === gw"
                            @select="selectGateway(gw)"
                        />
                        <label v-else class="flex items-center gap-3 py-3 cursor-pointer group" @click="selectGateway(gw)">
                            <span
                                class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200"
                                style="border-color: rgba(0,212,255,0.9); background: rgba(0,212,255,0.15);"
                            >
                                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            </span>
                            <input
                                v-model="form.gatewayOther"
                                type="text"
                                :placeholder="t.beta.step2.otherPlaceholder"
                                class="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/25 border-b transition-colors focus:border-cyan-500"
                                style="border-color: rgba(255,255,255,0.15); caret-color: #00D4FF;"
                                @click.stop
                                autofocus
                            />
                        </label>
                    </template>
                </div>
            </div>

            <div>
                <p class="text-xs uppercase tracking-widest text-gray-500 mb-4">{{ t.beta.step2.motivationPill }}</p>
                <div class="flex flex-col">
                    <BetaRadioItem
                        v-for="m in motivations"
                        :key="m.value"
                        :label="m.label"
                        :isActive="form.motivation === m.value"
                        @select="form.motivation = m.value"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
