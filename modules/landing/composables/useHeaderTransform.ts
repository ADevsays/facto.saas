import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useHeaderTransform() {
    const initHeaderAnimation = (pillElement: HTMLElement, linksElement?: HTMLElement, ctaElement?: HTMLElement) => {
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
                    end: '+=120%', // Aligned with Hero pinning
                    scrub: 1.5, // Un toque de suavidad sin perder respuesta
                }
            });

            // Sincronizar aparición de links y CTA
            if (isDesktop && linksElement) {
                // Forzar estado inicial
                gsap.set(linksElement, { opacity: 0 });
                
                tl.to(linksElement, {
                    opacity: 1,
                    duration: 0.15,
                    ease: 'power2.inOut'
                }, 0.02); // Inicia casi inmediatamente al scrollear
            }

            if (ctaElement) {
                // Inicia visible como texto plano (fase 1)
                gsap.set(ctaElement, { 
                    opacity: 1, 
                    backgroundColor: 'rgba(0, 212, 255, 0)',
                    borderColor: 'rgba(0, 212, 255, 0)',
                    backdropFilter: 'blur(0px)'
                });

                // Activar el fondo glass sincronizado con el encogimiento del pill (0.25)
                tl.to(ctaElement, {
                    backgroundColor: 'rgba(0, 212, 255, 0.08)',
                    borderColor: 'rgba(0, 212, 255, 0.4)',
                    backdropFilter: 'blur(12px)',
                    filter: 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.3))',
                    duration: 0.4, // Más suave
                    ease: 'power2.inOut'
                }, 0.2);
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
                duration: 0.5, // Transición de ancho más larga y suave
                ease: 'power2.inOut' // Curva mucho más fluida para el cambio de tamaño
            }, 0.15); // Empieza un poco antes para que se sienta más orgánico

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
