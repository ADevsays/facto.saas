import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export function useSmoothScroll() {
    const scrollToSection = (e?: Event, href?: string) => {
        if (e) e.preventDefault();
        if (!href) return;

        gsap.to(window, {
            duration: 0.3, // Más lento para mayor elegancia
            scrollTo: {
                y: href,
                offsetY: 120
            },
            ease: "expo.inOut" // Transición más suave y fluida
        });
    };

    return {
        scrollToSection
    };
}
