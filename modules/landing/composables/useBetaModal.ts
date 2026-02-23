const isOpen = ref(false);

export function useBetaModal() {
    const open = () => { isOpen.value = true; };
    const close = () => { isOpen.value = false; };

    return {
        isOpen,
        open,
        close,
    };
}
