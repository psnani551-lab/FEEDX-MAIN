import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SmoothScroll } from "./components/SmoothScroll";
import AnniversaryPopup from "./components/AnniversaryPopup";
import MobileNav from "./components/MobileNav";

// Core Layout & Hooks
import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Instant Load (Critical Path)
import Index from "./pages/Index";

// Lazy Loaded Pages
const About = lazy(() => import("./pages/About"));
const Updates = lazy(() => import("./pages/Updates"));
const Projects = lazy(() => import("./pages/Projects"));
const Resources = lazy(() => import("./pages/Resources"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail"));
const InstituteProfile = lazy(() => import("./pages/InstituteProfile"));
const InstituteDetail = lazy(() => import("./pages/InstituteDetail"));
const AttendanceCalculator = lazy(() => import("./pages/AttendanceCalculator"));
const StudentAnalytics = lazy(() => import("./pages/StudentAnalytics"));
const Spotlight = lazy(() => import("./pages/Spotlight"));
const Celebrations = lazy(() => import("./pages/Celebrations"));
const IOESPage = lazy(() => import("./pages/IOESPage"));
const ECETSyllabus = lazy(() => import("./pages/ecet/Syllabus"));
const ECETTests = lazy(() => import("./pages/ecet/Tests"));
const ECETPapers = lazy(() => import("./pages/ecet/Papers"));
const Join = lazy(() => import("./pages/Join"));
const Subscribe = lazy(() => import("./pages/Subscribe"));
const SignIn = lazy(() => import("./pages/SignIn"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const ViewAttendance = lazy(() => import("./pages/ViewAttendance"));
const ViewResults = lazy(() => import("./pages/ViewResults"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UnderDevelopment = lazy(() => import("./pages/UnderDevelopment"));

// Admin - Lazy
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AddNotification = lazy(() => import("./pages/admin/AddNotification"));
const AddUpdate = lazy(() => import("./pages/admin/AddUpdate"));
const AddResource = lazy(() => import("./pages/admin/AddResource"));
const AddEvent = lazy(() => import("./pages/admin/AddEvent"));
const AddSpotlight = lazy(() => import("./pages/admin/AddSpotlight"));
const AddTestimonial = lazy(() => import("./pages/admin/AddTestimonial"));
const AddGallery = lazy(() => import("./pages/admin/AddGallery"));
const AddInstitute = lazy(() => import("./pages/admin/AddInstitute"));
const AddProject = lazy(() => import("./pages/admin/AddProject"));
const InstituteAdmin = lazy(() => import("./pages/admin/InstituteAdmin"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const LoginLogs = lazy(() => import("./pages/LoginLogs"));

// FXBOT Student - Lazy
const StudentAuth = lazy(() => import("./pages/student/StudentAuth"));
const StudentPortal = lazy(() => import("./pages/student/StudentPortal"));

const queryClient = new QueryClient();

/**
 * Fallback Component during lazy load transitions
 */
/**
 * Fallback Component during lazy load transitions
 */
const PageLoader = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-2xl">
    <div className="relative group">
      {/* Outer Pulse Rings */}
      <div className="absolute inset-0 -m-4 rounded-full bg-primary/20 blur-2xl animate-pulse group-hover:bg-primary/30 transition-colors" />
      <div className="absolute inset-0 -m-8 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />

      {/* Branded Icon Container */}
      <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-[2.5rem] bg-white p-1 overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-white/20 active:scale-95 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5" />
        <img
          src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`}
          alt="FXBOT"
          className="w-full h-full object-cover rounded-[2.2rem]"
        />

        {/* Loading Spinner Overlays */}
        <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
      </div>
    </div>

    <div className="mt-10 flex flex-col items-center gap-2">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90 animate-pulse">
        Initializing Registry
      </p>
      <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-blue-400"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  </div>
);

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SmoothScroll>
            <BrowserRouter basename={window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '/' : '/FEEDX-MAIN'}>
              <ScrollToTop />
              <AnniversaryPopup />

              {/* Skip to main content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg"
              >
                Skip to main content
              </a>

              {/* Global background accents */}
              <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl opacity-50" />
                <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl opacity-50" />
                <div className="absolute bottom-[-140px] left-1/3 h-[420px] w-[420px] rounded-full bg-primary/5 blur-3xl opacity-50" />
              </div>

              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/updates" element={<Updates />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/resources/:id" element={<ResourceDetail />} />
                  <Route path="/institute-profile" element={<InstituteProfile />} />
                  <Route path="/institute/:code" element={<InstituteDetail />} />
                  <Route path="/attendance" element={<AttendanceCalculator />} />
                  <Route path="/student-analytics" element={<StudentAnalytics />} />
                  <Route path="/results" element={<StudentAnalytics />} />
                  <Route path="/analytics" element={<StudentAnalytics />} />
                  <Route path="/spotlight" element={<Spotlight />} />
                  <Route path="/celebrations" element={<Celebrations />} />
                  <Route path="/ioes" element={<IOESPage />} />
                  <Route path="/syllabus" element={<ECETSyllabus />} />
                  <Route path="/tests" element={<ECETTests />} />
                  <Route path="/papers" element={<ECETPapers />} />
                  <Route path="/join" element={<Join />} />
                  <Route path="/subscribe" element={<Subscribe />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/get-started" element={<GetStarted />} />
                  <Route path="/view-attendance" element={<ViewAttendance />} />
                  <Route path="/view-results" element={<ViewResults />} />

                  {/* FXBOT Student Routes */}
                  <Route path="/student/auth" element={<StudentAuth />} />
                  <Route path="/student/menu" element={<StudentPortal />} />

                  {/* Admin Routes */}
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/notifications" element={<AddNotification />} />
                  <Route path="/admin/updates" element={<AddUpdate />} />
                  <Route path="/admin/resources" element={<AddResource />} />
                  <Route path="/admin/events" element={<AddEvent />} />
                  <Route path="/admin/spotlight" element={<AddSpotlight />} />
                  <Route path="/admin/testimonials" element={<AddTestimonial />} />
                  <Route path="/admin/gallery" element={<AddGallery />} />
                  <Route path="/admin/institutes" element={<AddInstitute />} />
                  <Route path="/admin/projects" element={<AddProject />} />
                  <Route path="/admin/institutes/:code" element={<InstituteAdmin />} />

                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/logs" element={<LoginLogs />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>

              <MobileNav />
            </BrowserRouter>
          </SmoothScroll>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
