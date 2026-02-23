<script setup lang="ts">
import { usePrismaCanvas } from '../composables/usePrismaCanvas';
import { usePrismaScroll } from '../composables/usePrismaScroll';
import { useAppStatus } from '../composables/useAppStatus';

const props = defineProps<{
    scrollTrigger?: HTMLElement;
    textElement?: HTMLElement;
}>();

const { canvasRef, images, loadImages, render, initCanvas, destroyCanvas } = usePrismaCanvas();
const { initScroll, reinit, destroyScroll } = usePrismaScroll();
const { setReady } = useAppStatus();
const glowRef = ref<HTMLElement | null>(null);

onMounted(async () => {
    if (!canvasRef.value) return;

    initCanvas(() => {
        render(0, 1);
        reinit();
    });

    await loadImages();
    render(0, 1);
    
    setReady(true);

    const trigger = props.scrollTrigger || canvasRef.value.parentElement;
    if (!trigger) return;

    initScroll({
        trigger,
        textElement: props.textElement,
        glowElement: glowRef.value || undefined,
        totalFrames: images.value.length - 1,
        onRender: (frameIndex, zoomScale) => render(frameIndex, zoomScale),
    });
});

onUnmounted(() => {
    destroyScroll();
    destroyCanvas();
});
</script>

<template>
    <div class="absolute inset-0 z-0 bg-transparent overflow-hidden pointer-events-none">
        <canvas ref="canvasRef" class="block w-full h-full opacity-85"></canvas>
        
        <!-- Neon Shadow Glow (Mobile only) - Sincronizado con max() para seguir al cristal -->
        <div 
            ref="glowRef" 
            class="md:hidden absolute bottom-[20%] left-1/2 -translate-x-1/2 rounded-full blur-[100px] z-[-1] pointer-events-none opacity-100"
            :style="{ 
                width: 'max(70vh, 42vw)', 
                height: 'max(10vh, 6vw)',
                backgroundColor: '#1a1a1a' 
            }"
        ></div>
    </div>
</template>
