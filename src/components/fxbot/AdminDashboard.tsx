import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FXBotIssue, Student, fxbotAPI } from "@/lib/api";
import { format, differenceInHours } from "date-fns";
import {
    AlertTriangle, Clock, CheckCircle2, TrendingUp, ShieldAlert,
    Loader2, User, Phone, Hash, CalendarClock, Building2, FileText,
    MessageSquare, ChevronRight, Database, Activity, ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AdminDashboardProps {
    issues: FXBotIssue[];
    onRefresh: () => void;
    adminProfile: Student;
}

// Extended issue type that includes joined student data (loaded on-demand)
interface IssueWithIdentity extends FXBotIssue {
    _studentData?: Student | null;
    _identityLoaded?: boolean;
}

const AdminDashboard = ({ issues, onRefresh, adminProfile }: AdminDashboardProps) => {
    const [selectedIssue, setSelectedIssue] = useState<IssueWithIdentity | null>(null);
    const [identityLoading, setIdentityLoading] = useState(false);

    // Stats
    const stats = useMemo(() => ({
        total: issues.length,
        pending: issues.filter(i => i.status === 'Pending').length,
        inProgress: issues.filter(i => i.status === 'In Progress').length,
        resolved: issues.filter(i => i.status === 'Resolved').length,
        escalated: issues.filter(i => i.status === 'Escalated').length,
        critical: issues.filter(i => differenceInHours(new Date(), new Date(i.created_at)) > 96 && i.status !== 'Resolved').length,
    }), [issues]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "In Progress": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Escalated": return "bg-red-50 text-red-700 border-red-200 animate-pulse";
            case "Resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    // When clicking a row, load full identity from students table
    const handleSelectIssue = async (issue: FXBotIssue) => {
        const extended: IssueWithIdentity = { ...issue };
        setSelectedIssue(extended);

        if (!extended._identityLoaded) {
            setIdentityLoading(true);
            try {
                const profile = await fxbotAPI.getStudentById(issue.student_id);
                setSelectedIssue(prev => prev
                    ? { ...prev, _studentData: profile, _identityLoaded: true }
                    : null
                );
            } catch (err) {
                toast({ title: "Could not load issuer identity", variant: "destructive" });
            } finally {
                setIdentityLoading(false);
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-red-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-red-500/30">
                        <Database className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">System Administrator</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">ADMIN CONTROL</h2>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Full identity & audit access — CONFIDENTIAL</p>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: "Total", value: stats.total, color: "bg-slate-100 text-slate-700" },
                        { label: "Pending", value: stats.pending, color: "bg-amber-50 text-amber-700" },
                        { label: "Resolved", value: stats.resolved, color: "bg-emerald-50 text-emerald-700" },
                        { label: "Critical", value: stats.critical, color: "bg-red-50 text-red-700" },
                    ].map(stat => (
                        <div key={stat.label} className={cn("px-5 py-3 rounded-2xl font-black text-center shadow-sm border border-white/60", stat.color)}>
                            <p className="text-2xl leading-none">{stat.value}</p>
                            <p className="text-[9px] uppercase tracking-widest mt-1 opacity-70">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="space-y-6">
                {/* Desktop View - Table */}
                <div className="hidden md:block glass-card border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="px-8 py-6 bg-red-50/40 border-b border-red-100/60 flex items-center gap-3">
                        <Activity className="h-4 w-4 text-red-600" />
                        <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs">COMPLETE ISSUE REGISTRY — WITH IDENTITY</h3>
                    </div>
                    <Table>
                        <TableHeader className="bg-slate-50/30">
                            <TableRow className="hover:bg-transparent border-slate-200/60">
                                <TableHead className="w-[130px] font-bold text-slate-500 py-4 pl-8 uppercase tracking-wider text-[10px]">FXID</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Issuer (Student ID)</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Dept · Type</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Faculty Solver</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Submitted</TableHead>
                                <TableHead className="text-right pr-8 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Audit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center text-slate-400 font-medium">
                                        No issues in the system.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                issues.map((issue, idx) => {
                                    const age = differenceInHours(new Date(), new Date(issue.created_at));
                                    const isCritical = age > 96 && issue.status !== 'Resolved';
                                    return (
                                        <motion.tr
                                            key={issue.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className={cn("hover:bg-red-50/20 transition-colors border-slate-200/40 group", isCritical && "bg-red-50/20")}
                                        >
                                            <TableCell className="font-mono font-black text-red-600 pl-8 text-xs">{issue.id}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-slate-900 text-sm">{issue.student_id}</span>
                                                    {issue.is_anonymous && (
                                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Anonymous</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className="font-black text-[10px] border-slate-200 bg-white/50 text-slate-500 px-2 py-0.5 rounded-lg w-fit">
                                                        {issue.department}
                                                    </Badge>
                                                    <span className="text-[10px] text-slate-400 font-semibold">{issue.type} · {issue.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("gap-1 px-2 py-0.5 rounded-full border font-bold text-[10px]", getStatusVariant(issue.status))}>
                                                    {issue.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-semibold text-slate-600">
                                                    {issue.staff_name || <span className="text-slate-300 italic text-xs">Unassigned</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className={cn("text-xs font-black", isCritical ? "text-red-600" : "text-slate-700")}>
                                                        {age}h ago
                                                    </span>
                                                    <span className="text-[9px] text-slate-400">
                                                        {format(new Date(issue.created_at), "MMM dd, HH:mm")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSelectIssue(issue)}
                                                    className="rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View - Card Stack */}
                <div className="md:hidden space-y-4">
                    <div className="flex flex-col gap-2 mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-red-600" />
                            <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Administrative Audit Logs</h3>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Confidential System Records</p>
                    </div>
                    {issues.length === 0 ? (
                        <div className="glass-card p-12 text-center rounded-[2rem] border-red-100/40">
                            <ShieldAlert className="h-10 w-10 opacity-20 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No Data Detected</p>
                        </div>
                    ) : (
                        issues.map((issue, idx) => {
                            const age = differenceInHours(new Date(), new Date(issue.created_at));
                            const isCritical = age > 96 && issue.status !== 'Resolved';

                            return (
                                <motion.div
                                    key={issue.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleSelectIssue(issue)}
                                    className={cn(
                                        "glass-card p-6 rounded-[2rem] border-white/40 shadow-xl active:scale-[0.98] transition-all relative overflow-hidden group",
                                        isCritical && "bg-red-50/10 border-red-200/50"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-mono font-black text-red-600 text-[10px] tracking-tighter">{issue.id}</span>
                                            {issue.is_anonymous && (
                                                <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-md w-fit bg-slate-900 text-white">
                                                    ANONYMOUS
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={cn("gap-1.5 px-3 py-1 rounded-full border font-bold text-[9px]", getStatusVariant(issue.status))}>
                                            {issue.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-black text-[9px] border-slate-200 bg-white/50 text-slate-500 px-2 py-0.5 rounded-lg shadow-sm">
                                                {issue.department}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{issue.student_id}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase truncate">{issue.type}</h3>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Age</span>
                                                <span className={cn("text-xs font-black", isCritical ? "text-red-600" : "text-slate-600")}>{age}h</span>
                                            </div>
                                            <div className="h-6 w-[1px] bg-slate-100" />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Solver</span>
                                                <span className="text-xs font-bold text-slate-600 truncate max-w-[80px]">{issue.staff_name || "—"}</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Detail Dialog — Full Identity */}
            <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
                <DialogContent className="max-w-2xl w-[95vw] md:w-full rounded-[2.5rem] border-white/40 shadow-2xl glass-card p-0 overflow-hidden outline-none">
                    {selectedIssue && (
                        <>
                            <div className="bg-slate-900 p-8 md:p-10 text-white relative overflow-hidden">
                                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <Badge className="bg-red-600 text-white border-none px-2 py-0.5 text-[8px] md:text-[10px] font-black tracking-widest">
                                            ADMIN AUDIT · {selectedIssue.id}
                                        </Badge>
                                        <Badge className={cn("px-2 py-0.5 text-[8px] md:text-[10px] font-black border", getStatusVariant(selectedIssue.status))}>
                                            {selectedIssue.status}
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
                                        {selectedIssue.type}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-400 font-bold flex items-center gap-2 text-[10px] md:text-xs">
                                        <Building2 className="h-3.5 w-3.5 text-red-400" />
                                        {selectedIssue.department} · {format(new Date(selectedIssue.created_at), "MMM dd, yyyy HH:mm")}
                                    </DialogDescription>
                                </div>
                            </div>

                            {/* Body — no scroll, compact */}
                            <div className="p-6 md:p-8 space-y-6 md:space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar" data-lenis-prevent>

                                {/* ── Issuer Identity (Admin Only) ── */}
                                <section className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-red-50 rounded-xl border border-red-100">
                                            <User className="h-4 w-4 text-red-600" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-xs text-red-600">Issuer Identity — Admin Only</h3>
                                    </div>
                                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-3">
                                        {identityLoading ? (
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm font-medium">Loading identity...</span>
                                            </div>
                                        ) : selectedIssue._studentData ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-red-400 shrink-0" />
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Full Name</p>
                                                        <p className="font-bold text-slate-900">
                                                            {selectedIssue._studentData.full_name}
                                                            {selectedIssue.is_anonymous && <span className="ml-2 text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Anon</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-red-400 shrink-0" />
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Mobile</p>
                                                        <p className="font-bold text-slate-900">{selectedIssue._studentData.mobile || "—"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Hash className="h-4 w-4 text-red-400 shrink-0" />
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">PIN / Roll No</p>
                                                        <p className="font-bold text-slate-900 font-mono">{selectedIssue._studentData.pin || "—"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-red-400 shrink-0" />
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Branch</p>
                                                        <p className="font-bold text-slate-900">{selectedIssue._studentData.department}</p>
                                                    </div>
                                                </div>
                                                {/* Email — full width */}
                                                <div className="flex items-center gap-2 col-span-2">
                                                    <MessageSquare className="h-4 w-4 text-red-400 shrink-0" />
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Email</p>
                                                        <p className="font-bold text-slate-900">{selectedIssue._studentData.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Fallback: student completed OTP but never finished profile setup */
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-amber-600 mb-3">
                                                    <ShieldAlert className="h-4 w-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Incomplete Profile — Auth account exists, no student record</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">System UID</p>
                                                        <p className="font-mono text-xs font-bold text-slate-700 break-all">{selectedIssue.student_id}</p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Dept (from issue)</p>
                                                        <p className="font-bold text-slate-900">{selectedIssue.department}</p>
                                                    </div>
                                                    {selectedIssue.is_anonymous && (
                                                        <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 col-span-2">
                                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Submitted anonymously — name not disclosed by student</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* ── Issue Content ── */}
                                <section className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-slate-100 rounded-lg">
                                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-xs">Issue Description</h3>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-slate-700 text-sm leading-relaxed font-medium">
                                        {selectedIssue.description}
                                    </div>
                                </section>

                                {selectedIssue.attachments && selectedIssue.attachments.length > 0 && (
                                    <section className="space-y-2">
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <div className="p-1.5 bg-blue-50 rounded-lg">
                                                <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs text-blue-600">Supporting Evidence</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                                            {selectedIssue.attachments.map((url, i) => {
                                                const isVideo = url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('video');
                                                const isPdf = url.toLowerCase().includes('.pdf');

                                                if (isVideo) {
                                                    return (
                                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video hover:border-blue-500 transition-colors">
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors z-10 text-white font-bold text-[10px] uppercase tracking-widest gap-2">
                                                                ▶ Play
                                                            </div>
                                                            <video src={url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        </a>
                                                    );
                                                }
                                                if (isPdf) {
                                                    return (
                                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-center h-full min-h-[100px] rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50 transition-colors group">
                                                            <div className="text-center group-hover:scale-105 transition-transform">
                                                                <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1.5" />
                                                                <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">View PDF</span>
                                                            </div>
                                                        </a>
                                                    );
                                                }

                                                return (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200 hover:border-blue-500 transition-colors group aspect-video bg-slate-100">
                                                        <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* ── HOD Directive ── */}
                                {selectedIssue.internal_directive && (
                                    <section className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-100">
                                                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs text-amber-600">HOD Directive</h3>
                                        </div>
                                        <div className="bg-amber-50/50 p-3 rounded-xl text-amber-900 border border-amber-100 italic font-bold text-sm">
                                            "{selectedIssue.internal_directive}"
                                        </div>
                                    </section>
                                )}

                                {/* ── Faculty Resolution ── */}
                                {selectedIssue.resolution_message && (
                                    <section className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs text-emerald-600">Faculty Resolution</h3>
                                        </div>
                                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-sm text-emerald-900">
                                            <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1">
                                                By: {selectedIssue.staff_name || "Unknown"} · {selectedIssue.resolved_at ? format(new Date(selectedIssue.resolved_at), "MMM dd, yyyy HH:mm") : ""}
                                            </p>
                                            <p className="font-bold">{selectedIssue.resolution_message}</p>
                                        </div>
                                    </section>
                                )}

                                {/* ── Timestamps ── */}
                                <section className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-slate-100 rounded-lg">
                                            <CalendarClock className="h-3.5 w-3.5 text-slate-600" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-xs">Timestamps</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: "Submitted", value: format(new Date(selectedIssue.created_at), "MMM dd, yyyy") + "\n" + format(new Date(selectedIssue.created_at), "HH:mm") },
                                            { label: "Updated", value: format(new Date(selectedIssue.updated_at), "MMM dd, yyyy") + "\n" + format(new Date(selectedIssue.updated_at), "HH:mm") },
                                            { label: "Resolved", value: selectedIssue.resolved_at ? format(new Date(selectedIssue.resolved_at), "MMM dd, yyyy") + "\n" + format(new Date(selectedIssue.resolved_at), "HH:mm") : "—" },
                                        ].map(ts => (
                                            <div key={ts.label} className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{ts.label}</p>
                                                <p className="text-xs font-bold text-slate-900 whitespace-pre-line leading-tight">{ts.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedIssue(null)}
                                    className="h-9 rounded-xl px-6 font-bold text-slate-500 hover:bg-white transition-all text-sm"
                                >
                                    Close Audit View
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;
