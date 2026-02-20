import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PrismaScrollOptions {
    trigger: HTMLElement;
    textElement?: HTMLElement;
    glowElement?: HTMLElement;
    totalFrames: number;
    onRender: (frameIndex: number, zoomScale: number) => void;
}

export function usePrismaScroll() {
    const currentFrame = { index: 0 };
    const zoomScale = { value: 1 };

    const initScroll = ({ trigger, textElement, glowElement, totalFrames, onRender }: PrismaScrollOptions) => {
        const zoomStartRatio = 0.25;

        // Unified timeline for pinned animation and fade out
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger, 
                start: 'top top',
                end: '+=150%',
                scrub: true, // Perfect sync for frame animation
                pin: true,
                anticipatePin: 1.5,
                fastScrollEnd: true,
                preventOverlaps: true,
            },
            onUpdate: () => onRender(currentFrame.index, zoomScale.value),
        });

        tl.to(currentFrame, {
            index: totalFrames,
            ease: 'none',
        }, 0);

        tl.to(zoomScale, {
            value: 1.01,
            ease: 'power2.in',
        }, zoomStartRatio);

        // Neon Glow Animation
        if (glowElement) {
            // Start Color: #1f2123 (Crystalline Charcoal) con transparencia
            gsap.set(glowElement, { 
                backgroundColor: '#1a1a1a', 
                opacity: 1,
                boxShadow: 'rgb(183 184 185 / 50%) 0px 0px 50px 10px' 
            });

            // Transition: Gradient from #e0ca1a to #b35505
            tl.to(glowElement, {
                backgroundImage: 'linear-gradient(to bottom, #e0ca1a, #b35505)',
                backgroundColor: 'transparent',
                opacity: 0.5,
                boxShadow: '0 0 70px 20px rgba(179, 85, 5, 0.3)',
                duration: 0.4, 
                ease: 'power1.inOut'
            }, 0.1);
        }

        // Text specific animation: move up and fade out
        if (textElement) {
            tl.to(textElement, {
                y: -100, 
                opacity: 0,
                ease: 'power1.inOut'
            }, 0.6);
        }

        // Final section fade out
        tl.to(trigger, {
            opacity: 0,
            ease: 'power1.in'
        }, 0.8);
    };

    const destroyScroll = () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
    };

    return {
        initScroll,
        destroyScroll,
    };
}
