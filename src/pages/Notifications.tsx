import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Calendar, ArrowLeft, RefreshCcw, Sparkles, Search, Filter, Megaphone, TrendingUp, AlertCircle, Info, ChevronRight } from "lucide-react";
import { notificationsAPI, type Notification } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/SEOHead";


// Shiksha-inspired category styling
const getCategoryStyle = (index: number) => {
  const categories = [
    { icon: Megaphone, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Announcement' },
    { icon: TrendingUp, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Update' },
    { icon: AlertCircle, color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', text: 'text-red-400', label: 'Alert' },
    { icon: Info, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Info' },
  ];
  return categories[index % categories.length];
};

const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const deepLinkId = searchParams.get('id');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getAll();
      setNotifications(data || []);

      // Mark as read when page is visited
      if (data && data.length > 0) {
        localStorage.setItem('lastSeenNotification', data[0].timestamp);
      }

      // Handle deep linking
      if (deepLinkId && data) {
        const found = data.find(n => n.id === deepLinkId);
        if (found) {
          setSelectedNotification(found);
          setIsDialogOpen(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      setNotifications([]);
      toast({
        title: "Unable to fetch notifications",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, deepLinkId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Notifications"
        description="Stay updated with the latest notifications, announcements, and important information from FeedX. Never miss important updates about your academic journey."
        keywords="feedx notifications, campus alerts, student notifications, academic announcements"
        url="/notifications"
      />
      <Navbar />

      {/* Shiksha-inspired hero section */}
      <div className="relative overflow-hidden pt-24 pb-16">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-purple-600/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
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
              <span className="text-foreground/70">Notifications</span>
            </div>

            {/* Hero content */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/30">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-foreground/60 mt-3 max-w-xl text-lg">
                    Stay informed with the latest updates, announcements, and important news from your institute.
                  </p>
                </div>
              </div>

              {/* Stats card */}
              <div className="flex gap-4">
                <div className="glass-card border-border/30 px-6 py-4 rounded-2xl bg-card/80">
                  <div className="text-3xl font-bold text-cyan-600">{notifications.length}</div>
                  <div className="text-sm text-muted-foreground">Total Updates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-4">
        <Card className="glass-card border-border/30 shadow-2xl overflow-hidden bg-card/90">
          {/* Search and filter header */}
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/30 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  All Notifications
                  <span className="text-sm font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {loading ? "..." : filteredNotifications.length}
                  </span>
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Click on any notification to view full details with markdown formatting
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-background border-border rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadNotifications}
                  className="border-border hover:bg-muted rounded-xl h-10 px-4"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="max-h-[70vh]">
              {filteredNotifications.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-6">
                    <Bell className="w-10 h-10 text-cyan-600/50" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground/80 mb-2">No notifications found</h3>
                  <p className="text-muted-foreground max-w-md">
                    {searchQuery ? `No results for "${searchQuery}"` : "New notifications will appear here when available."}
                  </p>
                </div>
              ) : (
                <div className="p-4 grid gap-3">
                  {filteredNotifications.map((notification, index) => {
                    const style = getCategoryStyle(index);
                    const IconComponent = style.icon;

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="group relative p-5 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50 
                          transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-cyan-500/5"
                      >
                        {/* Left accent */}
                        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b ${style.color}`} />

                        <div className="flex gap-4 pl-4">
                          {/* Icon */}
                          <div className={`p-3 rounded-xl ${style.bg} shrink-0`}>
                            <IconComponent className={`w-5 h-5 ${style.text}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-foreground group-hover:text-cyan-600 transition-colors line-clamp-1">
                                  {notification.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                                <Calendar className="w-4 h-4" />
                                {formatRelativeTime(notification.timestamp)}
                              </div>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                              {notification.description
                                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Remove links but keep text
                                .replace(/[#*`~_[]]/g, '') // Remove other markdown
                                .substring(0, 200)}...
                            </p>

                            {/* Read more indicator */}
                            <div className="mt-3 flex items-center gap-1 text-cyan-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Read full notification</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center gap-3 text-muted-foreground">
                        <RefreshCcw className="w-5 h-5 animate-spin" />
                        Loading notifications...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Notification detail dialog with Markdown */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-card border-border p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10 p-6 border-b border-border">
            <DialogHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold text-foreground leading-tight">
                    {selectedNotification?.title}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {selectedNotification ? new Date(selectedNotification.timestamp).toLocaleString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Content with Markdown rendering */}
          <ScrollArea className="max-h-[55vh]">
            <div className="p-6">
              {selectedNotification && (
                <MarkdownRenderer
                  content={selectedNotification.description}
                  className="text-foreground/80"
                />
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-5 border-t border-border bg-muted/30">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full border-border hover:bg-muted rounded-xl h-12"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Notifications;
