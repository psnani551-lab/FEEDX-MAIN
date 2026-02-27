import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import { Button } from "@/components/ui/button";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">

      {/* Premium Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden border-b border-white/[0.05]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 blur-3xl" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2 text-foreground/70 hover:text-foreground hover:bg-foreground/10 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <span className="text-foreground/30">/</span>
            <span className="text-foreground/70">About</span>
          </div>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary uppercase tracking-widest">Our Story</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tighter uppercase leading-[0.9] mb-8">
              ABOUT <span className="text-primary">FEEDX.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
              Empowering Polytechnic students with the skills, opportunities, and knowledge to transform their careers and shape the future of industry.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-0">
        <AboutSection />
      </div>

      <Footer />
    </div>
  );
};

export default About;
