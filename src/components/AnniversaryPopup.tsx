import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CelebrationEffects from './CelebrationEffects';

const AnniversaryPopup = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // show on first load per session
    const seen = sessionStorage.getItem('anniv_shown');
    if (!seen) {
      setShow(true);
      sessionStorage.setItem('anniv_shown', '1');
    }
  }, []);

  // Handle scroll lock for navbar visibility
  useEffect(() => {
    if (show) {
      document.body.setAttribute('data-scroll-locked', 'true');
    } else {
      document.body.removeAttribute('data-scroll-locked');
    }
    return () => document.body.removeAttribute('data-scroll-locked');
  }, [show]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShow(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-start sm:justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            className="relative w-full max-w-md bg-card border-none rounded-2xl overflow-hidden shadow-2xl my-auto max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Fixed relative to the popup card */}
            <button
              aria-label="Close"
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-muted/80 hover:bg-muted text-foreground transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="overflow-y-auto w-full">
              {/* Celebration Header Decor */}
              <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-primary p-1">
                <div className="bg-background w-full h-full rounded-t-xl" />
              </div>

              <div className="flex flex-col items-center text-center p-6">
                {/* Animated Icon or Image */}
                <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-400/20 animate-pulse" />
                  <span className="text-3xl">🎉</span>
                </div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                  FEEDX turns 1!
                </h2>

                <p className="text-sm text-muted-foreground mb-5 px-2">
                  Celebrating one year of listening, responding, and resolving. Thank you for being part of our journey.
                </p>

                {/* Special Image - Proportionally scaled */}
                <div className="relative rounded-xl overflow-hidden mb-4 bg-muted/30 border border-white/10">
                  <img
                    src={`${import.meta.env.BASE_URL}images/1stanniversary.jpg`}
                    alt="1st Anniversary"
                    className="w-full h-auto object-contain max-h-[50vh]"
                  />
                </div>

                {/* Action button removed as requested */}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnniversaryPopup;
