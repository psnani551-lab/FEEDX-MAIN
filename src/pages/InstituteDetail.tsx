import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, MapPin, Building2, Star, MessageSquare,
  Bookmark, GitCompare, Download, ChevronRight, ChevronDown, ChevronUp,
  Phone, Mail, Globe, ExternalLink, TrendingUp, Image as ImageIcon,
  BookOpen, Share2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { institutesAPI } from "@/lib/api";
import FacultyAccordion from '@/components/FacultyAccordion';

// Interfaces
interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  qualification: string;
  department: string;
  image?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  experience?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  hod: FacultyMember | null;
  description?: string;
  intake?: number;
  labs?: string[];
}

interface Course {
  code: string;
  name: string;
  intake: number;
  fee: number;
  nba: boolean;
}

interface InstituteData {
  code: string;
  name: string;
  place: string;
  dist: string;
  region: string;
  type: string;
  minority: string;
  mode: string;
  description?: string;
  vision?: string;
  mission?: string;
  unique_features?: string;
  images?: string[];
  bannerImage?: string;
  logoImage?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  principal?: string;
  established?: string;
  affiliation?: string;
  courses?: Course[];
  facilities?: string[];
  rating?: number;
  reviews?: number;
  departments?: Department[];
  faculty?: FacultyMember[];
  achievements?: string[];
  hostel?: string;
  placements?: {
    year: string;
    placed: number;
    total: number;
    topRecruiters?: string[];
    avgPackage?: string;
    highestPackage?: string;
  }[];
}

