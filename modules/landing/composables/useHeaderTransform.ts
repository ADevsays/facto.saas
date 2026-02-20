import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useHeaderTransform() {
    const initHeaderAnimation = (headerElement: HTMLElement, pillElement: HTMLElement, linksElement?: HTMLElement) => {
        const mm = gsap.matchMedia();

        mm.add({
            isDesktop: "(min-width: 768px)",
            isMobile: "(max-width: 767px)"
        }, (context) => {
            const { isDesktop } = context.conditions as any;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: '+=150%', // Aligned with Hero pinning
                    scrub: 1,
                    snap: {
                        snapTo: [0, 0.1, 0.25, 0.4], // Snaps to exactly these progress points
                        duration: { min: 0.2, max: 0.6 },
                        delay: 0.05,
                        ease: 'power2.inOut'
                    }
                }
            });

            if (isDesktop && linksElement) {
                tl.to(linksElement, {
                    opacity: 1,
                    duration: 0.1,
                    ease: 'none'
                }, 0);
            }

            // PHASE 3: Final Snap (0.25 to 0.4)
            tl.to(pillElement, {
                width: isDesktop ? '1000px' : '92vw',
                backgroundColor: 'rgba(8, 8, 8, 0.95)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                y: isDesktop ? 25 : 14,
                paddingLeft: isDesktop ? '2.5rem' : '1.5rem',
                paddingRight: isDesktop ? '2.5rem' : '1.5rem',
                duration: 0.15,
                ease: 'power3.out'
            }, 0.25);

            // Freeze state from 40% to the end
            tl.to({}, { duration: 0.6 }); 

            return () => {
                tl.kill();
                mm.revert();
            };
        });
    };

    return {
        initHeaderAnimation
    };
}
