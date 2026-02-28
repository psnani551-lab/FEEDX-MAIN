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
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Core Layout & Hooks
import { useEffect, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { lazyPreload } from "./lib/lazyPreload";

// Instant Load (Critical Path)
import Index from "./pages/Index";

// Lazy Loaded Pages with Preload Support
export const About = lazyPreload(() => import("./pages/About"));
export const Updates = lazyPreload(() => import("./pages/Updates"));
export const Projects = lazyPreload(() => import("./pages/Projects"));
export const Resources = lazyPreload(() => import("./pages/Resources"));
export const Notifications = lazyPreload(() => import("./pages/Notifications"));
export const ResourceDetail = lazyPreload(() => import("./pages/ResourceDetail"));
export const InstituteProfile = lazyPreload(() => import("./pages/InstituteProfile"));
export const InstituteDetail = lazyPreload(() => import("./pages/InstituteDetail"));
export const AttendanceCalculator = lazyPreload(() => import("./pages/AttendanceCalculator"));
export const StudentAnalytics = lazyPreload(() => import("./pages/StudentAnalytics"));
export const Spotlight = lazyPreload(() => import("./pages/Spotlight"));
export const Celebrations = lazyPreload(() => import("./pages/Celebrations"));
export const IOESPage = lazyPreload(() => import("./pages/IOESPage"));
export const ECETSyllabus = lazyPreload(() => import("./pages/ecet/Syllabus"));
export const ECETTests = lazyPreload(() => import("./pages/ecet/Tests"));
export const ECETPapers = lazyPreload(() => import("./pages/ecet/Papers"));
export const Join = lazyPreload(() => import("./pages/Join"));
export const Subscribe = lazyPreload(() => import("./pages/Subscribe"));
export const SignIn = lazyPreload(() => import("./pages/SignIn"));
export const GetStarted = lazyPreload(() => import("./pages/GetStarted"));
export const ViewAttendance = lazyPreload(() => import("./pages/ViewAttendance"));
export const ViewResults = lazyPreload(() => import("./pages/ViewResults"));
export const NotFound = lazyPreload(() => import("./pages/NotFound"));
export const UnderDevelopment = lazyPreload(() => import("./pages/UnderDevelopment"));

// Admin - Lazy with Preload
export const AdminPanel = lazyPreload(() => import("./pages/AdminPanel"));
export const AdminLogin = lazyPreload(() => import("./pages/AdminLogin"));
export const AddNotification = lazyPreload(() => import("./pages/admin/AddNotification"));
export const AddUpdate = lazyPreload(() => import("./pages/admin/AddUpdate"));
export const AddResource = lazyPreload(() => import("./pages/admin/AddResource"));
export const AddEvent = lazyPreload(() => import("./pages/admin/AddEvent"));
export const AddSpotlight = lazyPreload(() => import("./pages/admin/AddSpotlight"));
export const AddTestimonial = lazyPreload(() => import("./pages/admin/AddTestimonial"));
export const AddGallery = lazyPreload(() => import("./pages/admin/AddGallery"));
export const AddInstitute = lazyPreload(() => import("./pages/admin/AddInstitute"));
export const AddProject = lazyPreload(() => import("./pages/admin/AddProject"));
export const InstituteAdmin = lazyPreload(() => import("./pages/admin/InstituteAdmin"));
export const UserManagement = lazyPreload(() => import("./pages/UserManagement"));
export const LoginLogs = lazyPreload(() => import("./pages/LoginLogs"));

// FXBOT Student - Lazy with Preload
export const StudentAuth = lazyPreload(() => import("./pages/student/StudentAuth"));
export const StudentPortal = lazyPreload(() => import("./pages/student/StudentPortal"));

const queryClient = new QueryClient();

import MainLayout from "./components/MainLayout";

/**
 * Empty Fallback Component during lazy load transitions (no blocking loader)
 */
const EmptyLoader = () => (
  <div className="min-h-screen bg-transparent relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Coordinate with Lenis if available, otherwise fallback to native
    if ((window as any).lenisScrollTo) {
      (window as any).lenisScrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname]);

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

              <Navbar />
              <Suspense fallback={<EmptyLoader />}>
                <Routes>
                  {/* Routes with Transitions */}
                  <Route element={<MainLayout />}>
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
                  </Route>

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
              <Footer />

              <MobileNav />
            </BrowserRouter>
          </SmoothScroll>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
