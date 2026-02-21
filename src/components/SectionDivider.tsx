import { motion } from 'framer-motion';

interface SectionDividerProps {
    number: string;
    label: string;
}

const SectionDivider = ({ number, label }: SectionDividerProps) => {
    return (
        <div className="relative py-12 overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12 flex items-center gap-8">
                <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Phase {number}</span>
                    <div className="h-px w-12 bg-primary/30" />
                    <span className="text-[10px] font-black text-muted-foreground tracking-[0.3em] uppercase">{label}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
            </div>

            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
        </div>
    );
};

export default SectionDivider;
