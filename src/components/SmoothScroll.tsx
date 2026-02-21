import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * High-performance smooth scrolling wrapper using Lenis.
 * See: https://github.com/darkroomengineering/lenis
 */
export const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.1,
            touchMultiplier: 2,
        });

        // RAF loop
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Expose scrollTo globally to coordinate with Hero links etc.
        (window as any).lenisScrollTo = (target: string | HTMLElement) => {
            lenis.scrollTo(target);
        };

        return () => {
            lenis.destroy();
            delete (window as any).lenisScrollTo;
        };
    }, []);

    return <>{children}</>;
};
