import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ── NAVBAR BAR ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-[90] border-b border-white/[0.08] bg-background/80 backdrop-blur-3xl shadow-2xl">
        <div className="mx-auto w-[95%] max-w-[1440px]">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Logo */}
            <Link to="/" onClick={closeMenu} className="flex items-center space-x-3 group">
              <Logo className="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem]" size="md" />
              <div className="hidden sm:block">
                <h1 className="text-2xl font-black tracking-tighter text-foreground leading-none">FEEDX</h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-5 ml-4">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/updates', label: 'Updates' },
                { to: '/projects', label: 'Projects' },
                { to: '/resources', label: 'Resources' },
                { to: '/institute-profile', label: 'Institute Profile' },
                { to: '/student-analytics', label: 'Analytics' },
                { to: '/spotlight', label: 'Spotlight' },
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

              {/* More Dropdown */}
              <div className="relative group">
                <button
                  className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 hover:text-primary transition-all flex items-center gap-1.5 py-2"
                  aria-haspopup="true"
                  aria-label="More navigation links"
                >
                  More
                  <ChevronRight className="w-3.5 h-3.5 rotate-90 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-card/95 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-50 p-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-2xl" />
                  <Link to="/syllabus" className="relative block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.03] hover:text-primary rounded-xl transition-all">ECET Syllabus</Link>
                  <Link to="/tests" className="relative block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.03] hover:text-primary rounded-xl transition-all">ECET Mock Tests</Link>
                  <Link to="/papers" className="relative block px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.03] hover:text-primary rounded-xl transition-all">Previous Papers</Link>
                </div>
              </div>
            </div>

            {/* Right Side — Desktop CTAs + Hamburger */}
            <div className="flex items-center gap-3 sm:gap-5 ml-auto pl-4 border-l border-white/[0.08]">
              {/* Desktop: FXBOT */}
              <Link to={localStorage.getItem('student_session') ? '/student/menu' : '/student/auth'} className="hidden lg:block">
                <Button size="sm" className="magnetic-glow bg-blue-600/10 text-blue-500 border-2 border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all duration-500 rounded-full px-6 font-black tracking-widest gap-2">
                  <img src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`} alt="FXBOT" className="w-5 h-5 rounded-sm object-cover" />
                  FXBOT
                </Button>
              </Link>

              {/* Desktop: Join Us */}
              <Link to="/join" className="hidden lg:block">
                <Button size="sm" className="magnetic-glow bg-gradient-to-r from-primary to-primary/80 text-white hover:shadow-[0_0_20px_rgba(45,185,214,0.3)] hover:scale-105 active:scale-95 transition-all duration-500 rounded-full px-8 font-black tracking-widest border-0">
                  JOIN US
                </Button>
              </Link>

              {/* ── NEW HAMBURGER BUTTON ── */}
              <button
                id="hamburger-btn"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="lg:hidden relative z-[110] flex flex-col justify-center items-center w-10 h-10 rounded-xl focus:outline-none"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                <span
                  className={`block w-6 h-[2px] rounded-full bg-foreground transition-all duration-300 origin-center ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
                />
                <span
                  className={`block w-6 h-[2px] rounded-full bg-foreground transition-all duration-300 mt-[5px] ${menuOpen ? 'opacity-0 scale-x-0' : ''}`}
                />
                <span
                  className={`block w-6 h-[2px] rounded-full bg-foreground transition-all duration-300 mt-[5px] origin-center ${menuOpen ? '-translate-y-[7px] -rotate-45 -mt-[9px]' : ''}`}
                />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU OVERLAY ────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-nav-overlay"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="lg:hidden fixed inset-0 z-[100] flex flex-col"
            style={{ backgroundColor: '#050A14' }}
          >
            {/* Glow Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(45,185,214,0.08) 0%, transparent 70%)' }} />
              <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />
            </div>

            {/* TOP BAR (mirrors the navbar) */}
            <div className="flex items-center justify-between w-[95%] mx-auto h-16 sm:h-20 border-b border-white/[0.06] relative z-10">
              <Link to="/" onClick={closeMenu} className="flex items-center space-x-2">
                <Logo className="w-12 h-12" size="md" />
                <span className="text-xl font-black tracking-tighter text-white">FEEDX</span>
              </Link>
              {/* Close X button */}
              <button
                onClick={closeMenu}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="2" x2="14" y2="14" />
                  <line x1="14" y1="2" x2="2" y2="14" />
                </svg>
              </button>
            </div>

            {/* NAV LINKS */}
            <div className="flex-1 overflow-y-auto px-[5%] py-6 relative z-10">

              {/* Primary links */}
              <div className="space-y-1 mb-6">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/updates', label: 'Updates' },
                  { to: '/projects', label: 'Projects' },
                  { to: '/resources', label: 'Resources' },
                  { to: '/institute-profile', label: 'Institute Profile' },
                  { to: '/student-analytics', label: 'Analytics' },
                  { to: '/spotlight', label: 'Spotlight' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMenu}
                    className="flex items-center justify-between py-4 border-b border-white/[0.05] group"
                  >
                    <span className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors duration-200">
                      {link.label}
                    </span>
                    <span className="text-white/20 group-hover:text-primary transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </Link>
                ))}

                {/* Predictor — external */}
                <a
                  href="https://collegeinfo.diplomageeks.com/predictor/telangana-polycet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="flex items-center justify-between py-4 border-b border-white/[0.05] group"
                >
                  <span className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors duration-200">
                    Predictor
                  </span>
                  <span className="text-xs font-bold tracking-widest text-white/30 group-hover:text-primary transition-colors">↗</span>
                </a>
              </div>

              {/* More sub-section */}
              <div className="mb-8">
                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/25 mb-3">More</p>
                <div className="space-y-1">
                  <Link to="/syllabus" onClick={closeMenu} className="flex items-center justify-between py-3 border-b border-white/[0.04] group">
                    <span className="text-lg font-bold uppercase tracking-tight text-white/60 group-hover:text-primary transition-colors">ECET Syllabus</span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                  </Link>
                  <Link to="/tests" onClick={closeMenu} className="flex items-center justify-between py-3 border-b border-white/[0.04] group">
                    <span className="text-lg font-bold uppercase tracking-tight text-white/60 group-hover:text-primary transition-colors">ECET Mock Tests</span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                  </Link>
                  <Link to="/papers" onClick={closeMenu} className="flex items-center justify-between py-3 group">
                    <span className="text-lg font-bold uppercase tracking-tight text-white/60 group-hover:text-primary transition-colors">Previous Papers</span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link to={localStorage.getItem('student_session') ? '/student/menu' : '/student/auth'} onClick={closeMenu}>
                  <button className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-black tracking-widest text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40">
                    <img src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`} alt="FXBOT" className="w-7 h-7 rounded-lg object-cover" />
                    FXBOT PORTAL
                  </button>
                </Link>
                <Link to="/join" onClick={closeMenu}>
                  <button className="w-full h-14 bg-gradient-to-r from-primary to-primary/80 active:scale-[0.98] text-white rounded-2xl font-black tracking-widest text-base transition-all mt-3 shadow-xl shadow-primary/20">
                    JOIN US
                  </button>
                </Link>
              </div>
            </div>

            {/* Footer Branding */}
            <div className="px-[5%] py-5 border-t border-white/[0.06] relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/20">© FeedX 2024</p>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;