import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { MessageSquare, Shield, TrendingUp, ArrowRight, Youtube, Instagram, MessageCircle, Sparkles } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/socialLinks';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-[75vh] lg:min-h-[80vh] flex items-center overflow-hidden pt-4 lg:pt-6 pb-8 lg:pb-12"
    >
      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-7 text-left order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >

              {/* Minimalist Heading */}
              <h1 className="text-fluid-hero font-black mb-4 sm:mb-6 flex flex-wrap items-baseline gap-x-2">
                <span className="text-foreground">FEED</span>
                <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent pr-2">X.</span>
              </h1>
              <p className="text-[10px] sm:text-base font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] text-primary/80 mb-6 sm:mb-8 ml-1 opacity-90">
                Listen • Respond • Resolve
              </p>

              {/* Executive Subheading */}
              <div className="space-y-4 mb-8 lg:mb-10">
                <p className="text-lg md:text-2xl text-muted-foreground/80 max-w-2xl font-medium leading-relaxed">
                  A student community that supports <span className="text-foreground">Polytechnic learners</span> with Skills, Opportunities, and Knowledge (SOK).
                </p>
                <p className="hidden sm:block text-sm md:text-base text-muted-foreground/60 max-w-xl font-medium border-l-2 border-primary/30 pl-6 py-1">
                  <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px] block mb-2">Our Mission</span>
                  “Make student support and growth easier to access, faster to coordinate, and transparent to track.”
                </p>
              </div>

              {/* Action Block - Enhanced Anniversary Widget */}
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link to="/resources">
                    <Button size="lg" className="h-[60px] lg:h-[64px] w-full sm:w-auto px-8 bg-primary text-white hover:bg-primary/90 transition-all rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-glow group active:scale-95">
                      Start Learning
                      <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/celebrations">
                    <Button size="lg" className="h-[60px] lg:h-[64px] w-full sm:w-auto px-8 bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:opacity-90 transition-all rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_-5px_rgba(249,115,22,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(249,115,22,0.5)] group active:scale-95">
                      <Sparkles className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                      1st Year Spl
                    </Button>
                  </Link>
                </div>

                {/* Glassmorphic Social Pills */}
                <div className="flex flex-wrap items-center gap-6">
                  <SocialPill
                    href={SOCIAL_LINKS.whatsappChannel}
                    icon={<MessageCircle className="w-4 h-4 text-emerald-500" />}
                    label="WhatsApp"
                  />
                  <SocialPill
                    href={SOCIAL_LINKS.youtube}
                    icon={<Youtube className="w-4 h-4 text-red-500" />}
                    label="YouTube"
                  />
                  <SocialPill
                    href={SOCIAL_LINKS.instagram}
                    icon={<Instagram className="w-4 h-4 text-pink-500" />}
                    label="Instagram"
                  />
                </div>
              </div>


            </motion.div>
          </div>

          {/* Right Panel - Notifications Hub */}
          <div className="lg:col-span-5 order-2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full"
            >
              <div className="relative group p-1 rounded-[40px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.03] shadow-2xl">
                <NotificationsPanel />
                {/* Decorative bloom */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-colors" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* Helper for cleaner Social Pills */
const SocialPill = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <motion.a
    whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
    whileTap={{ scale: 0.98 }}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/[0.03] border-2 border-primary/30 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)] group"
  >
    <div className="scale-110">{icon}</div>
    <span className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground group-hover:text-foreground">{label}</span>
  </motion.a>
);

export default HeroSection;
