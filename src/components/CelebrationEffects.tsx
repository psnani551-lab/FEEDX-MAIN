import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
}

interface Rocket {
    id: number;
    x: number;
    targetY: number;
    color: string;
}

const COLORS = ['#3B82F6', '#22D3EE', '#6366F1', '#A5B4FC', '#FBBF24'];

const CelebrationEffects: React.FC = () => {
    const [rockets, setRockets] = useState<Rocket[]>([]);
    const [explosions, setExplosions] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

    useEffect(() => {
        const launchRocket = () => {
            const id = Date.now();
            const x = Math.random() * 100;
            const targetY = 20 + Math.random() * 40;
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];

            setRockets(prev => [...prev, { id, x, targetY, color }]);

            // Explode after launch
            setTimeout(() => {
                setRockets(prev => prev.filter(r => r.id !== id));
                setExplosions(prev => [...prev, { id, x, y: targetY, color }]);

                // Remove explosion after animation
                setTimeout(() => {
                    setExplosions(prev => prev.filter(e => e.id !== id));
                }, 1000);
            }, 800);
        };

        const interval = setInterval(launchRocket, 3000);
        // Initial rockets
        launchRocket();
        setTimeout(launchRocket, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
            {/* Rockets */}
            <AnimatePresence>
                {rockets.map(rocket => (
                    <motion.div
                        key={rocket.id}
                        initial={{ transform: `translate3d(${rocket.x}vw, 110vh, 0)`, opacity: 1, scale: 1 }}
                        animate={{
                            transform: `translate3d(${rocket.x}vw, ${rocket.targetY}vh, 0)`,
                            opacity: [1, 1, 0],
                            scale: [1, 0.8, 0.5]
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute top-0 left-0 w-1 h-3 rounded-full blur-[1px] will-change-transform"
                        style={{ backgroundColor: rocket.color, boxShadow: `0 0 10px ${rocket.color}` }}
                    >
                        {/* Rocket Trail */}
                        <div
                            className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-12 opacity-50"
                            style={{ background: `linear-gradient(to top, transparent, ${rocket.color})` }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Explosions */}
            {explosions.map(exp => (
                <div
                    key={exp.id}
                    className="absolute top-0 left-0"
                    style={{ transform: `translate3d(${exp.x}vw, ${exp.y}vh, 0)` }}
                >
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                            animate={{
                                x: (Math.random() - 0.5) * 150,
                                y: (Math.random() - 0.5) * 150,
                                opacity: 0,
                                scale: 0,
                                translateZ: 0 // Force GPU
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute w-1.5 h-1.5 rounded-full will-change-transform"
                            style={{
                                backgroundColor: exp.color,
                                boxShadow: `0 0 8px ${exp.color}`
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default CelebrationEffects;
