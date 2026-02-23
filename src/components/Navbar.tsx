import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronRight, Bot } from 'lucide-react';
import { useState } from 'react';
import Logo from '@/components/Logo';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-background/80 backdrop-blur-3xl shadow-2xl transition-all duration-500">
      <div className="mx-auto w-[95%] max-w-[1440px]">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center space-x-3 group">
            <Logo className="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem]" size="md" />
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tighter text-foreground leading-none">FEEDX</h1>
            </div>
          </Link>

          {/* Desktop Navigation Links - Center */}
          <div className="hidden lg:flex items-center space-x-5 ml-4">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About" },
              { to: "/updates", label: "Updates" },
              { to: "/projects", label: "Projects" },
              { to: "/resources", label: "Resources" },
              { to: "/institute-profile", label: "Institute Profile" },
              { to: "/student-analytics", label: "Analytics" },
              { to: "/spotlight", label: "Spotlight" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 hover:text-primary transition-all duration-300 whitespace-nowrap relative group py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full opacity-50" />
              </Link>
            ))}

            {/* External Predictor Link */}
            <a
              href="https://collegeinfo.diplomageeks.com/predictor/telangana-polycet/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 hover:text-primary transition-all duration-300 whitespace-nowrap relative group py-2"
            >
              Predictor
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full opacity-50" />
            </a>

            <div className="relative group">
              <button
                className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 hover:text-primary transition-all flex items-center gap-1.5 py-2"
                aria-haspopup="true"
                aria-expanded="false"
                aria-label="More navigation links"
              >
                More
                <ChevronRight className="w-3.5 h-3.5 rotate-90 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-card/95 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-50 p-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <Link to="/syllabus" className="relative block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.03] hover:text-primary rounded-xl transition-all">ECET Syllabus</Link>
                <Link to="/tests" className="relative block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.03] hover:text-primary rounded-xl transition-all">ECET Mock Tests</Link>
                <Link to="/papers" className="relative block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.03] hover:text-primary rounded-xl transition-all">Previous Papers</Link>
              </div>
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-5 flex-shrink-0 ml-auto pl-4 border-l border-white/[0.08] h-10 my-auto">
            {/* FXBOT Button - Desktop */}
            <Link to={localStorage.getItem("student_session") ? "/student/menu" : "/student/auth"} className="hidden lg:block">
              <Button size="sm" className="magnetic-glow bg-blue-600/10 text-blue-500 border-2 border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all duration-500 rounded-full px-6 font-black tracking-widest gap-2">
                <img src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`} alt="FXBOT" className="w-5 h-5 rounded-sm object-cover" />
                FXBOT
              </Button>
            </Link>

            {/* Join Us Button - Desktop */}
            <Link to="/join" className="hidden lg:block">
              <Button size="sm" className="magnetic-glow bg-gradient-to-r from-primary to-primary/80 text-white hover:shadow-[0_0_20px_rgba(45,185,214,0.3)] hover:scale-105 active:scale-95 transition-all duration-500 rounded-full px-8 font-black tracking-widest border-0">
                JOIN US
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-foreground/80 hover:text-primary transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-10 overflow-y-auto">
          <div className="space-y-4">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About" },
              { to: "/updates", label: "Updates" },
              { to: "/projects", label: "Projects" },
              { to: "/resources", label: "Resources" },
              { to: "/institute-profile", label: "Institute Profile" },
              { to: "/student-analytics", label: "Analytics" },
              { to: "/spotlight", label: "Spotlight" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-2xl font-black uppercase tracking-tighter text-foreground hover:text-primary transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <Link to={localStorage.getItem("student_session") ? "/student/menu" : "/student/auth"} onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black tracking-widest text-lg gap-3">
                <img src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`} alt="FXBOT" className="w-6 h-6 rounded-md object-cover" />
                FXBOT PORTAL
              </Button>
            </Link>
            <Link to="/join" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-14 bg-primary text-white rounded-2xl font-black tracking-widest text-lg">
                JOIN US
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;