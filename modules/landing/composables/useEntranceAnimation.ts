import { gsap } from 'gsap';

export function useStaggeredEntrance(container: any, selector: string = '.reveal-item', delay: number = 0.5) {
    const animate = () => {
        const root = container.value?.$el || container.value;
        if (!root) return;

        const targets = root.querySelectorAll(selector);
        if (targets.length === 0) return;
        
        gsap.fromTo(targets, 
            { 
                y: 40,
                opacity: 0 
            },
            {
                y: 0,
                opacity: 1,
                duration: 1.2,
                stagger: 0.2,
                ease: 'power3.out',
                delay: delay
            }
        );
    };

    return {
        animate
    };
}
