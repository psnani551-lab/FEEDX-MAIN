import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, BarChart2, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/resources' },
        { icon: BarChart2, label: 'Results', path: '/analytics' },
        { icon: Bell, label: 'Alerts', path: '/notifications' },
        { icon: User, label: 'Admin', path: '/admin' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                            isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-xl transition-all duration-300",
                            isActive ? "bg-primary/10 text-primary" : ""
                        )}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default MobileNav;
