import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { fxbotAPI } from "@/lib/api";
import { fxbotSupabase } from "@/integrations/supabase/fxbot-client";
import { generateUsername } from "@/lib/utils/username";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ShieldCheck, GraduationCap, Building2 } from "lucide-react";

const StudentAuth = () => {
    const [activeTab, setActiveTab] = useState("login");
    const [userType, setUserType] = useState<"student" | "faculty">("student");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [pin, setPin] = useState("");
    const [department, setDepartment] = useState("");
    const [mobile, setMobile] = useState("");
    const [designation, setDesignation] = useState<"Faculty" | "HOD" | "Principal" | "Admin">("Faculty");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleEmailBlur = async () => {
        // Only validate email format — do NOT block on students table check.
        // The students table is not authoritative for auth; Supabase Auth is.
        // Aggressive tab-switching here caused false "Account Not Found" errors.
        return;
    };

    const handleSendOTP = async () => {
        if (!email) {
            toast({ title: "Email Required", variant: "destructive" });
            return;
        }
        const isStudent = userType === "student";
        if (activeTab === "signup") {
            const isPrincipalOrAdmin = userType === "faculty" && (designation === "Principal" || designation === "Admin");
            const missingFields = !fullName || !mobile || (!isPrincipalOrAdmin && !department) || (isStudent && !pin);
            if (missingFields) {
                toast({ title: "All fields are required", variant: "destructive" });
                return;
            }
        }

        // For login tab, skip students-table pre-check.
        // Let Supabase handle "email not in auth" — signInWithOtp with shouldCreateUser:false
        // will return an error automatically if the email isn't registered.


        setIsLoading(true);
        try {
            const { error } = await fxbotSupabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: activeTab === "signup",
                }
            });

            if (error) throw error;

            setIsOtpSent(true);
            setCountdown(60);
            toast({ title: "OTP Sent", description: "Please check your email for the 6-digit code." });
        } catch (error: any) {
            toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            toast({ title: "Please enter a valid 6-digit OTP", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const { data: { session }, error } = await fxbotSupabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email'
            });

            if (error) {
                setOtp(""); // Clear OTP so user can re-enter
                throw error;
            }
            if (!session) {
                setOtp("");
                throw new Error("Verification failed — no session returned. Try resending the code.");
            }

            let profile;
            if (activeTab === "signup") {
                // Check if profile already exists (user may have already signed up)
                const existing = await fxbotAPI.getStudentProfile(email);
                if (existing) {
                    // Profile already exists — just log them in
                    profile = existing;
                    toast({ title: "Welcome back!", description: `Account already exists. Signing you in as ${profile.full_name}.` });
                } else {
                    const username = generateUsername();
                    const isPrincipalOrAdmin = userType === "faculty" && (designation === "Principal" || designation === "Admin");
                    profile = await fxbotAPI.createStudent({
                        email,
                        full_name: fullName.toUpperCase(),
                        pin: userType === "student" ? pin : undefined,
                        department: isPrincipalOrAdmin ? "GLOBAL" : department,
                        mobile,
                        username,
                        role: userType,
                        designation: userType === "student" ? "student" : designation
                    });
                    toast({ title: "Account Created!", description: `Welcome, ${profile.full_name}. Your username: ${profile.username}` });
                }

            } else {
                profile = await fxbotAPI.getStudentProfile(email);
                if (!profile) {
                    // Auth verified but student row missing — guide user to sign up
                    await fxbotSupabase.auth.signOut();
                    setIsOtpSent(false);
                    setOtp("");
                    setActiveTab("signup");
                    toast({
                        title: "Profile Not Found",
                        description: "Your email is verified but your student profile is missing. Please complete sign-up.",
                        variant: "destructive"
                    });
                    return;
                }
            }

            localStorage.setItem("student_session", JSON.stringify(profile));
            navigate("/student/menu");
        } catch (error: any) {
            toast({ title: "Verification failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Animated Mesh Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
            </div>

            <Navbar />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col items-center justify-center px-4 py-20 mt-10 z-10"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden group border border-blue-50"
                    >
                        <img
                            src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`}
                            alt="FXBOT Logo"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-3xl border-2 border-blue-600/5 group-hover:border-blue-600/20 transition-colors"></div>
                    </motion.div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2 drop-shadow-sm">
                        FX<span className="text-blue-600">BOT</span>
                    </h1>
                    <p className="text-[#64748b] text-lg font-medium tracking-wide">Institutional Intelligence System</p>
                </div>

                <Card className="w-full max-w-[460px] glass-card border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="pb-0 pt-8 px-8">
                        <Tabs value={activeTab} onValueChange={(v) => !isOtpSent && setActiveTab(v)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100/50 rounded-2xl h-14 mb-8">
                                <TabsTrigger
                                    value="login"
                                    className="rounded-xl text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all"
                                >
                                    SIGN IN
                                </TabsTrigger>
                                <TabsTrigger
                                    value="signup"
                                    className="rounded-xl text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all"
                                >
                                    SIGN UP
                                </TabsTrigger>
                            </TabsList>

                            <AnimatePresence mode="wait">
                                {isOtpSent ? (
                                    // OTP verification screen — shown for BOTH login and signup
                                    <motion.div
                                        key="otp-content"
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-8 text-center pb-8"
                                    >
                                        <div className="space-y-2">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <ShieldCheck className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">Confirm Identity</h3>
                                            <p className="text-slate-500 text-sm">Validating access for <span className="text-blue-600 font-semibold">{email}</span></p>
                                        </div>

                                        <div className="flex justify-center">
                                            <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                                                <InputOTPGroup className="gap-2.5">
                                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                                        <InputOTPSlot
                                                            key={i}
                                                            index={i}
                                                            className="h-14 w-11 rounded-xl border-2 border-slate-200 bg-white/50 text-xl font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                        />
                                                    ))}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>

                                        <div className="space-y-4">
                                            <Button
                                                onClick={handleVerifyOTP}
                                                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white text-base font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Verify & Continue"}
                                            </Button>

                                            <div className="flex flex-col items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleSendOTP}
                                                    disabled={countdown > 0 || isLoading}
                                                    className="text-slate-500 hover:text-blue-600 font-bold"
                                                >
                                                    {countdown > 0 ? `Retry in ${countdown}s` : "Resend Access Code"}
                                                </Button>
                                                <button
                                                    onClick={() => { setIsOtpSent(false); setOtp(""); }}
                                                    className="text-xs text-slate-400 hover:text-red-500 transition-colors underline underline-offset-4"
                                                >
                                                    Change email address
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : activeTab === "login" ? (
                                    <motion.div
                                        key="login-content"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6 pb-8"
                                    >
                                        <div className="space-y-6">
                                            <div className="space-y-2.5">
                                                <Label htmlFor="email" className="text-slate-700 text-sm font-bold ml-1">Email Address</Label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="name@institution.edu"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                                        onBlur={handleEmailBlur}
                                                        disabled={isLoading}
                                                        className="h-14 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-base pl-12 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleSendOTP}
                                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] group"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Get Access Code</span><ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>}
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="signup-content"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-5 pb-10"
                                    >

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <Button
                                                variant={userType === 'student' ? 'default' : 'outline'}
                                                onClick={() => setUserType('student')}
                                                className={cn(
                                                    "h-14 rounded-2xl gap-2 font-bold transition-all",
                                                    userType === 'student' ? "bg-blue-600 shadow-lg shadow-blue-500/20" : "bg-white/50 border-slate-200 text-slate-500"
                                                )}
                                            >
                                                <GraduationCap className="h-5 w-5" />
                                                Student
                                            </Button>
                                            <Button
                                                variant={userType === 'faculty' ? 'default' : 'outline'}
                                                onClick={() => setUserType('faculty')}
                                                className={cn(
                                                    "h-14 rounded-2xl gap-2 font-bold transition-all",
                                                    userType === 'faculty' ? "bg-blue-600 shadow-lg shadow-blue-500/20" : "bg-white/50 border-slate-200 text-slate-500"
                                                )}
                                            >
                                                <ShieldCheck className="h-5 w-5" />
                                                Faculty
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider ml-1">Official Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="email@institution.edu"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                                        className="h-12 bg-white/50 border-slate-200 rounded-xl pl-12"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider ml-1">Full Legal Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="ENTER FULL NAME"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value.toUpperCase())}
                                                        className="h-12 bg-white/50 border-slate-200 rounded-xl pl-12 font-bold tracking-tight"
                                                    />
                                                </div>
                                            </div>

                                            {userType === 'student' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider ml-1">PIN ID</Label>
                                                        <Input
                                                            placeholder="22001-C-001"
                                                            value={pin}
                                                            onChange={(e) => setPin(e.target.value.toUpperCase())}
                                                            className="h-12 bg-white/50 border-slate-200 rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider ml-1">Branch</Label>
                                                        <Input
                                                            placeholder="CSE / ECE"
                                                            value={department}
                                                            onChange={(e) => setDepartment(e.target.value.toUpperCase())}
                                                            className="h-12 bg-white/50 border-slate-200 rounded-xl"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {userType === 'faculty' && (
                                                <div className="space-y-4 pt-2">
                                                    <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider ml-1">Administrative Role</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {["Faculty", "HOD", "Principal", "Admin"].map((d) => (
                                                            <button
                                                                key={d}
                                                                type="button"
                                                                onClick={() => {
                                                                    setDesignation(d as any);
                                                                    if (d === "Principal" || d === "Admin") setDepartment("GLOBAL");
                                                                    else if (department === "GLOBAL") setDepartment("");
                                                                }}
                                                                className={cn(
                                                                    "h-10 rounded-lg text-xs font-bold border transition-all",
                                                                    designation === d ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                                                                )}
                                                            >
                                                                {d}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {(designation === "Faculty" || designation === "HOD") && (
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider ml-1">Department</Label>
                                                            <div className="relative">
                                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                <Input
                                                                    placeholder="e.g. CSE"
                                                                    value={department}
                                                                    onChange={(e) => setDepartment(e.target.value.toUpperCase())}
                                                                    className="h-12 bg-white/50 border-slate-200 rounded-xl pl-12"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider ml-1">Mobile Contact</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="+91 XXXX XXXX"
                                                        value={mobile}
                                                        onChange={(e) => setMobile(e.target.value)}
                                                        className="h-12 bg-white/50 border-slate-200 rounded-xl pl-12"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSendOTP}
                                            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-500/20 mt-4"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Initiate Verification"}
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Tabs>
                    </CardHeader>
                </Card>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-slate-400 text-sm flex items-center gap-4"
                >
                    <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-help group">
                        <Lock className="h-3.5 w-3.5" />
                        <span>AES-256 Secured</span>
                        <div className="absolute mb-12 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded">End-to-End Encryption</div>
                    </div>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>Compliant Data Processing</span>
                </motion.div>
            </motion.div>

            <Footer />
        </div>
    );
};

export default StudentAuth;
