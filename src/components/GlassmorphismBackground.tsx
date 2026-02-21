import { useEffect, useRef } from 'react';

interface FloatingLightProps {
    color: string;
    size: number;
    duration: number;
    delay: number;
    blur: number;
}

const FloatingLight = ({ color, size, duration, delay, blur }: FloatingLightProps) => {
    const lightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const light = lightRef.current;
        if (!light) return;

        const animate = () => {
            const x = Math.random() * (window.innerWidth - size);
            const y = Math.random() * (window.innerHeight - size);

            light.style.transform = `translate(${x}px, ${y}px)`;
            light.style.transition = `transform ${duration}s ease-in-out`;

            setTimeout(animate, duration * 1000 + delay * 1000);
        };

        // Initial position
        const initialX = Math.random() * (window.innerWidth - size);
        const initialY = Math.random() * (window.innerHeight - size);
        light.style.transform = `translate(${initialX}px, ${initialY}px)`;

        setTimeout(animate, delay * 1000);
    }, [size, duration, delay]);

    return (
        <div
            ref={lightRef}
            className="absolute rounded-full pointer-events-none"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                background: `radial-gradient(circle, ${color}40 0%, ${color}20 50%, transparent 100%)`,
                filter: `blur(${blur}px)`,
                animation: `pulse-glow ${duration * 2}s ease-in-out infinite`,
            }}
        />
    );
};

interface GlassmorphismBackgroundProps {
    children: React.ReactNode;
    className?: string;
    intensity?: 'light' | 'medium' | 'heavy';
}

const GlassmorphismBackground = ({
    children,
    className = '',
    intensity = 'medium'
}: GlassmorphismBackgroundProps) => {
    const blurIntensity = {
        light: 'backdrop-blur-sm',
        medium: 'backdrop-blur-md',
        heavy: 'backdrop-blur-xl'
    };

    const opacityIntensity = {
        light: 'bg-white/10',
        medium: 'bg-white/20',
        heavy: 'bg-white/30'
    };

    const lights = [
        // Primary blue lights
        { color: 'hsl(221, 83%, 53%)', size: 200, duration: 20, delay: 0, blur: 40 },
        { color: 'hsl(221, 83%, 53%)', size: 150, duration: 25, delay: 5, blur: 35 },
        { color: 'hsl(221, 83%, 53%)', size: 100, duration: 18, delay: 10, blur: 30 },

        // Secondary teal lights
        { color: 'hsl(174, 72%, 56%)', size: 180, duration: 22, delay: 2, blur: 38 },
        { color: 'hsl(174, 72%, 56%)', size: 120, duration: 28, delay: 7, blur: 32 },
        { color: 'hsl(174, 72%, 56%)', size: 90, duration: 16, delay: 12, blur: 28 },

        // Accent purple lights
        { color: 'hsl(262, 83%, 58%)', size: 160, duration: 24, delay: 3, blur: 36 },
        { color: 'hsl(262, 83%, 58%)', size: 110, duration: 19, delay: 8, blur: 31 },

        // Pink accent lights
        { color: 'hsl(322, 84%, 60%)', size: 140, duration: 21, delay: 4, blur: 34 },
        { color: 'hsl(322, 84%, 60%)', size: 85, duration: 17, delay: 9, blur: 29 },
    ];

    return (
        <div className={`relative min-h-screen overflow-hidden ${className}`}>
            {/* Animated background lights */}
            <div className="fixed inset-0 pointer-events-none">
                {lights.map((light, index) => (
                    <FloatingLight
                        key={index}
                        color={light.color}
                        size={light.size}
                        duration={light.duration}
                        delay={light.delay}
                        blur={light.blur}
                    />
                ))}
            </div>

            {/* Glassmorphism overlay */}
            <div className={`fixed inset-0 ${blurIntensity[intensity]} ${opacityIntensity[intensity]} border border-white/20`} />

            {/* Gradient mesh overlay */}
            <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="fixed inset-0 bg-gradient-to-tl from-transparent via-background/50 to-accent/5" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GlassmorphismBackground;
