import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { fxbotAPI } from "@/lib/api";
import { Upload, X, FileText, CheckCircle2, ChevronRight, AlertCircle, Info, MessageSquare, Shield, User as UserIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubmitIssueProps {
    studentId: string;
    department: string;
    onSuccess: () => void;
}

const SubmitIssue = ({ studentId, department, onSuccess }: SubmitIssueProps) => {
    const [type, setType] = useState<"Issue" | "Feedback" | "Suggestion">("Issue");
    const [category, setCategory] = useState("");
    const [otherCategory, setOtherCategory] = useState("");
    const [description, setDescription] = useState("");
    const whomToSend = "HOD"; // Default recipient for departmental routing
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [staffName, setStaffName] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [submittedId, setSubmittedId] = useState<string | null>(null);

    const categories = {
        Issue: ["Ragging or Harassment", "Academic or Exam Related", "Staff Related", "Others"],
        Feedback: ["Academics", "Faculty", "Others"],
        Suggestion: ["Academics", "Faculty", "Others"],
    };

    const getTypeIcon = (t: string) => {
        switch (t) {
            case "Issue": return <AlertCircle className="h-4 w-4" />;
            case "Feedback": return <MessageSquare className="h-4 w-4" />;
            case "Suggestion": return <Info className="h-4 w-4" />;
            default: return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !category || !description) {
            toast({ title: "Please fill all required fields", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const issueId = `FX-${type.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const finalCategory = category === "Others" ? otherCategory : category;

            await fxbotAPI.submitIssue({
                id: issueId,
                student_id: studentId,
                department,
                type,
                category: finalCategory,
                description,
                whom_to_send: whomToSend,
                is_anonymous: isAnonymous,
                staff_name: category === "Staff Related" ? staffName : undefined,
            });

            setSubmittedId(issueId);
            toast({ title: "Success!", description: `Your ${type.toLowerCase()} has been submitted.` });
            onSuccess();
        } catch (error: any) {
            toast({ title: "Submission failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    if (submittedId) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
            >
                <Card className="border-emerald-500/20 bg-emerald-50/30 backdrop-blur-xl overflow-hidden rounded-[2rem] shadow-2xl shadow-emerald-500/5">
                    <CardContent className="pt-16 pb-16 text-center max-w-sm mx-auto">
                        <div className="flex justify-center mb-8 gap-4 items-center">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl border border-slate-100"
                            >
                                <img src="/fxbot-logo.jpg" alt="FXBOT" className="w-full h-full object-cover" />
                            </motion.div>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="h-20 w-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20"
                            >
                                <CheckCircle2 size={40} />
                            </motion.div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Submission Finalized</h2>
                        <p className="text-[#64748b] font-medium mb-10">Your {type.toLowerCase()} has been securely recorded and routed for review.</p>

                        <div className="bg-white/80 border border-emerald-100/50 rounded-2xl p-6 mb-10 shadow-lg shadow-emerald-500/5">
                            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Issue Reference Protocol</p>
                            <p className="text-2xl font-mono font-bold text-emerald-700 tracking-tighter">{submittedId}</p>
                        </div>

                        <Button
                            onClick={() => {
                                setSubmittedId(null);
                                setType("Issue");
                                setCategory("");
                                setDescription("");
                                setIsAnonymous(false);
                            }}
                            className="w-full h-14 rounded-2xl bg-white text-emerald-700 border-2 border-emerald-600 hover:bg-emerald-600 hover:text-white font-bold transition-all"
                        >
                            Log Another Entry
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <Card className="glass-card border-white/40 shadow-2xl rounded-[2rem] overflow-hidden">
            <CardContent className="pt-10 px-8 pb-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-slate-700 text-sm font-bold ml-1 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                Submission Blueprint
                            </Label>
                            <Select value={type} onValueChange={(v: any) => {
                                setType(v);
                                setCategory("");
                            }}>
                                <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-slate-200 focus:border-blue-500 transition-all font-semibold">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(type)}
                                        <SelectValue placeholder="Protocol" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200">
                                    <SelectItem value="Issue" className="rounded-xl my-1">Issue</SelectItem>
                                    <SelectItem value="Feedback" className="rounded-xl my-1">Feedback</SelectItem>
                                    <SelectItem value="Suggestion" className="rounded-xl my-1">Suggestion</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-slate-700 text-sm font-bold ml-1 flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-600" />
                                Specific Category
                            </Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-14 rounded-2xl bg-white/50 border-slate-200 focus:border-blue-500 transition-all font-semibold">
                                    <SelectValue placeholder="Choose Category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200">
                                    {categories[type].map(c => (
                                        <SelectItem key={c} value={c} className="rounded-xl my-1">{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <AnimatePresence>
                        {category === "Staff Related" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 overflow-hidden"
                            >
                                <Label className="text-slate-700 text-sm font-bold ml-1">Assigned Faculty Name</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Full Name of the faculty member"
                                        value={staffName}
                                        onChange={e => setStaffName(e.target.value)}
                                        className="h-14 rounded-2xl bg-white/50 border-slate-200 focus:border-blue-500 pl-12"
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}

                        {category === "Others" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 overflow-hidden"
                            >
                                <Label className="text-slate-700 text-sm font-bold ml-1">Custom Classification</Label>
                                <Input
                                    placeholder="Define your specific category"
                                    value={otherCategory}
                                    onChange={e => setOtherCategory(e.target.value)}
                                    className="h-14 rounded-2xl bg-white/50 border-slate-200 focus:border-blue-500"
                                    required
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-3">
                        <Label className="text-slate-700 text-sm font-bold ml-1">Detailed Log Record</Label>
                        <Textarea
                            placeholder={`Describe the ${type.toLowerCase()} with technical precision...`}
                            className="min-h-[160px] rounded-3xl bg-white/50 border-slate-200 focus:border-blue-500 p-6 leading-relaxed text-base"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {type === "Issue" && (
                        <div className="space-y-4">
                            <Label className="text-slate-700 text-sm font-bold ml-1">Supporting Documentation (Optional)</Label>
                            <div className="border-2 border-dashed border-slate-200/50 rounded-3xl p-10 text-center hover:border-blue-500/30 transition-all cursor-pointer relative bg-slate-50/50 group">
                                <Input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length + attachments.length > 3) {
                                            toast({ title: "Maximum 3 files permitted", variant: "destructive" });
                                            return;
                                        }
                                        setAttachments([...attachments, ...files]);
                                    }}
                                />
                                <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 mb-4">
                                        <Upload className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <p className="text-base font-bold text-slate-700">Synchronize Evidence</p>
                                    <p className="text-xs text-slate-400 mt-1">Accepts JPG, PNG, PDF (Max 3 files)</p>
                                </div>
                            </div>

                            <AnimatePresence>
                                {attachments.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-wrap gap-3 mt-4"
                                    >
                                        {attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                                                <FileText size={16} className="text-blue-500" />
                                                <span className="truncate max-w-[120px]">{file.name}</span>
                                                <button type="button" onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}>
                                                    <X size={16} className="hover:text-red-500 transition-colors ml-1" />
                                                </button>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="flex items-center space-x-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/50">
                        <Checkbox
                            id="anonymous"
                            checked={isAnonymous}
                            onCheckedChange={(v: any) => setIsAnonymous(v)}
                            className="rounded-md h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <div className="grid gap-1">
                            <label htmlFor="anonymous" className="text-sm font-bold text-slate-900 cursor-pointer leading-none">
                                Identity Masking Protocol
                            </label>
                            <p className="text-[11px] text-slate-500">
                                Your encryption key will hide PII from the administrative recipient.
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-16 text-lg font-black bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-2xl shadow-blue-500/20 group transition-all active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                    <Loader2 className="h-5 w-5" />
                                </motion.div>
                                Synchronizing...
                            </div>
                        ) : (
                            <>
                                Finalize & Dispatch {type}
                                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default SubmitIssue;
