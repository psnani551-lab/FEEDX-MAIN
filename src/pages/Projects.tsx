import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ChevronDown, Bot } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { projectsIllustration } from '@/lib/illustrations';
import { projectsAPI, Project } from '@/lib/api';

const Projects = () => {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsAPI.getAll();
        setProjects(data || []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedProjectId((current) => (current === id ? null : id));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Pilot': return 'bg-blue-500';
      case 'Coming Soon': return 'bg-yellow-500';
      case 'Planning': return 'bg-slate-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Student Support': return 'bg-blue-500';
      case 'Student Feedback': return 'bg-blue-500';
      case 'Technology': return 'bg-slate-500';
      case 'Education': return 'bg-purple-500';
      case 'Innovation': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="border-b border-border bg-background pt-24 pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-6">
          <img src={projectsIllustration} alt="Projects" className="w-full max-w-md" />
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              Student Projects & Innovations
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Showcasing exceptional projects built by Polytechnic students to connect with industry clients and investors.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Projects List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center text-center text-muted-foreground py-20 bg-white/[0.02] border border-dashed rounded-3xl border-white/10">
              <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading projects...</p>
            </div>
          ) : projects.length > 0 ? (
            projects.map((project, index) => {
              const isExpanded = expandedProjectId === project.id;
              return (
                <Card
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpanded(project.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpanded(project.id);
                    }
                  }}
                  className="overflow-hidden border border-border animate-fade-in hover:shadow-sm transition-shadow cursor-pointer"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl leading-tight">{project.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{project.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={`${getCategoryColor(project.category)} text-white`}>{project.category}</Badge>
                        <Badge className={`${getStatusColor(project.status)} text-white`}>{project.status}</Badge>
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-muted-foreground">{project.description}</p>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto justify-between"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(project.id);
                        }}
                      >
                        {isExpanded ? 'Hide details' : 'View details'}
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </Button>
                      <Link
                        to="/join"
                        className="w-full sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Button className="w-full sm:w-auto bg-gradient-brand hover:opacity-90 transition-smooth">
                          Learn more
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 rounded-2xl bg-muted/40 p-4">
                        <h4 className="font-semibold mb-2">{project.title} — Details</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          {project.details.map((line: string) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
              <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Innovations Loading</h3>
              <p className="text-muted-foreground">Check back soon to explore groundbreaking student projects and investment opportunities.</p>
            </div>
          )}
        </div>

        {/* Call to Action (kept minimal for official demo readiness) */}
      </div>
      <Footer />
    </div>
  );
};

export default Projects;