import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, Newspaper, BookOpen, Calendar, Sparkles, MessageSquare,
    Building2, Users, Activity, LogOut, ChevronRight, Menu, X,
    LayoutDashboard, Database, ShieldAlert, FileText, Settings, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area"; // Removed directly
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { notificationsAPI, authAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "./ErrorBoundary";
import Logo from "./Logo";
import { PreloadLink } from "./PreloadLink";
import {
    AdminPanel, AddNotification, AddUpdate, AddResource, AddEvent,
    AddGallery, AddProject, AddSpotlight, AddTestimonial, AddInstitute,
    UserManagement, LoginLogs
} from "@/App";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, route: "/admin", preload: AdminPanel.preload },
    { id: "notifications", title: "Notifications", icon: Bell, route: "/admin/notifications", preload: AddNotification.preload },
    { id: "updates", title: "Updates", icon: Newspaper, route: "/admin/updates", preload: AddUpdate.preload },
    { id: "resources", title: "Resources", icon: BookOpen, route: "/admin/resources", preload: AddResource.preload },
    { id: "events", title: "Events", icon: Calendar, route: "/admin/events", preload: AddEvent.preload },
    { id: "gallery", title: "Gallery", icon: Image, route: "/admin/gallery", preload: AddGallery.preload },
    { id: "projects", title: "Projects", icon: Sparkles, route: "/admin/projects", preload: AddProject.preload },
    { id: "spotlight", title: "Spotlight", icon: Sparkles, route: "/admin/spotlight", preload: AddSpotlight.preload },
    { id: "testimonials", title: "Testimonials", icon: MessageSquare, route: "/admin/testimonials", preload: AddTestimonial.preload },
    { id: "institutes", title: "Institutes", icon: Building2, route: "/admin/institutes", preload: AddInstitute.preload },

    { id: "users", title: "Admin Users", icon: Users, route: "/admin/users", preload: UserManagement.preload },
    { id: "logs", title: "System Logs", icon: ShieldAlert, route: "/admin/logs", preload: LoginLogs.preload },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            navigate('/admin-login');
        }
    }, [isAuthenticated, isAuthLoading, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            toast({ title: 'Logged Out', description: 'Success' });
            navigate('/admin-login');
        } catch (error) {
            toast({ title: 'Logout Failed', variant: 'destructive' });
        }
    };

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            await authAPI.downloadBackup();
            toast({ title: "Backup Successful", description: "All data exported to JSON." });
        } catch (error) {
            toast({ title: "Backup Failed", variant: "destructive" });
        } finally {
            setIsBackingUp(false);
        }
    };

    const getBreadcrumbs = () => {
        const paths = location.pathname.split("/").filter(Boolean);
        return paths.map((path, index) => ({
            name: path.charAt(0).toUpperCase() + path.slice(1),
            href: "/" + paths.slice(0, index + 1).join("/"),
            isLast: index === paths.length - 1
        }));
    };

    // Sidebar Content (Inlined for performance)
    const sidebar = (
        <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl border-r border-white/5">
            <div className="p-4 border-b border-white/5">
                <Link to="/" className="flex items-center gap-2">
                    <Logo size="sm" admin />
                    <span className="font-black tracking-tighter text-lg">FEEDX <span className="text-primary">ADMIN.</span></span>
                </Link>
            </div>

            {/* Optimized spacing - no empty space */}
            <div className="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
                <div className="px-3 pt-3 pb-1">
                    <div className="space-y-0.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.route;
                            return (
                                <PreloadLink key={item.id} to={item.route} preload={item.preload}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={`w-full justify-start gap-2.5 rounded-lg h-10 transition-all focus-glow hover:scale-[1.01] ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'text-muted-foreground hover:bg-white/5'}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span className="font-semibold text-xs">{item.title}</span>
                                    </Button>
                                </PreloadLink>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-3 pt-2 border-t border-white/5 space-y-1">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2.5 border-white/5 hover:bg-white/5 h-10 transition-all duration-300"
                    onClick={handleBackup}
                    disabled={isBackingUp}
                >
                    <Database className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-pulse text-primary' : ''}`} />
                    <span className="text-xs">Download Backup</span>
                </Button>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2.5 border-white/5 hover:bg-white/5 h-10 transition-all duration-300 group"
                    onClick={async () => {
                        // Keep admin tokens to prevent unintended logout, but clear everything else
                        const token = localStorage.getItem('adminToken');
                        const user = localStorage.getItem('adminUser');
                        localStorage.clear();
                        if (token) localStorage.setItem('adminToken', token);
                        if (user) localStorage.setItem('adminUser', user);

                        toast({ title: "Cache Purged", description: "System memory cleared successfully." });
                        setTimeout(() => window.location.reload(), 800);
                    }}
                >
                    <Sparkles className="w-3.5 h-3.5 text-primary group-hover:animate-pulse" />
                    <span className="text-xs">Purge Cache</span>
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 h-10 transition-all duration-300"
                    onClick={handleLogout}
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-xs">Logout</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 fixed inset-y-0 z-50">
                {sidebar}
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-72 flex flex-col">
                {/* Top Header */}
                <header className="h-16 border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-md z-40 flex items-center px-6 justify-between">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden h-12 w-12 rounded-xl hover:bg-white/5 active:scale-90 transition-all">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72">
                                {sidebar}
                            </SheetContent>
                        </Sheet>

                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {getBreadcrumbs().map((crumb, i) => (
                                <div key={crumb.href} className="flex items-center gap-2">
                                    <Link
                                        to={crumb.href}
                                        className={`hover:text-foreground transition-colors ${crumb.isLast ? 'text-primary' : ''}`}
                                    >
                                        {crumb.name}
                                    </Link>
                                    {!crumb.isLast && <ChevronRight className="w-3 h-3 text-muted-foreground/30" />}
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-bold">{user?.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Administrator</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border border-primary/20 flex items-center justify-center font-bold text-primary">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 lg:p-10 max-w-7xl relative overflow-x-hidden scroll-optimize">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="min-h-full"
                        >
                            <ErrorBoundary>
                                {children}
                            </ErrorBoundary>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
