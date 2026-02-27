import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ExternalLink, Search, BookOpen, Award, Users, Briefcase, FileText, GraduationCap, ClipboardList, ChevronRight, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';
import { noDataIllustration, resourcesIllustration } from '@/lib/illustrations';
import { resourcesAPI, Resource as AdminResource } from '@/lib/api';

const Resources = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [adminResources, setAdminResources] = useState<AdminResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const fetchAdminResources = async () => {
      try {
        const data = await resourcesAPI.getAll();
        setAdminResources(data);
      } catch (error) {
        console.error('Failed to fetch admin resources:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminResources();
  }, []);

  const internalResources = useMemo(
    () => [
      {
        id: 'ecet-syllabus',
        title: 'ECET Syllabus',
        description: 'Interactive breakdown of topics for ECET aspirants.',
        category: 'Exams',
        type: 'Interactive',
        href: '/syllabus',
        icon: <BookOpen className="w-5 h-5" />,
        isInternal: true,
      },
      {
        id: 'ecet-tests',
        title: 'Subject-wise Tests',
        description: 'Practice quizzes with real-time scoring and answer reveal.',
        category: 'Exams',
        type: 'Interactive',
        href: '/tests',
        icon: <ClipboardList className="w-5 h-5" />,
        isInternal: true,
      },
      {
        id: 'ecet-papers',
        title: 'Previous Papers',
        description: 'Download and practice with official previous year question papers.',
        category: 'Exams',
        type: 'Interactive',
        href: '/papers',
        icon: <FileText className="w-5 h-5" />,
        isInternal: true,
      },
    ],
    []
  );

  const filteredInternalResources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return internalResources;
    return internalResources.filter((r) => {
      const hay = `${r.title} ${r.description} ${r.category} ${r.type}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, internalResources]);

  const filteredAdminResources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return adminResources;
    return adminResources.filter((r) => {
      const tagsString = r.tags.join(' ').toLowerCase();
      const hay = `${r.title} ${r.description} ${r.longDescription} ${tagsString}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, adminResources]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training': return 'bg-blue-500';
      case 'Projects': return 'bg-green-500';
      case 'Official': return 'bg-red-500';
      case 'Career': return 'bg-purple-500';
      case 'Exams': return 'bg-orange-500';
      case 'Information': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative border-b border-border bg-background pt-24 pb-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 opacity-80 blur-2xl" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center gap-6">
            <img
              src={resourcesIllustration}
              alt="Resources"
              className="w-full max-w-md animate-float"
              decoding="async"
            />
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-gradient">
                Resources & Materials
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Access study materials, guides, tools, and important links to support your academic journey
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Resources Grid */}
        <div className="space-y-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
              <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-widest">
                Accessing Resource Registry...
              </p>
            </div>
          ) : (
            <>
              {/* Internal / Interactive Resources */}
              {filteredInternalResources.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-8">ECET Interactive Portal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInternalResources.map((resource, index) => (
                      <Card
                        key={resource.id}
                        className="border border-border transition-all duration-300 animate-fade-in hover:shadow-md cursor-pointer group"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => {
                          if ('isInternal' in resource && resource.isInternal) {
                            navigate(resource.href);
                          } else {
                            window.open(resource.href, '_blank');
                          }
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-gradient-brand text-white text-xs px-3">
                              {'type' in resource ? resource.type : 'Resource'}
                            </Badge>
                            <div className="text-primary opacity-50 group-hover:opacity-100 transition-opacity">
                              {'icon' in resource ? resource.icon : <FileText className="w-5 h-5" />}
                            </div>
                          </div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full bg-gradient-brand hover:opacity-90 transition-smooth">
                            {'isInternal' in resource && resource.isInternal ? "Open Interactive" : "Visit Link"}
                            {'isInternal' in resource && resource.isInternal ? <ChevronRight className="w-4 h-4 ml-2" /> : <ExternalLink className="w-4 h-4 ml-2" />}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Resources */}
              {filteredAdminResources.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-8">Subject-wise Materials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(query.trim() ? filteredAdminResources : filteredAdminResources.slice(0, 9)).map((resource, index) => (
                      <Card key={resource.id} className="border border-border transition-all duration-300 animate-fade-in hover:shadow-md cursor-pointer group" style={{ animationDelay: `${index * 0.1}s` }} onClick={() => navigate(`/resources/${resource.id}`)}>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-xs px-3">
                              {resource.tags[0] || 'Resource'}
                            </Badge>
                            <div className="text-primary opacity-50 group-hover:opacity-100 transition-opacity">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          </div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-smooth">
                            View Details
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredAdminResources.length === 0 && filteredInternalResources.length === 0 && (
                <div className="col-span-full flex flex-col items-center text-center text-muted-foreground space-y-4 py-12">
                  <img src={noDataIllustration} alt="No results" className="w-full max-w-md" />
                  <p>No resources found matching "{query}"</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Call to Action */}
        {(filteredAdminResources.length > 0 || filteredInternalResources.length > 0) && (
          <div className="text-center mt-20">
            <Card className="max-w-2xl mx-auto glass-card border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Need Help Finding Resources?</h2>
                <p className="text-muted-foreground mb-6">
                  Can't find what you're looking for? Let us know what resources you need,
                  and we'll help you find the right materials for your branch and semester.
                </p>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-brand hover:opacity-90 transition-smooth glow-primary"
                    onClick={() => {
                      import('sonner').then(({ toast }) => {
                        toast.info("Please contact feedxhub@gmail.com for resource requests. Please check ur spam folder too.");
                      });
                    }}
                  >
                    Request Resource
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Resources;