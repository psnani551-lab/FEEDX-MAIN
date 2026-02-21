import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the top cordinate to 0
    // make scrolling smooth
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-8 right-8 z-40"
                >
                    <Button
                        onClick={scrollToTop}
                        size="icon"
                        className="rounded-full w-12 h-12 bg-primary/80 backdrop-blur-md hover:bg-primary text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 border border-white/10"
                        aria-label="Back to top"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
