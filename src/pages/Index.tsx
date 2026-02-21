import { lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import SectionDivider from '@/components/SectionDivider';
import ErrorBoundary from '@/components/ErrorBoundary';


// Lazy load non-critical sections
const ImageCarousel = lazy(() => import('@/components/ImageCarousel'));
const FeaturesSection = lazy(() => import('@/components/FeaturesSection'));
const TestimonialsSection = lazy(() => import('@/components/TestimonialsSection'));
const EventsSection = lazy(() => import('@/components/EventsSection'));
const AboutSection = lazy(() => import('@/components/AboutSection'));
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
      <Navbar />
      <main className="space-y-0">
        <HeroSection />

        {/* Progressive Loading: Split Suspense boundaries for faster perceived load */}

        {/* 1. About Segment (formerly Gallery Region) */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96" />}>
            <div className="border-t border-white/[0.05] py-20">
              <AboutSection />
            </div>
          </Suspense>
        </ErrorBoundary>


        {/* 2. Social Segment - Testimonials moved up to reduce white space */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96" />}>
            <div className="border-t border-white/[0.05] py-20">
              <TestimonialsSection />
            </div>
          </Suspense>
        </ErrorBoundary>

        {/* 3. Informational Regions */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96" />}>
            {/* Events Segment */}
            <div className="bg-card/30 border-t border-white/[0.05] py-20">
              <EventsSection />
            </div>

            {/* Gallery Region (formerly About Segment) */}
            <div className="py-20 bg-background relative overflow-hidden border-t border-white/[0.05]">
              <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="text-left mb-12">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">
                    THE <span className="text-primary">GALLERY.</span>
                  </h2>
                </div>
                <ImageCarousel className="max-w-7xl mx-auto" />
              </div>
              <div className="absolute top-1/2 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            </div>

            <div className="border-t border-white/[0.05]">
              <Footer />
            </div>
            <BackToTop />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Index;