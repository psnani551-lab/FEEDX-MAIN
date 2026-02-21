import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const VisionSection = () => {
    return (
        <section className="py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                >
                    <Card className="glass-card border-white/10 overflow-hidden">
                        <CardContent className="p-12 lg:p-20 relative">
                            {/* Decorative Quote Mark */}
                            <div className="absolute top-8 left-8 text-primary/10 text-[200px] font-serif leading-none pointer-events-none">
                                "
                            </div>

                            <div className="relative text-center max-w-4xl mx-auto space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">The Vision</span>
                                </div>

                                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-[1.1] tracking-tighter">
                                    To transform Polytechnic education into a{" "}
                                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        career-driven journey
                                    </span>
                                    {" "}where every student graduates with the skills to earn, innovate, and lead.
                                </p>

                                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-bold uppercase tracking-widest pt-8">
                                    <div className="h-px w-12 bg-white/20" />
                                    <span>Building Tomorrow's Leaders</span>
                                    <div className="h-px w-12 bg-white/20" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </section>
    );
};

export default VisionSection;
