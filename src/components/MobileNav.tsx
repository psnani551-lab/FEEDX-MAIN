import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, BarChart2, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/resources' },
        {
            isFXBot: true,
            label: 'FXBot',
            path: localStorage.getItem("student_session") ? "/student/menu" : "/student/auth"
        },
        { icon: Bell, label: 'Alerts', path: '/notifications' },
        { icon: BarChart2, label: 'RESULTS', path: '/student-analytics' },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-background/60 backdrop-blur-2xl border border-white/10 px-4 py-3 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                    <button
                        key={item.path}
                        onClick={() => {
                            if (navigator.vibrate) navigator.vibrate(10); // Haptic feel
                            navigate(item.path);
                        }}
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-1 transition-all duration-500 min-w-[64px] h-12",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                        aria-label={item.label}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="mobile-nav-pill"
                                className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                            />
                        )}
                        <motion.div
                            animate={isActive ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {item.isFXBot ? (
                                <div className={cn(
                                    "relative -mt-10 mb-1 w-16 h-16 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-[0_12px_40px_rgba(37,99,235,0.45)]",
                                    isActive ? "border-primary scale-110 shadow-[0_0_40px_rgba(45,185,214,0.6)]" : "border-white/10 opacity-95"
                                )}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-white/20" />
                                    <img
                                        src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`}
                                        alt="FXBOT"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <item.icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                            )}
                        </motion.div>
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300",
                            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                        )}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default MobileNav;
