import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// PDF pages - these would be images converted from PDF
// For now, we'll use a document viewer approach
const Celebrations = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);

    // Touch handling for swipe
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const pdfUrl = '/data/FEEDX Book 2k25 Anniversary Special ✨.pdf';

    const goToNext = () => {
        if (isFlipping) return;
        setDirection(1);
        setIsFlipping(true);
        setCurrentPage((prev) => prev + 1);
        setTimeout(() => setIsFlipping(false), 500);
    };

    const goToPrev = () => {
        if (isFlipping || currentPage === 0) return;
        setDirection(-1);
        setIsFlipping(true);
        setCurrentPage((prev) => prev - 1);
        setTimeout(() => setIsFlipping(false), 500);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) goToNext();
        if (distance < -minSwipeDistance) goToPrev();
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, isFlipping]);

    const pageVariants = {
        enter: (direction: number) => ({
            rotateY: direction > 0 ? -90 : 90,
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            rotateY: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            rotateY: direction < 0 ? -90 : 90,
            opacity: 0,
            scale: 0.9,
        }),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            <Navbar />

            <main className="pt-20 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </Link>
                        <a
                            href={pdfUrl}
                            download
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download PDF</span>
                        </a>
                    </div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center gap-3 mb-4">
                            <BookOpen className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
                                FEEDX Anniversary Book
                            </h1>
                        </div>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Celebrating 1 year of FEEDX! Swipe or use arrows to flip through pages.
                        </p>
                    </motion.div>

                    {/* Book Container */}
                    <div className="relative max-w-5xl mx-auto w-full mb-12">
                        {/* Responsive aspect ratio: Taller on mobile (3/4), Wide on desktop (16/9) */}
                        <div className="aspect-[3/4] md:aspect-[16/9] w-full bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-slate-200 relative">
                            {/* Crop bottom branding - increased to 75px for extra safety */}
                            <div className="absolute inset-0 w-full h-[calc(100%+75px)] -mt-2">
                                <iframe
                                    allowFullScreen
                                    allow="clipboard-write"
                                    className="fp-iframe w-full h-full border-0 select-none"
                                    src="https://heyzine.com/flip-book/859f613a01.html"
                                    style={{ marginBottom: '-75px' }}
                                />
                            </div>
                            {/* Overlay to ensure no interaction with the cropped area creates scroll issues */}
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-white z-10" />
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Swipe or click corners to flip pages • Double click to zoom
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
                        <div className="glass-card border-white/20 rounded-xl p-6 text-center">
                            <div className="text-3xl mb-2">📖</div>
                            <h3 className="font-semibold mb-1">Interactive Reading</h3>
                            <p className="text-sm text-muted-foreground">Flip through pages naturally</p>
                        </div>
                        <div className="glass-card border-white/20 rounded-xl p-6 text-center">
                            <div className="text-3xl mb-2">📱</div>
                            <h3 className="font-semibold mb-1">Mobile Friendly</h3>
                            <p className="text-sm text-muted-foreground">Swipe gestures supported</p>
                        </div>
                        <div className="glass-card border-white/20 rounded-xl p-6 text-center">
                            <div className="text-3xl mb-2">⬇️</div>
                            <h3 className="font-semibold mb-1">Download PDF</h3>
                            <p className="text-sm text-muted-foreground">Save for offline reading</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Celebrations;
