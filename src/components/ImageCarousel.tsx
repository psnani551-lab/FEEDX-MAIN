import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface GalleryImage {
  id: string;
  url: string;
  order: number;
}

interface ImageCarouselProps {
  className?: string;
}

const ImageCarousel = ({ className = '' }: ImageCarouselProps) => {
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch gallery images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const images: GalleryImage[] = await galleryAPI.getAll();
        const sortedImages = images.sort((a, b) => a.order - b.order);

        if (sortedImages.length > 0) {
          setCarouselImages(sortedImages.map(img => img.url));
        } else {
          // Fallback if API returns empty (e.g. no images or RLS blocking)
          setCarouselImages([
            '/images/carousel/carousel1.jpg',
            '/images/carousel/carousel2.jpg',
            '/images/carousel/carousel3.jpg',
            '/images/carousel/carousel 4.jpg',
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch gallery images:', error);
        // Fallback to default images if API fails
        setCarouselImages([
          '/images/carousel/carousel1.jpg',
          '/images/carousel/carousel2.jpg',
          '/images/carousel/carousel3.jpg',
          '/images/carousel/carousel 4.jpg',
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  }, [carouselImages.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  }, [carouselImages.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || carouselImages.length === 0) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide, carouselImages.length]);

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  // Show loading state
  if (isLoading || carouselImages.length === 0) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white/50 backdrop-blur-sm border border-white/20">
          <div className="relative aspect-[3/2] sm:aspect-[16/9] lg:aspect-[2.2/1] flex items-center justify-center">
            <div className="text-muted-foreground">Loading gallery...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Carousel Container */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl bg-slate-50 backdrop-blur-sm border border-slate-200/50"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="relative aspect-[3/2] sm:aspect-[16/9] lg:aspect-[2.2/1] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.img
              key={currentIndex}
              src={getImageUrl(carouselImages[currentIndex])}
              alt={`Carousel image ${currentIndex + 1}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain p-2"
            />
          </AnimatePresence>

          {/* Gradient overlay for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300 hover:scale-110 z-10 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 group-active:scale-90 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300 hover:scale-110 z-10 group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 group-active:scale-90 transition-transform" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {carouselImages.map((imgUrl, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentIndex
              ? 'bg-primary w-6 sm:w-8'
              : 'bg-gray-300 hover:bg-gray-400'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;