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
    let timeline: gsap.core.Timeline | null = null;
    let savedOptions: PrismaScrollOptions | null = null;
    let isReiniting = false;

    const buildTimeline = (options: PrismaScrollOptions) => {
        const { trigger, textElement, glowElement, totalFrames, onRender } = options;
        const zoomStartRatio = 0.25;

        currentFrame.index = 0;
        zoomScale.value = 1;

        timeline = gsap.timeline({
            scrollTrigger: {
                trigger, 
                start: 'top top',
                end: '+=140%',
                scrub: 1,
                pin: true,
                anticipatePin: 1.5,
            },
            onUpdate: () => onRender(currentFrame.index, zoomScale.value),
        });

        timeline.to(currentFrame, {
            index: totalFrames,
            ease: 'none',
        }, 0);

        timeline.to(zoomScale, {
            value: 1.01,
            ease: 'power2.in',
        }, zoomStartRatio);

        if (glowElement) {
            gsap.set(glowElement, { 
                backgroundColor: '#1a1a1a', 
                opacity: 1,
                boxShadow: 'rgb(183 184 185 / 50%) 0px 0px 50px 10px' 
            });

            timeline.to(glowElement, {
                backgroundImage: 'linear-gradient(to bottom, #e0ca1a, #b35505)',
                backgroundColor: 'transparent',
                opacity: 0.5,
                boxShadow: '0 0 70px 20px rgba(179, 85, 5, 0.3)',
                duration: 0.4, 
                ease: 'power1.inOut'
            }, 0.1);
        }

        if (textElement) {
            timeline.to(textElement, {
                y: -100, 
                opacity: 0,
                ease: 'power1.inOut'
            }, 0.6);
        }

        timeline.to(trigger, {
            opacity: 0,
            ease: 'power1.in'
        }, 0.8);
    };

    const killTimeline = () => {
        if (timeline) {
            const st = timeline.scrollTrigger;
            if (st) st.kill();
            timeline.kill();
            timeline = null;
        }
    };

    const initScroll = (options: PrismaScrollOptions) => {
        savedOptions = options;
        buildTimeline(options);
    };

    const reinit = () => {
        if (!savedOptions || isReiniting) return;
        isReiniting = true;

        killTimeline();

        requestAnimationFrame(() => {
            if (savedOptions) {
                buildTimeline(savedOptions);
            }
            isReiniting = false;
        });
    };

    const destroyScroll = () => {
        isReiniting = false;
        killTimeline();
        savedOptions = null;
    };

    return {
        initScroll,
        reinit,
        destroyScroll,
    };
}
