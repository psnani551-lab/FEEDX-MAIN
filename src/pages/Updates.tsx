import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Info, BookOpen, Award, Share2, Download, Clock, X, FileText, Sparkles, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { noDataIllustration, updatesIllustration } from '@/lib/illustrations';
import { updatesAPI, Update } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';


const Updates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const data = await updatesAPI.getAll();
        console.log('Fetched updates:', data);
        setUpdates(data || []);
      } catch (error) {
        console.error('Failed to fetch updates:', error);
        setUpdates([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <BookOpen className="w-5 h-5" />;
      case 'circular': return <Info className="w-5 h-5" />;
      case 'result': return <Award className="w-5 h-5" />;
      case 'announcement': return <Bell className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-rose-500 to-red-600';
      case 'medium': return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'low': return 'bg-gradient-to-r from-emerald-500 to-green-600';
      default: return 'bg-gradient-to-r from-slate-500 to-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'from-blue-500 to-cyan-600';
      case 'circular': return 'from-purple-500 to-indigo-600';
      case 'result': return 'from-green-500 to-emerald-600';
      case 'announcement': return 'from-orange-500 to-amber-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const handleShare = async (updateId: string) => {
    const url = `${window.location.origin}/updates#${updateId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Update link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Premium Header with Gradient */}
      <div className="relative border-b border-white/5 bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-16 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mb-8 backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all"
            >
              ← Back
            </Button>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Live Updates</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Latest Updates
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Stay informed with the latest announcements, exam schedules, and important notifications
              </p>
            </motion.div>

            <motion.img
              src={updatesIllustration}
              alt="Updates"
              className="w-full max-w-md drop-shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Updates List */}
        <div className="max-w-5xl mx-auto space-y-6">
          {updates.length === 0 ? (
            <motion.div
              className="flex flex-col items-center text-center text-muted-foreground space-y-6 py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img src={noDataIllustration} alt="No updates" className="w-full max-w-md opacity-60" />
              <div>
                <h3 className="text-2xl font-bold mb-2">No updates available</h3>
                <p className="text-muted-foreground">Check back later for new announcements</p>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {updates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className={`group relative overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${index === 0
                    ? 'border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background'
                    : 'border-white/10 bg-card/40 backdrop-blur-sm hover:border-primary/30'
                    }`}>
                    {/* Shimmer Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </div>

                    {index === 0 && (
                      <div className="bg-gradient-to-r from-primary via-primary to-accent text-white text-xs font-black px-4 py-2 flex items-center gap-2 shadow-lg">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span className="tracking-widest">MOST RECENT</span>
                        <Sparkles className="w-3.5 h-3.5 ml-auto" />
                      </div>
                    )}

                    <CardContent className="pt-8 pb-6 relative z-10">
                      <div className="flex items-start justify-between gap-6 mb-6">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Premium Icon with Gradient */}
                          <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${getTypeColor(update.type || 'announcement')} text-white shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
                            <div className="relative">
                              {getTypeIcon(update.type || 'announcement')}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors">
                              {update.title || 'Untitled'}
                            </h3>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <Badge variant="outline" className="border-white/20 bg-white/5 backdrop-blur-sm font-semibold">
                                {update.category || 'General'}
                              </Badge>
                              <span className="opacity-50">•</span>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-medium">{formatDate(update.timestamp)}</span>
                              </div>
                            </div>

                            <p className="text-muted-foreground leading-relaxed line-clamp-2">
                              {update.description || 'No description available'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Badge className={`${getPriorityColor(update.priority || 'medium')} text-white border-0 shadow-lg px-3 py-1 font-black tracking-wider`}>
                            {(update.priority || 'medium').toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setSelectedUpdate(update)}
                          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold"
                        >
                          Read More
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(update.id)}
                          className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 font-semibold"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Premium Detailed View Modal */}
      <AnimatePresence>
        {selectedUpdate && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUpdate(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Card
                className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-white/10 bg-card/95 backdrop-blur-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-white/10 z-10 shadow-lg">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${getTypeColor(selectedUpdate.type || 'announcement')} text-white shadow-xl flex-shrink-0`}>
                        {getTypeIcon(selectedUpdate.type || 'announcement')}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-black tracking-tight mb-2">
                          {selectedUpdate.title}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="outline" className="border-white/20 bg-white/5">
                            {selectedUpdate.category || 'General'}
                          </Badge>
                          <span>•</span>
                          <span className="font-medium">{formatDate(selectedUpdate.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedUpdate(null)}
                      className="hover:bg-white/10 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-8 space-y-8">
                  <div className="flex gap-3">
                    <Badge className={`${getPriorityColor(selectedUpdate.priority || 'medium')} text-white border-0 shadow-lg font-black`}>
                      {(selectedUpdate.priority || 'medium').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 bg-white/5 backdrop-blur-sm font-semibold capitalize">
                      {selectedUpdate.type || 'announcement'}
                    </Badge>
                  </div>

                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <MarkdownRenderer content={selectedUpdate.description || '*No description available.*'} />
                  </div>

                  {/* Images */}
                  {selectedUpdate.images && selectedUpdate.images.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Attached Images
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUpdate.images.map((img, idx) => (
                          <motion.img
                            key={idx}
                            src={img}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-auto rounded-2xl border border-white/10 cursor-pointer hover:scale-105 transition-transform duration-300 shadow-xl"
                            onClick={() => window.open(img, '_blank')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files */}
                  {selectedUpdate.files && selectedUpdate.files.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Attached Files
                      </h4>
                      <div className="space-y-3">
                        {selectedUpdate.files.map((file, idx) => {
                          const fileName = file.split('/').pop() || `file-${idx + 1}`;
                          const extension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
                          return (
                            <motion.div
                              key={idx}
                              className="flex items-center justify-between p-4 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group"
                              onClick={() => window.open(file, '_blank')}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                  <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{fileName}</p>
                                  <Badge variant="secondary" className="text-xs mt-1 font-black">{extension}</Badge>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="group-hover:bg-primary/10">
                                <Download className="w-5 h-5" />
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 border-t border-white/10">
                    <Button
                      variant="default"
                      onClick={() => handleShare(selectedUpdate.id)}
                      className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default Updates;