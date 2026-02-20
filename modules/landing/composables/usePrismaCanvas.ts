export function usePrismaCanvas() {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const context = ref<CanvasRenderingContext2D | null>(null);
    const images = ref<HTMLImageElement[]>([]);
    let resizeObserver: ResizeObserver | null = null;

    const loadImages = async () => {
        const imagesGlob = import.meta.glob('@/assets/css/landing/prisma/*.jpg', { eager: true, import: 'default' });

        const sortedPaths = Object.keys(imagesGlob).sort((a, b) => {
            const numA = parseInt(a.match(/frame-(\d+)/)?.[1] || '0');
            const numB = parseInt(b.match(/frame-(\d+)/)?.[1] || '0');
            return numA - numB;
        });

        const promises = sortedPaths.map((path) => {
            return new Promise<HTMLImageElement>((resolve) => {
                const img = new Image();
                img.src = imagesGlob[path] as string;
                img.onload = () => resolve(img);
            });
        });

        images.value = await Promise.all(promises);
    };

    const render = (frameIndex: number, zoomScale: number, opacity: number = 1) => {
        if (!context.value || !canvasRef.value || images.value.length === 0) return;

        const canvas = canvasRef.value;
        const ctx = context.value;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const clampedIndex = Math.min(Math.max(Math.round(frameIndex), 0), images.value.length - 1);
        const img = images.value[clampedIndex];

        if (img) {
            const isPortrait = canvas.height > canvas.width;
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = (isPortrait ? Math.max(hRatio, vRatio) * 0.6 : Math.max(hRatio, vRatio)) * zoomScale;

            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;
            
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
            ctx.globalAlpha = 1;
        }
    };

    const handleResize = (onResize?: () => void) => {
        if (canvasRef.value?.parentElement) {
            const container = canvasRef.value.parentElement;
            canvasRef.value.width = container.offsetWidth;
            canvasRef.value.height = container.offsetHeight;
            onResize?.();
        }
    };

    const initCanvas = (onResize?: () => void) => {
        if (!canvasRef.value) return;
        context.value = canvasRef.value.getContext('2d');

        resizeObserver = new ResizeObserver(() => handleResize(onResize));
        if (canvasRef.value.parentElement) {
            resizeObserver.observe(canvasRef.value.parentElement);
        }
        handleResize(onResize);
    };

    const destroyCanvas = () => {
        resizeObserver?.disconnect();
    };

    return {
        canvasRef,
        images,
        loadImages,
        render,
        initCanvas,
        destroyCanvas,
    };
}
