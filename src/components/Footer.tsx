import { SOCIAL_LINKS } from '@/lib/socialLinks';
import { MessageCircle, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="relative bg-background/80 backdrop-blur-xl border-t border-white/[0.08] py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20 space-y-10">
          {/* Brand */}
          <Link to="/" className="flex flex-col items-center gap-6 group" aria-label="FEEDX - Back to Homepage">
            <Logo size="xl" className="hover:scale-110 transition-transform duration-500" />
            <div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors mb-2">FEEDX</h2>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.4em] leading-none italic">Empowering Students Voice</p>
            </div>
          </Link>

          <p className="text-xl sm:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
            A career-first architecture for the next generation of <span className="text-foreground">Polytechnic excellence.</span>
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40 text-center md:text-left">
            © 2026 FEEDX • ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.08] border-2 border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all group hover:shadow-[0_0_25px_-5px_hsl(var(--primary)/0.6)] shadow-md"
    aria-label={label}
  >
    <div className="group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </a>
);

export default Footer;