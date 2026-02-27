import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, MapPin, Building2, Star, MessageSquare,
  Bookmark, GitCompare, Download, ChevronRight, ChevronDown, ChevronUp,
  Phone, Mail, Globe, ExternalLink, TrendingUp, Image as ImageIcon,
  BookOpen
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
    established: '1981',
    description: 'Government Institute of Electronics (GIOE) is a premier government polytechnic established in 1981, offering diploma courses in cutting-edge technology fields including AI/ML, Cloud Computing, Cyber Security, and traditional Electronics branches.',
    address: 'EAST MARRED PALLY, SECUNDERABAD, 500026',
    phone: '4027730000',
    email: 'principalgioe@gmail.com',
    website: 'https://gioescbd.dte.telangana.gov.in/',
    principal: 'Sri. B. Ram Mohan Reddy, M.Tech., MISTE.',
    hostel: 'Both Boys and Girls',
    affiliation: 'SBTET',
    facilities: ['Computer Labs', 'Electronics Labs', 'Library', 'Auditorium', 'Sports Ground', 'Canteen', 'WiFi Campus'],
    // Banner, logo and gallery images for IOES — prefer dedicated images/ioes folder
    bannerImage: '/images/ioes_banner.jpg',
    logoImage: '/images/ioes_banner.jpg',
    images: [
      '/images/ioes_banner.jpg',
      '/images/ioes/2d839e36-0991-49a8-88aa-b1bd002f0eec.jpg',
      '/images/ioes/362f15d5-e1da-4563-8412-1ab8f1067f3b.jpg',
      '/images/ioes/44bf578a-9013-44e4-8ca3-88c6a15d00b8.jpg',
      '/images/ioes/537422c4-fa2d-4a37-986a-4468ee4c224a.jpg',
      '/images/ioes/7229f92e-c61c-4c22-9705-5235a05dfa76.jpg',
      '/images/ioes/83598784-aff9-46b0-b33d-d05486751359.jpg',
      '/images/ioes/87de1f65-8006-41bc-9fc1-db7ac3c7cf04.jpg',
      '/images/ioes/93e9ac10-f524-43a6-af6c-fe61b54038d4.jpg',
      '/images/ioes/b8af2369-7938-4f19-a178-0ed6bab9787e.jpg',
      '/images/ioes/cd96ad0e-d8eb-4ffe-8b51-783c4cd3b661.jpg',
      '/images/ioes/dbff9a99-48ef-4442-8902-a40303bbe65e.jpg',
      '/images/ioes/e3a637d5-3e5b-44de-8c1d-14bb58cf7d31.jpg',
      '/images/ioes/f7525e12-3d26-4ef3-835c-df1111043f76.jpg',
      '/images/ioes/f7b89bec-bf2c-4702-94bd-1b7965a1a6ab.jpg',
      '/images/ioes/Screenshot 2025-12-19 235808.png'
    ],
    courses: [
      { code: 'AI', name: 'DIPLOMA IN ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING', intake: 66, fee: 5080, nba: false },
      { code: 'BM', name: 'DIPLOMA IN BIOMEDICAL ENGINEERING', intake: 66, fee: 5080, nba: false },
      { code: 'CCB', name: 'DIPLOMA IN CLOUD COMPUTING AND BIG DATA', intake: 66, fee: 5080, nba: false },
      { code: 'CPS', name: 'DIPLOMA IN CYBER PHYSICAL SYSTEMS AND SECURITY', intake: 66, fee: 5080, nba: false },
      { code: 'CS', name: 'DIPLOMA IN COMPUTER SCIENCE AND ENGINEERING', intake: 66, fee: 5080, nba: true },
      { code: 'EC', name: 'DIPLOMA IN ELECTRONICS & COMMUNICATION ENGINEERING', intake: 66, fee: 5080, nba: true },
      { code: 'EI', name: 'DIPLOMA IN ELECTRONICS & INSTRUMENTATION ENGINEERING', intake: 66, fee: 5080, nba: false },
      { code: 'ES', name: 'DIPLOMA IN EMBEDDED SYSTEMS ENGINEERING', intake: 66, fee: 5080, nba: false },
      { code: 'EV', name: 'DIPLOMA IN ELECTRONICS AND VIDEO ENGINEERING', intake: 66, fee: 5080, nba: true },
    ],
    departments: [
      { id: 'aiml', name: 'Artificial Intelligence & Machine Learning', code: 'AIML', hod: { id: 'f1', name: 'N Srinivasa Rao', designation: 'Head of Department', qualification: '', department: 'AIML' }, intake: 60 },
      { id: 'cse', name: 'Computer Science & Engineering', code: 'CSE', hod: { id: 'f6', name: 'G V Nagalakshmi', designation: 'Head of Department', qualification: '', department: 'CSE' }, intake: 60 },
      { id: 'eie', name: 'Electronics & Instrumentation Engineering', code: 'EIE', hod: { id: 'f11', name: 'G V Nagalakshmi', designation: 'Head of Department', qualification: '', department: 'EIE' }, intake: 60 },
      { id: 'eve', name: 'Electronics & Video Engineering', code: 'EVE', hod: { id: 'f16', name: 'B Laxmi Kantha', designation: 'Head of Department', qualification: '', department: 'EVE' }, intake: 40 },
      { id: 'bme', name: 'Biomedical Engineering', code: 'BME', hod: { id: 'f21', name: 'P Jyothi', designation: 'Head of Department', qualification: '', department: 'BME' }, intake: 40 },
      { id: 'ccbd', name: 'Cloud Computing & Big Data', code: 'CCBD', hod: { id: 'f27', name: 'S P Venkat Reddy', designation: 'Head of Department', qualification: '', department: 'CCBD' }, intake: 60 },
      { id: 'ece', name: 'Electronics & Communication Engineering', code: 'ECE', hod: { id: 'f31', name: 'N Srinivasa Rao', designation: 'Head of Department', qualification: '', department: 'ECE' }, intake: 60 },
      { id: 'ese', name: 'Embedded Systems Engineering', code: 'ESE', hod: { id: 'f36', name: 'B Ram Mohan Reddy', designation: 'Head of Department', qualification: '', department: 'ESE' }, intake: 40 },
      { id: 'cpss', name: 'Cyber Physical Systems & Security', code: 'CPSS', hod: { id: 'f41', name: 'Venkata Satish Kumar M', designation: 'Head of Department', qualification: '', department: 'CPSS' }, intake: 60 },
      { id: 'hs', name: 'Humanities & Sciences', code: 'H&S', hod: { id: 'f46', name: 'D Satyanandam', designation: 'Head of Department', qualification: '', department: 'H&S' }, intake: 0 },
    ],
    faculty: [
      // AIML Department
      { id: 'f1', name: 'N Srinivasa Rao', designation: 'Head of Department', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
      { id: 'f2', name: 'Asheera Begum', designation: 'Lecturer', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
      { id: 'f3', name: 'Sai Kumar', designation: 'Lecturer', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
      { id: 'f4', name: 'A Vikram Chakravorthy', designation: 'Lecturer', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
      { id: 'f5', name: 'K Pramil', designation: 'Lecturer', qualification: '', department: 'Artificial Intelligence & Machine Learning' },
      // CSE Department
      { id: 'f6', name: 'G V Nagalakshmi', designation: 'Head of Department', qualification: '', department: 'Computer Science & Engineering' },
      { id: 'f7', name: 'K Sunitha', designation: 'Lecturer', qualification: '', department: 'Computer Science & Engineering' },
      { id: 'f8', name: 'P Srikar', designation: 'Lecturer', qualification: '', department: 'Computer Science & Engineering' },
      { id: 'f9', name: 'B Devisree', designation: 'Lecturer', qualification: '', department: 'Computer Science & Engineering' },
      { id: 'f10', name: 'S Swati', designation: 'Lecturer', qualification: '', department: 'Computer Science & Engineering' },
      // EIE Department
      { id: 'f11', name: 'G V Nagalakshmi', designation: 'Head of Department', qualification: '', department: 'Electronics & Instrumentation Engineering' },
      { id: 'f12', name: 'U Sriram', designation: 'Senior Lecturer', qualification: '', department: 'Electronics & Instrumentation Engineering' },
      { id: 'f13', name: 'B Indira Priyadarshini', designation: 'Lecturer', qualification: '', department: 'Electronics & Instrumentation Engineering' },
      { id: 'f14', name: 'P Satya', designation: 'Lecturer', qualification: '', department: 'Electronics & Instrumentation Engineering' },
      { id: 'f15', name: 'B Padmalatha', designation: 'Lecturer', qualification: '', department: 'Electronics & Instrumentation Engineering' },
      // EVE Department
      { id: 'f16', name: 'B Laxmi Kantha', designation: 'Head of Department', qualification: '', department: 'Electronics & Video Engineering' },
      { id: 'f17', name: 'P Shiva Raju', designation: 'Lecturer', qualification: '', department: 'Electronics & Video Engineering' },
      { id: 'f18', name: 'M Phanidhar Kumar', designation: 'Lecturer', qualification: '', department: 'Electronics & Video Engineering' },
      { id: 'f19', name: 'P Ravi', designation: 'Lecturer', qualification: '', department: 'Electronics & Video Engineering' },
      { id: 'f20', name: 'E Vinayak', designation: 'Lecturer', qualification: '', department: 'Electronics & Video Engineering' },
      // BME Department
      { id: 'f21', name: 'P Jyothi', designation: 'Head of Department', qualification: '', department: 'Biomedical Engineering' },
      { id: 'f22', name: 'P Kishen Chandrika', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
      { id: 'f23', name: 'K Thirupathanna', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
      { id: 'f24', name: 'Y Poornachandra Rao', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
      { id: 'f25', name: 'R Rameshwar', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
      { id: 'f26', name: 'A Ajay Teja', designation: 'Lecturer', qualification: '', department: 'Biomedical Engineering' },
      // CCBD Department
      { id: 'f27', name: 'S P Venkat Reddy', designation: 'Head of Department', qualification: '', department: 'Cloud Computing & Big Data' },
      { id: 'f28', name: 'V Kalpana', designation: 'Lecturer', qualification: '', department: 'Cloud Computing & Big Data' },
      { id: 'f29', name: 'A Vani', designation: 'Lecturer', qualification: '', department: 'Cloud Computing & Big Data' },
      { id: 'f30', name: 'S Dattatri Reddy', designation: 'Lecturer', qualification: '', department: 'Cloud Computing & Big Data' },
      // ECE Department
      { id: 'f31', name: 'N Srinivasa Rao', designation: 'Head of Department', qualification: '', department: 'Electronics & Communication Engineering' },
      { id: 'f32', name: 'V Maheshwari', designation: 'Senior Lecturer', qualification: '', department: 'Electronics & Communication Engineering' },
      { id: 'f33', name: 'K M Arvind Kumar', designation: 'Senior Lecturer', qualification: '', department: 'Electronics & Communication Engineering' },
      { id: 'f34', name: 'M Narender', designation: 'Lecturer', qualification: '', department: 'Electronics & Communication Engineering' },
      { id: 'f35', name: 'B Pushyami', designation: 'Lecturer', qualification: '', department: 'Electronics & Communication Engineering' },
      // ESE Department
      { id: 'f36', name: 'B Ram Mohan Reddy', designation: 'Head of Department', qualification: '', department: 'Embedded Systems Engineering' },
      { id: 'f37', name: 'Dr T Krishna Manohar', designation: 'Senior Lecturer', qualification: '', department: 'Embedded Systems Engineering' },
      { id: 'f38', name: 'T P Lingswamy', designation: 'Senior Lecturer', qualification: '', department: 'Embedded Systems Engineering' },
      { id: 'f39', name: 'A Suresh', designation: 'Lecturer', qualification: '', department: 'Embedded Systems Engineering' },
      { id: 'f40', name: 'M Javid Ali', designation: 'Lecturer', qualification: '', department: 'Embedded Systems Engineering' },
      // CPSS Department
      { id: 'f41', name: 'Venkata Satish Kumar M', designation: 'Head of Department', qualification: '', department: 'Cyber Physical Systems & Security' },
      { id: 'f42', name: 'K Sunitha', designation: 'Lecturer', qualification: '', department: 'Cyber Physical Systems & Security' },
      { id: 'f43', name: 'K M Sateesh Kumar', designation: 'Senior Lecturer', qualification: '', department: 'Cyber Physical Systems & Security' },
      { id: 'f44', name: 'T Bhargavi', designation: 'Lecturer', qualification: '', department: 'Cyber Physical Systems & Security' },
      { id: 'f45', name: 'A Satheesh Naik', designation: 'Lecturer', qualification: '', department: 'Cyber Physical Systems & Security' },
      // Humanities & Sciences Department
      { id: 'f46', name: 'D Satyanandam', designation: 'Head of Department', qualification: '', department: 'Humanities & Sciences' },
      { id: 'f47', name: 'P V V Ramanamurthy', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
      { id: 'f48', name: 'M Vijaya Laxmi', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
      { id: 'f49', name: 'G Prasad', designation: 'Senior Lecturer', qualification: '', department: 'Humanities & Sciences' },
      { id: 'f50', name: 'M Uma Rani', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
      { id: 'f51', name: 'R Vijaya', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
      { id: 'f52', name: 'M Radhika', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
      { id: 'f53', name: 'G Madhubabu', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
      { id: 'f54', name: 'M Manjula', designation: 'Librarian', qualification: '', department: 'Humanities & Sciences' },
      { id: 'f55', name: 'B Srikantha Chary', designation: 'Lecturer', qualification: '', department: 'Humanities & Sciences' },
    ]
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
  const [activeTab, setActiveTab] = useState("collegeinfo");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    whatsNew: true,
    tableOfContents: true,
    highlights: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
        {/* Hero Banner */}
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
                    <Building2 className="w-12 h-12 text-primary" />
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
                  <Button variant="outline" className="flex items-center gap-2 border-white/20">
                    <Bookmark className="w-4 h-4" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 border-white/20">
                    <GitCompare className="w-4 h-4" />
                    Compare
                  </Button>
                  <Button className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Brochure
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-white/10 bg-card/80 backdrop-blur-sm sticky top-16 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollArea className="w-full">
                <div className="flex gap-0 min-w-max">
                  {['College Info', 'Departments', 'Faculty', 'Courses', 'Placements', 'Gallery', 'Infrastructure', 'Reviews', 'Q&A'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase().replace(/[^a-z]/g, ''))}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.toLowerCase().replace(/[^a-z]/g, '')
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Main Content - Tab Based */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* College Info Tab */}
          {activeTab === 'collegeinfo' && (
            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Highlights Section */}
                <Card className="glass-card border-white/10 overflow-hidden" id="highlights">
                  <button
                    onClick={() => toggleSection('highlights')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <h2 className="text-lg font-semibold text-foreground">{institute.name} Overview</h2>
                    {expandedSections.highlights ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </button>

                  {expandedSections.highlights && (
                    <CardContent className="px-6 pb-6 pt-0">
                      {institute.description && (
                        <p className="text-muted-foreground mb-6">{institute.description}</p>
                      )}

                      {/* Quick Info Table */}
                      <div className="border border-white/10 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <tbody>
                            <tr className="border-b border-white/10">
                              <td className="px-4 py-3 bg-muted/30 font-medium text-muted-foreground w-1/3">Institute Code</td>
                              <td className="px-4 py-3 text-foreground">{institute.code}</td>
                            </tr>
                            <tr className="border-b border-white/10">
                              <td className="px-4 py-3 bg-muted/30 font-medium text-muted-foreground">Type</td>
                              <td className="px-4 py-3 text-foreground">{typeLabel}</td>
                            </tr>
                            <tr className="border-b border-white/10">
                              <td className="px-4 py-3 bg-muted/30 font-medium text-muted-foreground">Location</td>
                              <td className="px-4 py-3 text-foreground">{institute.place}, {institute.dist}</td>
                            </tr>
                            <tr className="border-b border-white/10">
                              <td className="px-4 py-3 bg-muted/30 font-medium text-muted-foreground">Region</td>
                              <td className="px-4 py-3 text-foreground">{institute.region}</td>
                            </tr>
                            <tr className="border-b border-white/10">
                              <td className="px-4 py-3 bg-muted/30 font-medium text-muted-foreground">Mode</td>
                              <td className="px-4 py-3 text-foreground">{modeLabel}</td>
                            </tr>
                            {institute.established && (
                              <tr className="border-b border-white/10">
                                <td className="px-4 py-3 bg-muted/30 font-medium text-muted-foreground">Established</td>
                                <td className="px-4 py-3 text-foreground">{institute.established}</td>
                              </tr>
                            )}
                            {institute.minority !== 'NA' && (
                              <tr className="border-b border-white/10">
                                <td className="px-4 py-3 bg-muted/30 font-medium text-muted-foreground">Minority Status</td>
                                <td className="px-4 py-3 text-foreground">{institute.minority}</td>
                              </tr>
                            )}
                            {institute.principal && (
                              <tr>
                                <td className="px-4 py-3 bg-muted/30 font-medium text-muted-foreground">Principal</td>
                                <td className="px-4 py-3 text-foreground">{institute.principal}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Contact Info */}
                      {(institute.phone || institute.email || institute.website || institute.address) && (
                        <div className="mt-6 space-y-3">
                          <h3 className="font-semibold text-foreground">Contact Information</h3>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {institute.address && (
                              <div className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                <span className="text-sm">{institute.address}</span>
                              </div>
                            )}
                            {institute.phone && (
                              <a href={`tel:${institute.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                                <Phone className="w-4 h-4" />
                                {institute.phone}
                              </a>
                            )}
                            {institute.email && (
                              <a href={`mailto:${institute.email}`} className="flex items-center gap-2 text-primary hover:underline">
                                <Mail className="w-4 h-4" />
                                {institute.email}
                              </a>
                            )}
                            {institute.website && (
                              <a href={institute.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                <Globe className="w-4 h-4" />
                                Visit Website
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Quick Links */}
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-3">Quick Navigation</h3>
                    <div className="space-y-2">
                      <button onClick={() => setActiveTab('departments')} className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <span>Departments & HODs</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button onClick={() => setActiveTab('faculty')} className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <span>Faculty Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button onClick={() => setActiveTab('placements')} className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <span>Placement Records</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigate('/resources')} className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-3 h-3 text-primary" />
                          Study Materials
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button onClick={() => setActiveTab('infrastructure')} className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <span>Infrastructure</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Departments & HODs</h2>
                {institute.departments && institute.departments.length > 0 && (
                  <Badge className="bg-primary/20 text-primary border-0">{institute.departments.length} Departments</Badge>
                )}
              </div>

              {institute.departments && institute.departments.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {institute.departments.map((dept) => (
                    <Card key={dept.id} className="glass-card border-white/10 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] transition-all duration-500">
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

                        {dept.description && (
                          <p className="text-muted-foreground text-sm mb-4">{dept.description}</p>
                        )}

                        {dept.hod && (
                          <div className="border-t border-white/10 pt-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Head of Department</p>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={dept.hod.image} />
                                <AvatarFallback className="bg-primary/20 text-primary">
                                  {dept.hod.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{dept.hod.name}</p>
                                <p className="text-sm text-muted-foreground">{dept.hod.qualification}</p>
                                {dept.hod.experience && <p className="text-xs text-muted-foreground">{dept.hod.experience} experience</p>}
                              </div>
                            </div>
                          </div>
                        )}

                        {dept.labs && dept.labs.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Labs & Facilities</p>
                            <div className="flex flex-wrap gap-2">
                              {dept.labs.map((lab, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-white/20">{lab}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Departments Added Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">Department information will be displayed here once added by the administrator.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Faculty Tab */}
          {activeTab === 'faculty' && (
            <div className="space-y-8">

              {/* Vision & Mission */}
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="glass-card border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-2">Vision</h3>
                    <p className="text-muted-foreground text-sm">To be equipped with state-of-the-art technology, attract and retain talented human resources, and deliver a balanced education of rigorous theory and practical skills aligned with industry needs, thereby maturing into a world-class institute that empowers students to innovate, serve, and lead.</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-2">Mission</h3>
                    <p className="text-muted-foreground text-sm">To achieve an educational environment where every enrolled student successfully completes the program with zero dropout rate, attains 100% academic success, and secures 100% placement through strong industry-oriented training and institutional support.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Faculty Accordion by Department */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Faculty Details</h2>
                {institute.departments && institute.faculty && (
                  <FacultyAccordion departments={institute.departments} faculty={institute.faculty} />
                )}
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Courses Offered</h2>

              {institute.courses && institute.courses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {institute.courses.map((course, idx) => (
                    <Card key={idx} className="glass-card border-white/10 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] transition-all duration-500">
                      <CardContent className="p-6">
                        <Badge className="bg-primary/20 text-primary border-0 mb-3">{course.code}</Badge>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{course.name}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Duration: 3 Years</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Added Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">Course information will be displayed here once added by the administrator.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Placements Tab */}
          {activeTab === 'placements' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Placement Records</h2>

              {institute.placements && institute.placements.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground text-sm">Placement Rate {institute.placements[0].year}</p>
                        <p className="text-4xl font-bold text-foreground mt-2">
                          {Math.round((institute.placements[0].placed / institute.placements[0].total) * 100)}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground text-sm">Students Placed</p>
                        <p className="text-4xl font-bold text-foreground mt-2">{institute.placements[0].placed}+</p>
                      </CardContent>
                    </Card>
                    {institute.placements[0].avgPackage && (
                      <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/20">
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground text-sm">Avg. Package</p>
                          <p className="text-4xl font-bold text-foreground mt-2">{institute.placements[0].avgPackage}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {institute.placements[0].topRecruiters && institute.placements[0].topRecruiters.length > 0 && (
                    <Card className="glass-card border-white/10">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-4">Top Recruiting Companies</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {institute.placements[0].topRecruiters.map((company, idx) => (
                            <div key={idx} className="p-4 bg-muted/30 rounded-lg text-center">
                              <p className="font-medium text-foreground">{company}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Placement Data Available</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">Placement records will be displayed here once added by the administrator.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Gallery</h2>

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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Gallery Images Available</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">Campus photos will be displayed here once uploaded by the administrator.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Infrastructure Tab */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Infrastructure & Facilities</h2>

              {/* Showcase a hero image if available */}
              {institute.images && institute.images.length > 0 && (
                <div className="mb-4">
                  <div className="w-full rounded-lg overflow-hidden border border-white/10">
                    <img src={institute.images[0]} alt={`${institute.name} infrastructure`} className="w-full h-56 object-cover" />
                  </div>
                </div>
              )}

              {institute.facilities && institute.facilities.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {institute.facilities.map((facility, idx) => (
                    <Card key={idx} className="glass-card border-white/10 hover:border-primary/30 transition-colors">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground">{facility}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Infrastructure Data Available</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">Infrastructure and facilities information will be displayed here once added by the administrator.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Student Reviews</h2>
              </div>

              {institute.rating ? (
                <div className="grid md:grid-cols-[300px_1fr] gap-8">
                  {/* Rating Summary */}
                  <Card className="glass-card border-white/10 h-fit">
                    <CardContent className="p-6 text-center">
                      <p className="text-5xl font-bold text-foreground">{institute.rating}</p>
                      <div className="flex justify-center gap-1 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-5 h-5 ${star <= Math.round(institute.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{institute.reviews || 0} Reviews</p>
                    </CardContent>
                  </Card>

                  {/* Reviews List - Empty state */}
                  <Card className="glass-card border-white/10">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No written reviews available yet.</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">Student reviews will be displayed here once added.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Q&A Tab */}
          {activeTab === 'qa' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Questions & Answers</h2>

              <Card className="glass-card border-white/10">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-primary/60" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Questions Yet</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">Questions and answers will be displayed here once added.</p>
                </CardContent>
              </Card>
            </div>
          )}

        </div>

        {/* Back Button */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
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