// Basic institute data
const allInstitutes: InstituteData[] = [
  { code: 'ADBP', name: 'S.G GOVT POLYTECHNIC', place: 'ADILABAD', dist: 'ADB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'AITH', name: 'ANNAMACHARYA INST. OF TECHNOLOGY. AND SCI.', place: 'HAYATHNAGAR MANDAL', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'AIZA', name: 'AIZZA COLLEGE OF ENGG AND TECHNOLOGY', place: 'MANCHERIAL', dist: 'MNC', region: 'OU', type: 'PVT', minority: 'MUS', mode: 'COED' },
  { code: 'AKIT', name: 'ABDULKALAM INST. OF TECHNOLOGY AND SCI.', place: 'KOTHAGUDEM', dist: 'KGM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'ANRK', name: 'ANURAG ENGINNERING COLLGE', place: 'KODAD', dist: 'SRP', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'ARJN', name: 'ARJUN COLLEGE OF TECHNOLOGY AND SCIENCE', place: 'BATASINGARAM', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'ASRA', name: 'AVANTHIS SCIENTIFIC TECH AND RESEARCH ACADEMY', place: 'HAYATHNAGAR', dist: 'RR', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'BLMP', name: 'GOVT POLYTECHNIC', place: 'BELLAMPALLI', dist: 'MNC', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'BOMA', name: 'BOMMA INST. OF TECHNOLOGY AND SCI.', place: 'KHAMMAM', dist: 'KHM', region: 'OU', type: 'PVT', minority: 'NA', mode: 'COED' },
  { code: 'JNGP', name: 'J N GOVT POLYTECHNIC', place: 'RAMANTHAPUR', dist: 'MDL', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'MASB', name: 'GOVT POLYTECHNIC', place: 'MASAB TANK', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'NZBD', name: 'GOVT POLYTECHNIC', place: 'NIZAMABAD', dist: 'NZB', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  { code: 'NALG', name: 'GOVT POLYTECHNIC', place: 'NALGONDA', dist: 'NLG', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED' },
  {
    code: 'IOES',
    name: 'GOVT INSTITUTE OF ELECTRONICS',
    place: 'SECUNDERABAD',
    dist: 'HYD',
    region: 'OU',
    type: 'GOV',
    minority: 'NA',
    mode: 'COED',
    established: '1981'
  },
  { code: 'IOEPH', name: 'GOVT INSTITUTE OF ELECTRONICS', place: 'SECUNDERABAD', dist: 'HYD', region: 'OU', type: 'GOV', minority: 'NA', mode: 'COED', established: '1981' },
];



export default function InstituteDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState<InstituteData | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Set default tab to 'collegeinfo' for direct College Info view
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    whatsNew: true,
    tableOfContents: true,
    highlights: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: institute?.name || 'Institute Profile',
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert('Share feature is not supported on this browser. You can copy the URL directly.');
    }
  };

  const handleBrochure = () => {
    alert("Brochure is currently being updated for the new academic year.");
  };

  useEffect(() => {
    const fetchInstitute = async () => {
      try {
        const data = await institutesAPI.getByCode(code || '') as any;
        if (data) {
          setInstitute(data);
        } else {
          fallbackToBasic();
        }
      } catch (error) {
        fallbackToBasic();
      } finally {
        setIsLoading(false);
      }
    };

    const fallbackToBasic = () => {
      const upperCode = code?.toUpperCase() || '';
      const basic = allInstitutes.find(i => i.code.toUpperCase() === upperCode);
      if (basic) {
        setInstitute(basic);
      }
    };

    if (code) {
      fetchInstitute();
    }
  }, [code]);

  // When institute loads, prepare gallery images — prefer ioes folder files if available
  useEffect(() => {
    if (!institute) return;
    const init = async () => {
      // start with any images already present
      let imgs: string[] = institute.images ? [...institute.images] : [];

      // if this is IOES, check for an /uploads/ioes/ folder images (common names)
      if (institute.code?.toUpperCase() === 'IOES') {
        const candidates = [
          '/uploads/ioes/ioes_banner.jpg',
          '/uploads/ioes/ioes_banner.png',
          '/uploads/ioes/ioes-banner.jpg',
          '/uploads/ioes/ioes-banner.png',
          '/uploads/ioes/banner.jpg',
          '/uploads/ioes/banner.png',
          '/uploads/ioes/1.jpg',
          '/uploads/ioes/01.jpg'
        ];

        for (const url of candidates) {
          try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) {
              // prepend if not already included
              if (!imgs.includes(url)) imgs.unshift(url);
            }
          } catch (e) {
            // ignore
          }
        }
      }

      setGalleryImages(imgs);
    };
    init();
  }, [institute]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-24 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading institute details...</p>
          </div>
        </main>

      </div>
    );
  }

  if (!institute) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-24">
          <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-foreground">Institute Not Found</h1>
            <p className="text-muted-foreground mb-6">The institute code "{code}" was not found in our records.</p>
            <Button onClick={() => navigate("/institute-profile")}>
              Back to Institute Directory
            </Button>
          </div>
        </main>

      </div>
    );
  }

  const typeLabel = institute.type === 'GOV' ? 'Government' : 'Private';
  const modeLabel = institute.mode === 'COED' ? 'Co-Education' : institute.mode === 'GIRLS' ? 'Women Only' : 'Men Only';

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Hero Banner Area */}
          <div className="relative bg-card/50 border-b border-white/10">
            {/* Banner Image */}
            <div className="relative h-40 sm:h-48 overflow-hidden">
              {institute.bannerImage ? (
                <img
                  src={institute.bannerImage}
                  alt={`${institute.name} campus`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

              {/* Photo count badge */}
              {institute.images && institute.images.length > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>{institute.images.length} Photos</span>
                </div>
              )}
            </div>

            {/* Institute Info Card */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative -mt-16 sm:-mt-20 pb-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  {/* Logo */}
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-card rounded-xl shadow-lg border border-white/10 p-2 flex items-center justify-center shrink-0">
                    {institute.logoImage ? (
                      <img
                        src={institute.logoImage}
                        alt={`${institute.code} logo`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={`${import.meta.env.BASE_URL}images/gioe-logo.jpg`}
                        alt="Institute Logo"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 pt-2 sm:pt-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-2">
                      {institute.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {institute.place}, {institute.dist}
                      </span>
                      {institute.rating && (
                        <span className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-foreground">{institute.rating}</span>/5
                          {institute.reviews && (
                            <span className="text-primary hover:underline cursor-pointer">({institute.reviews} Reviews)</span>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                        {typeLabel} Institute
                      </Badge>
                      <Badge variant="outline" className="border-white/20">
                        {modeLabel}
                      </Badge>
                      {institute.established && (
                        <span className="text-muted-foreground text-sm">Estd. {institute.established}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto sm:pt-8">
                    <Button variant="outline" className="flex items-center gap-2 border-white/20" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 border-white/20">
                      <GitCompare className="w-4 h-4" />
                      Compare
                    </Button>
                    <Button className="flex items-center gap-2" onClick={handleBrochure}>
                      <Download className="w-4 h-4" />
                      Brochure
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Bar (Inside Tabs Provider) */}
            <div className="border-t border-white/10 bg-card/80 backdrop-blur-sm sticky top-16 z-40">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0 border-b-0 rounded-none">
                  {['Overview', 'Courses', 'Faculty', 'Gallery'].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab.toLowerCase().replace(/[^a-z]/g, '')}
                      className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-4 py-3 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground data-[state=active]:text-primary"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Overview TabContent */}
            <TabsContent value="overview" className="space-y-8 animate-in fade-in-0 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Section */}
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle>About College</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        {institute.description || `${institute.name} is a premier educational institution committed to providing quality technical education and fostering excellence in its students.`}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Unique Features */}
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle>Unique Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        {institute.unique_features || 'The institution offers industry-aligned curriculum, state-of-the-art laboratory facilities, and a strong focus on practical skills. Students benefit from regular industrial visits, expert guest lectures, and a dedicated placement cell ensuring career success.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Vision & Mission */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                      <CardHeader>
                        <CardTitle className="text-blue-600 dark:text-blue-400">Vision</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {institute.vision || 'To be a center of excellence in technical education, producing globally competent professionals with strong ethical values.'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800">
                      <CardHeader>
                        <CardTitle className="text-green-600 dark:text-green-400">Mission</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {institute.mission || 'To provide high-quality technical education, promote innovation and research, and empower students to contribute meaningfully to society and industry.'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {institute.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-sm">{institute.address}</span>
                        </div>
                      )}
                      {institute.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                          <a href={institute.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline text-primary">
                            {institute.website.replace('https://', '').replace('http://', '').replace(/\/$/, '')}
                          </a>
                        </div>
                      )}
                      {institute.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                          <a href={`mailto:${institute.email}`} className="text-sm hover:underline">
                            {institute.email}
                          </a>
                        </div>
                      )}
                      {institute.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                          <a href={`tel:${institute.phone}`} className="text-sm hover:underline">
                            {institute.phone}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Departments List */}
                  {institute.departments && institute.departments.length > 0 && (
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-base">Departments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {institute.departments.map((dept, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              {dept.name}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Courses TabContent */}
            <TabsContent value="courses" className="space-y-6 animate-in fade-in-0 duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Departments & Curriculum</h2>
                {institute.departments && institute.departments.length > 0 && (
                  <Badge className="bg-primary/20 text-primary border-0">{institute.departments.length} Departments</Badge>
                )}
              </div>

              {institute.departments && institute.departments.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {institute.departments.map((dept) => (
                    <Card key={dept.id} className="glass-card border-white/10 hover:border-primary/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Badge className="bg-primary/20 text-primary border-0 mb-2">{dept.code}</Badge>
                            <h3 className="text-lg font-semibold text-foreground">{dept.name}</h3>
                          </div>
                          {dept.intake && (
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Intake</p>
                              <p className="text-xl font-bold text-primary">{dept.intake}</p>
                            </div>
                          )}
                        </div>

                        {dept.hod && (
                          <div className="border-t border-white/10 pt-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Head of Department</p>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={dept.hod.image} />
                                <AvatarFallback className="bg-primary/20 text-primary">
                                  {dept.hod.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm text-foreground">{dept.hod.name}</p>
                                <p className="text-[10px] text-muted-foreground">{dept.hod.qualification}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    Department details are currently being updated.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Faculty TabContent */}
            <TabsContent value="faculty" className="space-y-6 animate-in fade-in-0 duration-300">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Faculty Members</h2>
                </div>
                {institute.departments && institute.faculty && (
                  <FacultyAccordion departments={institute.departments} faculty={institute.faculty} />
                ) || (
                    <Card className="glass-card border-white/10">
                      <CardContent className="p-12 text-center text-muted-foreground">
                        Faculty information will be available soon.
                      </CardContent>
                    </Card>
                  )}
              </div>
            </TabsContent>

            {/* Gallery TabContent */}
            <TabsContent value="gallery" className="space-y-6 animate-in fade-in-0 duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Campus Gallery</h2>
              </div>
              {galleryImages && galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer border border-white/10">
                      <img
                        src={img}
                        alt={`Campus ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onClick={() => window.open(img, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    Campus images will be uploaded shortly.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Back Button Area */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Button
            variant="outline"
            onClick={() => navigate("/institute-profile")}
            className="flex items-center gap-2 border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Institute Directory
          </Button>
        </div>
      </main>
    </div>
  );
}
