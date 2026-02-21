import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction, Rocket, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const UnderDevelopment = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="flex items-center justify-center px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Main Content */}
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 animate-slide-up">
            New Features Coming Soon!
          </h1>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
            We're working on exciting new student-support features for FEEDX.
            These updates will help with knowledge sharing and guidance for students.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-scale-in">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">Knowledge Sharing</span>
            <span className="bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">Guidance</span>
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">Feedback Sharing</span>
            <span className="bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">WhatsApp Integration</span>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
            <Link to="/">
              <Button size="lg" className="bg-gradient-brand hover:opacity-90 transition-smooth group">
                <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>
            </Link>
            <Link to="/subscribe">
              <Button size="lg" variant="outline" className="hover-lift">
                Notify Me When Ready
              </Button>
            </Link>
          </div>

          {/* Removed placeholder progress percentage */}
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopment;