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
import { motion, AnimatePresence } from "framer-motion";

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
const PageLoader = () => <></>;

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 25 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -25 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/updates" element={<PageTransition><Updates /></PageTransition>} />
          <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
          <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
          <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
          <Route path="/resources/:id" element={<PageTransition><ResourceDetail /></PageTransition>} />
          <Route path="/institute-profile" element={<PageTransition><InstituteProfile /></PageTransition>} />
          <Route path="/institute/:code" element={<PageTransition><InstituteDetail /></PageTransition>} />
          <Route path="/attendance" element={<PageTransition><AttendanceCalculator /></PageTransition>} />
          <Route path="/student-analytics" element={<PageTransition><StudentAnalytics /></PageTransition>} />
          <Route path="/results" element={<PageTransition><StudentAnalytics /></PageTransition>} />
          <Route path="/analytics" element={<PageTransition><StudentAnalytics /></PageTransition>} />
          <Route path="/spotlight" element={<PageTransition><Spotlight /></PageTransition>} />
          <Route path="/celebrations" element={<PageTransition><Celebrations /></PageTransition>} />
          <Route path="/ioes" element={<PageTransition><IOESPage /></PageTransition>} />
          <Route path="/syllabus" element={<PageTransition><ECETSyllabus /></PageTransition>} />
          <Route path="/tests" element={<PageTransition><ECETTests /></PageTransition>} />
          <Route path="/papers" element={<PageTransition><ECETPapers /></PageTransition>} />
          <Route path="/join" element={<PageTransition><Join /></PageTransition>} />
          <Route path="/subscribe" element={<PageTransition><Subscribe /></PageTransition>} />
          <Route path="/signin" element={<PageTransition><SignIn /></PageTransition>} />
          <Route path="/get-started" element={<PageTransition><GetStarted /></PageTransition>} />
          <Route path="/view-attendance" element={<PageTransition><ViewAttendance /></PageTransition>} />
          <Route path="/view-results" element={<PageTransition><ViewResults /></PageTransition>} />

          {/* FXBOT Student Routes */}
          <Route path="/student/auth" element={<PageTransition><StudentAuth /></PageTransition>} />
          <Route path="/student/menu" element={<PageTransition><StudentPortal /></PageTransition>} />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminPanel /></PageTransition>} />
          <Route path="/admin/notifications" element={<PageTransition><AddNotification /></PageTransition>} />
          <Route path="/admin/updates" element={<PageTransition><AddUpdate /></PageTransition>} />
          <Route path="/admin/resources" element={<PageTransition><AddResource /></PageTransition>} />
          <Route path="/admin/events" element={<PageTransition><AddEvent /></PageTransition>} />
          <Route path="/admin/spotlight" element={<PageTransition><AddSpotlight /></PageTransition>} />
          <Route path="/admin/testimonials" element={<PageTransition><AddTestimonial /></PageTransition>} />
          <Route path="/admin/gallery" element={<PageTransition><AddGallery /></PageTransition>} />
          <Route path="/admin/institutes" element={<PageTransition><AddInstitute /></PageTransition>} />
          <Route path="/admin/projects" element={<PageTransition><AddProject /></PageTransition>} />
          <Route path="/admin/institutes/:code" element={<PageTransition><InstituteAdmin /></PageTransition>} />

          <Route path="/admin/users" element={<PageTransition><UserManagement /></PageTransition>} />
          <Route path="/admin/logs" element={<PageTransition><LoginLogs /></PageTransition>} />

          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

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
            <BrowserRouter basename={window.location.pathname.startsWith('/FEEDX-MAIN') ? '/FEEDX-MAIN' : '/'}>
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

              <AnimatedRoutes />

              <MobileNav />
            </BrowserRouter>
          </SmoothScroll>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
