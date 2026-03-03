import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { fxbotAPI, uploadFile } from "@/lib/api";
import { Upload, X, FileText, CheckCircle2, ChevronRight, AlertCircle, Info, MessageSquare, Shield, User as UserIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

            let uploadedUrls: string[] = [];
            if (attachments.length > 0) {
                const uploadPromises = attachments.map(file => uploadFile(file));
                uploadedUrls = await Promise.all(uploadPromises);
            }

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
                attachments: uploadedUrls,
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
                <Card className="border-slate-800 bg-slate-900 overflow-hidden rounded-[2.5rem] shadow-2xl relative">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
                    <CardContent className="pt-16 lg:pt-20 pb-12 lg:pb-16 text-center max-w-sm mx-auto relative z-10 px-6 sm:px-10">
                        <div className="flex justify-center mb-10 gap-6 items-center">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center overflow-hidden shadow-2xl border-4 border-slate-800"
                            >
                                <img src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`} alt="FXBOT" className="w-full h-full object-cover" />
                            </motion.div>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="h-24 w-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 border-4 border-slate-800"
                            >
                                <CheckCircle2 size={48} />
                            </motion.div>
                        </div>

                        <div className="space-y-4 mb-12">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase mb-2">
                                Transaction Authorized
                            </Badge>
                            <h2 className="text-4xl font-black text-white tracking-tighter leading-none">REGISTRY FINALIZED</h2>
                            <p className="text-slate-400 font-bold text-sm leading-relaxed px-4">
                                Your {type.toLowerCase()} has been securely encrypted and synchronized with administrative oversight.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 mb-12 shadow-inner ring-1 ring-white/10 group hover:ring-emerald-500/30 transition-all">
                            <p className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.3em]">Protocol Reference Key</p>
                            <p className="text-3xl font-mono font-black text-emerald-400 tracking-tighter group-hover:scale-105 transition-transform">{submittedId}</p>
                        </div>

                        <Button
                            onClick={() => {
                                setSubmittedId(null);
                                setType("Issue");
                                setCategory("");
                                setOtherCategory("");
                                setStaffName("");
                                setDescription("");
                                setAttachments([]);
                                setIsAnonymous(false);
                            }}
                            className="w-full h-16 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-[0.98]"
                        >
                            Log New Entry
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <Card className="glass-card border-white/40 shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
            <CardContent className="pt-8 sm:pt-12 px-5 sm:px-10 pb-8 sm:pb-12">
                <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                        <div className="space-y-4">
                            <Label className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-blue-600" />
                                Submission Blueprint
                            </Label>
                            <Select value={type} onValueChange={(v: any) => {
                                setType(v);
                                setCategory("");
                            }}>
                                <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-200 focus:border-blue-500 transition-all font-black text-xs uppercase tracking-widest">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-blue-50 rounded-lg">
                                            {getTypeIcon(type)}
                                        </div>
                                        <SelectValue placeholder="Protocol" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200">
                                    <SelectItem value="Issue" className="rounded-xl my-1 font-bold">ISSUE</SelectItem>
                                    <SelectItem value="Feedback" className="rounded-xl my-1 font-bold">FEEDBACK</SelectItem>
                                    <SelectItem value="Suggestion" className="rounded-xl my-1 font-bold">SUGGESTION</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Info className="h-3.5 w-3.5 text-blue-600" />
                                Specific Category
                            </Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-200 focus:border-blue-500 transition-all font-black text-xs uppercase tracking-widest">
                                    <SelectValue placeholder="CHOOSE CATEGORY" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200">
                                    {categories[type].map(c => (
                                        <SelectItem key={c} value={c} className="rounded-xl my-1 font-bold">{c.toUpperCase()}</SelectItem>
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
                                className="space-y-4 overflow-hidden"
                            >
                                <Label className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Assigned Faculty Name</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Enter full administrative name..."
                                        value={staffName}
                                        onChange={e => setStaffName(e.target.value)}
                                        className="h-16 rounded-2xl bg-white border-slate-200 focus:border-blue-500 pl-14 font-bold"
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
                                className="space-y-4 overflow-hidden"
                            >
                                <Label className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Custom Classification</Label>
                                <Input
                                    placeholder="State your unique category..."
                                    value={otherCategory}
                                    onChange={e => setOtherCategory(e.target.value)}
                                    className="h-16 rounded-2xl bg-white border-slate-200 focus:border-blue-500 font-bold"
                                    required
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4">
                        <Label className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Detailed Log Record</Label>
                        <Textarea
                            placeholder={`Provide technical details for this ${type.toLowerCase()}...`}
                            className="min-h-[160px] sm:min-h-[200px] rounded-[1.5rem] sm:rounded-[2rem] bg-white border-slate-200 focus:border-blue-500 p-6 sm:p-8 leading-relaxed text-base font-medium shadow-sm active:ring-2 active:ring-blue-500/10 transition-all"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {type === "Issue" && (
                        <div className="space-y-4">
                            <Label className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Supporting Documentation</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] p-8 sm:p-12 text-center hover:border-blue-500 transition-all cursor-pointer relative bg-slate-50/50 group overflow-hidden active:scale-[0.99]">
                                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/[0.02] transition-colors" />
                                <Input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                    multiple
                                    accept="image/*,video/*,.pdf"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length + attachments.length > 3) {
                                            toast({ title: "Audit limit exceeded: Max 3 files", variant: "destructive" });
                                            return;
                                        }
                                        setAttachments([...attachments, ...files]);
                                    }}
                                />
                                <div className="flex flex-col items-center group-hover:scale-105 transition-transform relative z-10">
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-slate-100 mb-4 sm:mb-6 group-hover:translate-y-[-4px] transition-transform">
                                        <Upload className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                                    </div>
                                    <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Synchronize Evidence</p>
                                    <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">JPG, PNG, MP4, PDF (LIMIT: 03)</p>
                                </div>
                            </div>

                            <AnimatePresence>
                                {attachments.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-wrap gap-4 mt-6"
                                    >
                                        {attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md">
                                                <div className="p-1 bg-blue-50 rounded-lg">
                                                    <FileText size={14} className="text-blue-600" />
                                                </div>
                                                <span className="truncate max-w-[140px] text-slate-600">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                                                    className="ml-2 p-1 hover:bg-red-50 rounded-lg group/del transition-colors"
                                                >
                                                    <X size={14} className="text-slate-400 group-hover/del:text-red-500 transition-colors" />
                                                </button>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="flex items-center space-x-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                        <Checkbox
                            id="anonymous"
                            checked={isAnonymous}
                            onCheckedChange={(v: any) => setIsAnonymous(v)}
                            className="rounded-lg h-6 w-6 border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-lg"
                        />
                        <div className="grid gap-1.5 relative z-10">
                            <label htmlFor="anonymous" className="text-xs font-black text-white cursor-pointer tracking-widest uppercase">
                                Identity Masking Protocol
                            </label>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                Enable cryptographic exclusion of PII from administrative sector recipients.
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-16 lg:h-20 text-[10px] lg:text-xs font-black bg-blue-600 hover:bg-blue-700 rounded-2xl lg:rounded-[1.5rem] shadow-2xl shadow-blue-500/20 group transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-4">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                    <Loader2 className="h-6 w-6" />
                                </motion.div>
                                <span>Synchronizing Payload...</span>
                            </div>
                        ) : (
                            <>
                                Finalize & Dispatch {type}
                                <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default SubmitIssue;
