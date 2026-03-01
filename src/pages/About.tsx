import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AboutSection from "@/components/AboutSection";
import { Button } from "@/components/ui/button";

import { SEOHead } from "@/components/SEOHead";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Us"
        description="Learn about FeedX's vision to empower polytechnic students beyond the classroom with real-world skills and career opportunities."
        keywords="about feedx, polytechnic education, student empowerment, telangana polytechnic"
      />

      {/* Premium Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden border-b border-white/[0.05]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 blur-3xl" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <motion.div
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary uppercase tracking-widest">Our Vision</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tighter uppercase leading-[0.9] mb-8">
              BEYOND THE <span className="text-primary">CLASSROOM.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
              FeedX is more than a platform—it's a launchpad for Polytechnic excellence. We empower the next generation of industrial leaders with real-world skills and career-defining opportunities.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-0">
        <AboutSection />
      </div>


    </div>
  );
};

export default About;
