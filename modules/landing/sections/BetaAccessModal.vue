<script setup lang="ts">
import { useBetaModal } from '../composables/useBetaModal';
import { useBetaForm } from '../composables/useBetaForm';
import BetaModalHeader from '../components/BetaModalHeader.vue';
import BetaModalProgress from '../components/BetaModalProgress.vue';
import BetaModalNav from '../components/BetaModalNav.vue';
import BetaModalSuccess from '../components/BetaModalSuccess.vue';
import BetaStep1Url from '../components/BetaStep1Url.vue';
import BetaStep2Business from '../components/BetaStep2Business.vue';
import BetaStep3Email from '../components/BetaStep3Email.vue';

const { isOpen, close } = useBetaModal();
const { currentStep, isSubmitted, reset } = useBetaForm();

const handleClose = () => {
    close();
    setTimeout(reset, 500);
};

const handleBackdropClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
        handleClose();
    }
};
</script>

<template>
    <Teleport to="body">
        <Transition name="backdrop-fade">
            <div
                v-if="isOpen"
                class="modal-backdrop fixed inset-0 z-[100] flex items-end justify-center"
                style="background: rgba(3,3,5,0.75); backdrop-filter: blur(10px);"
                @click="handleBackdropClick"
            >
                <Transition name="sheet-slide" appear>
                    <div
                        class="modal-sheet w-full lg:w-[80%] max-w-5xl mx-auto rounded-t-3xl"
                        style="background: rgba(10,10,14,0.99); border: 1px solid rgba(255,255,255,0.08); border-bottom: none; max-height: 88dvh; display: flex; flex-direction: column;"
                    >
                        <BetaModalHeader @close="handleClose" />

                        <BetaModalProgress v-if="!isSubmitted" />

                        <div class="px-8 py-6 overflow-y-auto flex-1">
                            <Transition name="step-fade" mode="out-in">
                                <BetaModalSuccess v-if="isSubmitted" key="done" @close="handleClose" />
                                <BetaStep1Url v-else-if="currentStep === 1" key="step1" />
                                <BetaStep2Business v-else-if="currentStep === 2" key="step2" />
                                <BetaStep3Email v-else-if="currentStep === 3" key="step3" />
                            </Transition>
                        </div>

                        <BetaModalNav v-if="!isSubmitted" />
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
    transition: opacity 0.3s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
    opacity: 0;
}

.sheet-slide-enter-active {
    transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-leave-active {
    transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-enter-from {
    transform: translateY(100%);
}
.sheet-slide-leave-to {
    transform: translateY(100%);
}

.step-fade-enter-active,
.step-fade-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
}
.step-fade-enter-from {
    opacity: 0;
    transform: translateX(16px);
}
.step-fade-leave-to {
    opacity: 0;
    transform: translateX(-16px);
}
</style>
