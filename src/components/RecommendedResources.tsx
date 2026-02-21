import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, Lightbulb, TrendingUp } from 'lucide-react';
import { resourcesAPI, Resource as AdminResource } from '@/lib/api';
import { noDataIllustration } from '@/lib/illustrations';

interface RecommendedResourcesProps {
  weakSubjects: Array<{ subject: string; marks: number | null; grade: string }>;
  topSubjects: Array<{ subject: string; code: string; marks: number | null; grade: string }>;
}

const RecommendedResources = ({ weakSubjects, topSubjects }: RecommendedResourcesProps) => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await resourcesAPI.getAll();
        setResources(data);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const recommendedResources = useMemo(() => {
    if (resources.length === 0) return [];

    // Extract subject keywords from weak subjects
    const weakSubjectKeywords = weakSubjects.map(s => {
      const subjectName = s.subject.toLowerCase();
      // Extract key terms from subject names
      const keywords = subjectName.split(/[\s-]+/).filter(word => word.length > 2);
      return keywords;
    }).flat();

    // Score resources based on tag matches
    const scoredResources = resources.map(resource => {
      let score = 0;
      const resourceTags = resource.tags.map(tag => tag.toLowerCase());
      
      // Check if resource tags match weak subject keywords
      weakSubjectKeywords.forEach(keyword => {
        resourceTags.forEach(tag => {
          if (tag.includes(keyword) || keyword.includes(tag)) {
            score += 2; // Higher score for weak subjects
          }
        });
      });

      // Also check title and description
      const searchText = `${resource.title} ${resource.description}`.toLowerCase();
      weakSubjectKeywords.forEach(keyword => {
        if (searchText.includes(keyword)) {
          score += 1;
        }
      });

      return { resource, score };
    });

    // Return top 6 resources with score > 0, sorted by score
    return scoredResources
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.resource);
  }, [resources, weakSubjects]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Recommended Resources
          </CardTitle>
          <CardDescription>Loading personalized recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendedResources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Recommended Resources
          </CardTitle>
          <CardDescription>Resources to help you improve your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center py-8 space-y-4">
            <img src={noDataIllustration} alt="No recommendations" className="w-48 h-48 opacity-50" />
            <p className="text-muted-foreground">
              No specific recommendations available at the moment. Check out all available resources.
            </p>
            <Button 
              onClick={() => navigate('/resources')}
              className="bg-gradient-brand hover:opacity-90"
            >
              Browse All Resources
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-primary/20 bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Recommended for You
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Based on your performance analysis, these resources can help you improve
            </CardDescription>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 w-fit">
            <TrendingUp className="w-3 h-3 mr-1" />
            {recommendedResources.length} Resources
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weak Subjects Info */}
        {weakSubjects.length > 0 && (
          <div className="mb-6 p-4 bg-card/50 rounded-lg border border-border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {weakSubjects.slice(0, 3).map((subject, idx) => (
                <Badge key={idx} variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
                  {subject.subject.split(' ').slice(0, 3).join(' ')}
                  {subject.marks !== null && ` (${subject.marks})`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Resources Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedResources.map((resource, index) => (
            <Card 
              key={resource.id} 
              className="border border-border bg-card/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg group"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/resources/${resource.id}`)}
            >
              <CardHeader className="pb-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                    {resource.title}
                  </CardTitle>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 p-4 pt-0">
                {resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/50">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/50">
                        +{resource.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-brand hover:opacity-90 transition-smooth"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/resources/${resource.id}`);
                  }}
                >
                  View Resource
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-6 text-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/resources')}
            className="border-border hover:bg-card hover:border-primary/50"
          >
            View All Resources
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedResources;
