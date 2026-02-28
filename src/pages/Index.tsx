import { lazy, Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import SectionDivider from '@/components/SectionDivider';
import ErrorBoundary from '@/components/ErrorBoundary';


// Lazy load non-critical sections
const ImageCarousel = lazy(() => import('@/components/ImageCarousel'));
const FeaturesSection = lazy(() => import('@/components/FeaturesSection'));
const TestimonialsSection = lazy(() => import('@/components/TestimonialsSection'));
const EventsSection = lazy(() => import('@/components/EventsSection'));
const AboutSection = lazy(() => import('@/components/AboutSection'));
const VisionSection = lazy(() => import('@/components/VisionSection'));
const Footer = lazy(() => import('@/components/Footer'));

const BackToTop = lazy(() => import('@/components/BackToTop'));

const SectionLoader = () => (
  <div className="container mx-auto px-6 lg:px-12 py-24">
    <div className="space-y-12">
      <div className="space-y-4 animate-pulse">
        <div className="h-12 w-64 bg-white/5 rounded-2xl" />
        <div className="h-4 w-96 bg-white/5 rounded-full" />
      </div>
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white">
      <main className="space-y-0">
        <HeroSection />

        {/* Progressive Loading: Split Suspense boundaries for faster perceived load */}

        {/* 1. About Segment */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96" />}>
            <div className="py-12 bg-background relative z-10 -mt-6 rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] border-t border-white/5">
              <AboutSection />
            </div>
          </Suspense>
        </ErrorBoundary>

        {/* 2. Testimonials Segment */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96" />}>
            <div className="py-12 bg-background relative z-20 -mt-8 rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] border-t border-white/5">
              <TestimonialsSection />
            </div>
          </Suspense>
        </ErrorBoundary>

        {/* 3. Informational Regions */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96" />}>
            {/* Events Segment */}
            <div className="py-12 bg-card/30 relative z-30 -mt-8 rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] border-t border-white/5">
              <EventsSection />
            </div>

            {/* Gallery Region */}
            <div className="py-12 bg-background relative z-40 -mt-8 rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] overflow-hidden border-t border-white/5">
              <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="text-left mb-10 lg:mb-12">
                  <h2 className="text-fluid-h2 font-black text-foreground tracking-tighter uppercase">
                    THE <span className="text-primary">GALLERY.</span>
                  </h2>
                </div>
                <ImageCarousel className="max-w-7xl mx-auto" />
              </div>
              <div className="absolute top-1/2 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            </div>

            {/* Vision Segment (Kept at bottom) */}
            <div className="bg-background relative z-50 -mt-8 rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] border-t border-white/5">
              <VisionSection />
            </div>

            <div className="border-t border-white/[0.05] relative z-50">

            </div>
            <BackToTop />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Index;