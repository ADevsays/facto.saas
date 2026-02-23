import { submitLead } from '../services/leadService'

const currentStep = ref(1);
const totalSteps = 3;
const isSubmitted = ref(false);
const isLoading = ref(false);
const submitError = ref<string | null>(null);


const form = reactive({
    startupUrl: '',
    gateway: '',
    gatewayOther: '',
    motivation: '',
    email: '',
});

const gateways = ['Stripe', 'Mercado Pago', 'Paddle', 'Otra'];
const motivations = [
    { value: 'reach', label: 'Aumentar alcance' },
    { value: 'authority', label: 'Autoridad' },
    { value: 'seo', label: 'SEO' },
    { value: 'investment', label: 'Inversión' },
];

export function useBetaForm() {
    const canProceed = computed(() => {
        if (currentStep.value === 1) return form.startupUrl.trim().length > 0;
        if (currentStep.value === 2) {
            const gatewayOk = form.gateway.length > 0 && (form.gateway !== 'Otra' || form.gatewayOther.trim().length > 0);
            return gatewayOk && form.motivation.length > 0;
        }
        if (currentStep.value === 3) return form.email.trim().length > 0 && form.email.includes('@');
        return true;
    });

    const selectGateway = (gw: string) => {
        form.gateway = gw;
        if (gw !== 'Otra') form.gatewayOther = '';
    };

    const next = async () => {
        if (!canProceed.value) return;
        if (currentStep.value < totalSteps) {
            currentStep.value++;
        } else {
            isLoading.value = true;
            submitError.value = null;
            try {
                await submitLead({
                        email: form.email,
                        startupUrl: form.startupUrl,
                        gateway: form.gateway === 'Otra' ? form.gatewayOther : form.gateway,
                        motivation: form.motivation,
                    });
                isSubmitted.value = true;
            } catch (err: any) {
                submitError.value = err?.data?.message === 'Email already registered'
                    ? 'Este email ya está registrado.'
                    : 'Algo salió mal. Intenta de nuevo.';
            } finally {
                isLoading.value = false;
            }
        }
    };


    const back = () => {
        if (currentStep.value > 1) currentStep.value--;
    };

    const reset = () => {
        currentStep.value = 1;
        isSubmitted.value = false;
        form.startupUrl = '';
        form.gateway = '';
        form.gatewayOther = '';
        form.motivation = '';
        form.email = '';
    };

    return {
        currentStep,
        totalSteps,
        isSubmitted,
        isLoading,
        submitError,
        form,
        gateways,
        motivations,
        canProceed,
        selectGateway,
        next,
        back,
        reset,
    };
}
