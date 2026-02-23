<script setup lang="ts">
import { useBetaForm } from '../composables/useBetaForm';
import { useLanguage } from '../composables/useLanguage';
import { computed } from 'vue';

const { form, gateways, motivations: rawMotivations, selectGateway } = useBetaForm();
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
        <p class="text-gray-600 text-xs uppercase tracking-widest mb-4">{{ t.beta.step2.pill }}</p>
        <h2 class="font-serif text-4xl md:text-5xl text-white mb-8 leading-tight">
            {{ t.beta.step2.title }}
        </h2>

        <div class="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <!-- Gateways -->
            <div>
                <p class="text-xs uppercase tracking-widest text-gray-500 mb-4">{{ t.beta.step2.gatewayPill }}</p>
                <div class="flex flex-col">
                    <label
                        v-for="gw in gateways"
                        :key="gw"
                        class="flex items-center gap-3 py-3 cursor-pointer group"
                        @click="selectGateway(gw)"
                    >
                        <span
                            class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200"
                            :style="form.gateway === gw
                                ? 'border-color: rgba(0,212,255,0.9); background: rgba(0,212,255,0.15);'
                                : 'border-color: rgba(255,255,255,0.2);'"
                        >
                            <span
                                class="w-1.5 h-1.5 rounded-full bg-cyan-400 transition-all duration-200"
                                :class="form.gateway === gw ? 'opacity-100 scale-100' : 'opacity-0 scale-0'"
                            />
                        </span>

                        <span
                            v-if="gw !== 'Otra' || form.gateway !== 'Otra'"
                            class="text-sm transition-colors duration-200"
                            :class="form.gateway === gw ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'"
                        >
                            {{ gw === 'Otra' ? t.beta.step2.other : gw }}
                        </span>
                        <input
                            v-else
                            v-model="form.gatewayOther"
                            type="text"
                            :placeholder="t.beta.step2.otherPlaceholder"
                            class="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/25 border-b transition-colors focus:border-cyan-500"
                            style="border-color: rgba(255,255,255,0.15);"
                            @click.stop
                            autofocus
                        />
                    </label>
                </div>
            </div>

            <!-- Motivations -->
            <div>
                <p class="text-xs uppercase tracking-widest text-gray-500 mb-4">{{ t.beta.step2.motivationPill }}</p>
                <div class="flex flex-col">
                    <label
                        v-for="m in motivations"
                        :key="m.value"
                        class="flex items-center gap-3 py-3 cursor-pointer group"
                        @click="form.motivation = m.value"
                    >
                        <span
                            class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200"
                            :style="form.motivation === m.value
                                ? 'border-color: rgba(0,212,255,0.9); background: rgba(0,212,255,0.15);'
                                : 'border-color: rgba(255,255,255,0.2);'"
                        >
                            <span
                                class="w-1.5 h-1.5 rounded-full bg-cyan-400 transition-all duration-200"
                                :class="form.motivation === m.value ? 'opacity-100 scale-100' : 'opacity-0 scale-0'"
                            />
                        </span>
                        <span
                            class="text-sm transition-colors duration-200"
                            :class="form.motivation === m.value ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'"
                        >
                            {{ m.label }}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
input { caret-color: #00D4FF; }
</style>
