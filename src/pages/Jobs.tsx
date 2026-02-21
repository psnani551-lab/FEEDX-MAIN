import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, MapPin, Clock, DollarSign, Building, Search, Filter, BookmarkPlus, ExternalLink } from 'lucide-react';
import GlassmorphismBackground from '@/components/GlassmorphismBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Jobs = () => {
  const jobs = [
    {
      id: 1,
      title: "Junior Electrical Engineer",
      company: "TCS Engineering Services",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      salary: "₹3.5-4.5 LPA",
      experience: "0-2 years",
      posted: "2 days ago",
      urgent: true,
      description: "Looking for fresh diploma graduates in Electrical Engineering. Training provided.",
      skills: ["AutoCAD", "Electrical Design", "PLC Programming"],
      category: "Engineering"
    },
    {
      id: 2,
      title: "Mechanical Design Engineer",
      company: "L&T Construction",
      location: "Secunderabad, Telangana",
      type: "Full-time",
      salary: "₹4-5 LPA",
      experience: "1-3 years",
      posted: "1 week ago",
      urgent: false,
      description: "Design and develop mechanical systems for construction projects.",
      skills: ["SolidWorks", "AutoCAD", "Mechanical Design"],
      category: "Engineering"
    },
    {
      id: 3,
      title: "Civil Engineering Technician",
      company: "GVK Infrastructure",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      salary: "₹3-4 LPA",
      experience: "0-2 years",
      posted: "3 days ago",
      urgent: true,
      description: "Site supervision and quality control for infrastructure projects.",
      skills: ["Site Management", "Quality Control", "AutoCAD Civil"],
      category: "Engineering"
    },
    {
      id: 4,
      title: "IT Support Technician",
      company: "Tech Mahindra",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      salary: "₹2.5-3.5 LPA",
      experience: "0-1 year",
      posted: "5 days ago",
      urgent: false,
      description: "Provide technical support and maintain IT infrastructure.",
      skills: ["Hardware Support", "Networking", "Windows/Linux"],
      category: "IT"
    },
    {
      id: 5,
      title: "Quality Control Inspector",
      company: "Dr. Reddy's Laboratories",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      salary: "₹3-4 LPA",
      experience: "1-2 years",
      posted: "1 week ago",
      urgent: false,
      description: "Quality inspection and testing of pharmaceutical products.",
      skills: ["Quality Control", "Documentation", "Lab Testing"],
      category: "Pharmaceutical"
    },
    {
      id: 6,
      title: "Production Supervisor",
      company: "Tata Steel",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      salary: "₹4-6 LPA",
      experience: "2-4 years",
      posted: "4 days ago",
      urgent: true,
      description: "Supervise manufacturing operations and ensure quality standards.",
      skills: ["Production Management", "Quality Assurance", "Team Leadership"],
      category: "Manufacturing"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Engineering': return 'bg-blue-500';
      case 'IT': return 'bg-green-500';
      case 'Pharmaceutical': return 'bg-purple-500';
      case 'Manufacturing': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <GlassmorphismBackground intensity="medium" className="bg-gradient-mesh">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 py-16 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-slide-up">
              Job <span className="text-gradient">Alerts</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Find your dream job with the latest opportunities from top companies in Telangana
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search jobs..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
                <SelectItem value="secunderabad">Secunderabad</SelectItem>
                <SelectItem value="warangal">Warangal</SelectItem>
                <SelectItem value="karimnagar">Karimnagar</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="pharmaceutical">Pharmaceutical</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-brand hover:opacity-90 transition-smooth">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {jobs.map((job, index) => (
            <Card key={job.id} className="glass-card hover-glass transition-all duration-300 animate-fade-in hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getCategoryColor(job.category)} text-white text-xs`}>
                        {job.category}
                      </Badge>
                      {job.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          <Bell className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <BookmarkPlus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{job.experience}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Posted {job.posted}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-gradient-brand hover:opacity-90 transition-smooth">
                      Apply Now
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto glass-card border-primary/20">
            <CardContent className="p-8">
              <Bell className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse-glow" />
              <h2 className="text-2xl font-bold mb-4">Get Job Alerts</h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to our job alerts and never miss an opportunity.
                Get notified when new jobs matching your profile are posted.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Input placeholder="Enter your email" className="flex-1" />
                <Button className="bg-gradient-brand hover:opacity-90 transition-smooth glow-primary">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </GlassmorphismBackground>
  );
};

export default Jobs;