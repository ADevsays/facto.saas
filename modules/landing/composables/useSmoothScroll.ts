import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export function useSmoothScroll() {
    const scrollToSection = (e?: Event, href?: string) => {
        if (e) e.preventDefault();
        if (!href) return;

        gsap.to(window, {
            duration: 1.2,
            scrollTo: {
                y: href,
                offsetY: 120
            },
            ease: "power4.inOut"
        });
    };

    return {
        scrollToSection
    };
}
