import { ref } from 'vue';

const isReady = ref(false);

export function useAppStatus() {
    const setReady = (value: boolean) => {
        isReady.value = value;
    };

    return {
        isReady,
        setReady
    };
}
