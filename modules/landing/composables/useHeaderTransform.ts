import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useHeaderTransform() {
    let mm: gsap.MatchMedia | null = null;

    const initHeaderAnimation = (pillElement: HTMLElement, linksElement?: HTMLElement, ctaElement?: HTMLElement) => {
        mm = gsap.matchMedia();

        mm.add({
            isDesktop: "(min-width: 768px)",
            isMobile: "(max-width: 767px)"
        }, (context) => {
            const { isDesktop } = context.conditions as any;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: '+=120%',
                    scrub: 1.5,
                }
            });

            if (isDesktop && linksElement) {
                gsap.set(linksElement, { opacity: 0 });
                
                tl.to(linksElement, {
                    opacity: 1,
                    duration: 0.15,
                    ease: 'power2.inOut'
                }, 0.02);
            }

            if (ctaElement) {
                gsap.set(ctaElement, { 
                    opacity: 1, 
                    backgroundColor: 'rgba(0, 212, 255, 0)',
                    borderColor: 'rgba(0, 212, 255, 0)',
                    backdropFilter: 'blur(0px)'
                });

                tl.to(ctaElement, {
                    backgroundColor: 'rgba(0, 212, 255, 0.08)',
                    borderColor: 'rgba(0, 212, 255, 0.4)',
                    backdropFilter: 'blur(12px)',
                    filter: 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.3))',
                    duration: 0.4,
                    ease: 'power2.inOut'
                }, 0.2);
            }

            tl.to(pillElement, {
                width: isDesktop ? '1000px' : '92vw',
                backgroundColor: 'rgba(8, 8, 8, 0.95)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                y: isDesktop ? 25 : 14,
                paddingLeft: isDesktop ? '2.5rem' : '1.5rem',
                paddingRight: isDesktop ? '2.5rem' : '1.5rem',
                duration: 0.5,
                ease: 'power2.inOut'
            }, 0.15);

            tl.to({}, { duration: 0.6 }); 

            return () => {
                tl.kill();
            };
        });
    };

    const destroyHeaderAnimation = () => {
        if (mm) {
            mm.revert();
            mm = null;
        }
    };

    return {
        initHeaderAnimation,
        destroyHeaderAnimation,
    };
}
