import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Student, FXBotIssue, fxbotAPI } from "@/lib/api";
import { fxbotSupabase } from "@/integrations/supabase/fxbot-client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import SubmitIssue from "@/components/fxbot/SubmitIssue";
import TrackIssues from "@/components/fxbot/TrackIssues";
import ResolvedIssues from "@/components/fxbot/ResolvedIssues";
import { LogOut, CheckCircle2, Clock, ShieldCheck, User as UserIcon, Building2, LayoutDashboard } from "lucide-react";

import FacultyDashboard from "@/components/fxbot/FacultyDashboard";
import HODDashboard from "@/components/fxbot/HODDashboard";
import PrincipalDashboard from "@/components/fxbot/PrincipalDashboard";
import AdminDashboard from "@/components/fxbot/AdminDashboard";

const StudentPortal = () => {
    const [student, setStudent] = useState<Student | null>(null);
    const [issues, setIssues] = useState<FXBotIssue[]>([]);
    const [activeTab, setActiveTab] = useState("submit");
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const session = localStorage.getItem("student_session");
        if (!session) {
            navigate("/student/auth");
            return;
        }

        // Validate the Supabase auth session is still active
        fxbotSupabase.auth.getSession().then(({ data: { session: authSession } }) => {
            if (!authSession) {
                // Auth session expired — clear stale local data and redirect
                localStorage.removeItem("student_session");
                navigate("/student/auth");
                return;
            }
            const studentData = JSON.parse(session);
            setStudent(studentData);
            fetchIssues(studentData);
        });
    }, [navigate]);

    const fetchIssues = async (user: Student) => {
        setIsLoading(true);
        try {
            const data = user.role === 'faculty'
                ? await fxbotAPI.getFacultyIssues(user)
                : await fxbotAPI.getStudentIssues(user.id);
            setIssues(data);
        } catch (error) {
            console.error("Failed to fetch issues:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fxbotAPI.logout();
            toast({ title: "Logged out successfully" });
            navigate("/student/auth");
        } catch (error: any) {
            toast({ title: "Logout failed", description: error.message, variant: "destructive" });
        }
    };

    if (isLoading || !student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const isFaculty = student.role === 'faculty';
    const activeIssuesCount = issues.filter(i => i.status !== "Resolved").length;
    const resolvedIssuesCount = issues.filter(i => i.status === "Resolved").length;

    return (
        <div className="min-h-screen bg-background text-slate-900 relative">
            {/* Soft decorative background circles */}
            <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 lg:mb-12 gap-6 lg:gap-8"
                >
                    <div className="flex items-center gap-4 lg:gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/10 relative overflow-hidden flex-shrink-0 border border-blue-100/50 group">
                            <img
                                src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`}
                                alt="FXBOT Logo"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 border-2 border-blue-600/5 rounded-2xl lg:rounded-3xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <LayoutDashboard className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                                <span className="text-[8px] lg:text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{isFaculty ? "Faculty" : "Student"} Alpha</span>
                            </div>
                            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight truncate">
                                {isFaculty ? "Faculty Portal" : "Student Portal"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                                <p className="text-slate-500 text-xs lg:text-base font-medium">
                                    Welcome, <span className="text-slate-900 font-bold underline decoration-blue-500/30 underline-offset-4">{student.full_name}</span>
                                </p>
                                {student.department && (
                                    <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 font-bold px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg shadow-sm text-[10px] lg:text-xs">
                                        <Building2 className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1 lg:mr-1.5" />
                                        {student.department}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                        <div className="grid grid-cols-2 lg:flex gap-3 lg:gap-4">
                            <Card className="px-4 py-2.5 lg:px-5 lg:py-3 flex items-center gap-3 lg:gap-4 glass-card border-blue-100/50 shadow-xl shadow-blue-500/5 rounded-2xl transition-all hover:shadow-blue-500/10 active:scale-[0.98]">
                                <div className="p-1.5 lg:p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                    <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">{isFaculty ? "INPUTS" : "ACTIVE"}</span>
                                    <span className="text-lg lg:text-xl font-black text-slate-900">{activeIssuesCount}</span>
                                </div>
                            </Card>
                            <Card className="px-4 py-2.5 lg:px-5 lg:py-3 flex items-center gap-3 lg:gap-4 glass-card border-emerald-100/50 shadow-xl shadow-emerald-500/5 rounded-2xl transition-all hover:shadow-emerald-500/10 active:scale-[0.98]">
                                <div className="p-1.5 lg:p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">RESOLVED</span>
                                    <span className="text-lg lg:text-xl font-black text-slate-900">{resolvedIssuesCount}</span>
                                </div>
                            </Card>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="h-12 lg:h-14 px-6 lg:px-8 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.15em] bg-white text-red-600 border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all shadow-xl shadow-red-500/5 group"
                        >
                            <LogOut className="h-4 w-4 lg:h-5 lg:w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Sign Out
                        </Button>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {!isFaculty && (
                        <div className="flex justify-center mb-10 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                            <TabsList className="inline-flex h-14 lg:h-16 items-center justify-center rounded-2xl lg:rounded-[1.25rem] bg-slate-100/80 backdrop-blur-md p-1.5 shadow-inner border border-white/50 w-full md:max-w-xl min-w-[320px]">
                                <TabsTrigger value="submit" className="flex-1 rounded-xl h-full text-[10px] lg:text-sm font-black uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg">Submit</TabsTrigger>
                                <TabsTrigger value="track" className="flex-1 rounded-xl h-full text-[10px] lg:text-sm font-black uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg">Tracking</TabsTrigger>
                                <TabsTrigger value="resolved" className="flex-1 rounded-xl h-full text-[10px] lg:text-sm font-black uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg">Resolved</TabsTrigger>
                            </TabsList>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {isFaculty ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="mt-4"
                            >
                                {(student.designation === 'Faculty' || (isFaculty && student.designation === 'student')) && (
                                    <FacultyDashboard
                                        issues={issues}
                                        facultyProfile={student}
                                        onRefresh={() => fetchIssues(student)}
                                    />
                                )}
                                {student.designation === 'HOD' && (
                                    <HODDashboard
                                        issues={issues}
                                        hodProfile={student}
                                        onRefresh={() => fetchIssues(student)}
                                    />
                                )}
                                {(student.designation === 'Principal' || student.designation === 'Admin') ? (
                                    student.designation === 'Admin' ? (
                                        <AdminDashboard
                                            issues={issues}
                                            adminProfile={student}
                                            onRefresh={() => fetchIssues(student)}
                                        />
                                    ) : (
                                        <PrincipalDashboard
                                            issues={issues}
                                            principalProfile={student}
                                            onRefresh={() => fetchIssues(student)}
                                        />
                                    )
                                ) : null}
                            </motion.div>
                        ) : (
                            <>
                                <TabsContent value="submit">
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <SubmitIssue
                                            studentId={student.id}
                                            department={student.department}
                                            onSuccess={() => fetchIssues(student)}
                                        />
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="track">
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <TrackIssues issues={issues.filter(i => i.status !== "Resolved")} onRefresh={() => fetchIssues(student)} />
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="resolved">
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <ResolvedIssues issues={issues.filter(i => i.status === "Resolved")} />
                                    </motion.div>
                                </TabsContent>
                            </>
                        )}
                    </AnimatePresence>
                </Tabs>
            </div>
            <Footer />
        </div>
    );
};

export default StudentPortal;
