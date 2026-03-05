import { ref } from 'vue';

const isSubmitted = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const userRank = ref<number | null>(null);
const chartUrl = ref<string | null>(null);

export function useRankSubmit() {
    const form = ref({ startupUrl: '', email: '', gateway: '', gatewayOther: '' });

    const submit = async (metrics: {
        valuation: number;
        arr: number;
        growthRate: number;
        churnRate: number;
        marginPercent: number;
        marketLabel: string;
        adjustedMultiple: number;
        language: string;
    }) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await $fetch<{ success: boolean, ranking: number, chartUrl: string }>('/api/leads', {
                method: 'POST',
                body: {
                    startupUrl: form.value.startupUrl,
                    email: form.value.email,
                    gateway: form.value.gateway === 'Otra' ? form.value.gatewayOther : form.value.gateway,
                    source: 'calculator',
                    ...metrics
                },
            });
            
            if (response.ranking) {
                userRank.value = response.ranking;
            }
            if (response.chartUrl) {
                chartUrl.value = response.chartUrl;
            }
            isSubmitted.value = true;
        } catch (err: any) {
            error.value = err?.data?.message || 'Ocurrió un error. Inténtalo de nuevo.';
        } finally {
            isLoading.value = false;
        }
    };

    return {
        form,
        isSubmitted,
        isLoading,
        error,
        userRank,
        chartUrl,
        submit,
    };
}
