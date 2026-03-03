import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FXBotIssue, fxbotAPI, Student } from "@/lib/api";
import { format, differenceInHours } from "date-fns";
import { AlertCircle, Clock, CheckCircle2, MessageSquare, ExternalLink, ShieldCheck, ChevronRight, Loader2, ShieldAlert, History, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HODDashboardProps {
    issues: FXBotIssue[];
    onRefresh: () => void;
    hodProfile: Student;
}

const HODDashboard = ({ issues, onRefresh, hodProfile }: HODDashboardProps) => {
    const [selectedIssue, setSelectedIssue] = useState<FXBotIssue | null>(null);
    const [directive, setDirective] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Pending": return <Clock className="h-4 w-4 text-amber-500" />;
            case "In Progress": return <Clock className="h-4 w-4 text-blue-500" />;
            case "Escalated": return <ShieldAlert className="h-4 w-4 text-red-500" />;
            case "Resolved": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            default: return null;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "In Progress": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Escalated": return "bg-red-50 text-red-700 border-red-200 animate-pulse";
            case "Resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const handleSendDirective = async () => {
        if (!selectedIssue || !directive) return;

        setIsLoading(true);
        try {
            await fxbotAPI.submitDirective(selectedIssue.id, directive);
            toast({ title: "Directive Sent", description: "Internal guidance has been added to the issue." });
            setSelectedIssue(null);
            setDirective("");
            onRefresh();
        } catch (error: any) {
            toast({ title: "Failed to send directive", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl border border-slate-100 group">
                        <img src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`} alt="FXBOT" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Administrative Command</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">BRANCH OVERVIEW - {hodProfile.department}</h2>
                    </div>
                </div>
                <Badge variant="outline" className="px-6 py-3 font-black text-[10px] text-blue-600 border-blue-200 bg-blue-50/50 rounded-2xl shadow-sm tracking-[0.1em]">
                    HOD ACCESS LEVEL • AUTHORIZED
                </Badge>
            </motion.div>

            <div className="space-y-6">
                {/* Desktop View - Table */}
                <div className="hidden md:block glass-card border-white/40 shadow-2xl rounded-[1.5rem] overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-200/60">
                                <TableHead className="w-[140px] font-bold text-slate-500 py-5 pl-8 uppercase tracking-wider text-[10px]">Registry Key</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Intelligence Context</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Aging Report</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                                <TableHead className="text-right pr-8 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Command</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <History className="h-8 w-8 opacity-20" />
                                            <p className="font-medium">No active synchronization found in this sector.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                issues.map((issue, idx) => {
                                    const age = differenceInHours(new Date(), new Date(issue.created_at));
                                    const isUnresolved = issue.status !== 'Resolved';
                                    const escalationTier = !isUnresolved ? 0 : age > 96 ? 2 : age > 48 ? 1 : 0;

                                    return (
                                        <motion.tr
                                            key={issue.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={cn(
                                                "hover:bg-blue-50/40 transition-colors border-slate-200/40 group",
                                                escalationTier === 1 && "bg-amber-50/20",
                                                escalationTier === 2 && "bg-red-50/20"
                                            )}
                                        >
                                            <TableCell className="font-mono font-black text-blue-600 pl-8">
                                                <div className="flex flex-col gap-1.5">
                                                    <span>{issue.id}</span>
                                                    {escalationTier > 0 && (
                                                        <span className={cn(
                                                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg w-fit shadow-sm border",
                                                            escalationTier === 1 ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-red-100 text-red-600 border-red-200"
                                                        )}>
                                                            {escalationTier === 1 ? "SECTOR REVIEW" : "COMMAND OVERSIGHT"}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 leading-none mb-1">{issue.type}</span>
                                                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[240px] italic">"{issue.description}"</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "font-black tracking-tight",
                                                        escalationTier === 1 ? "text-amber-600" :
                                                            escalationTier === 2 ? "text-red-600" : "text-slate-700"
                                                    )}>{age}h</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">In Pipeline</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("gap-1.5 px-3 py-1 rounded-full border shadow-sm font-bold text-[10px]", getStatusBadgeVariant(issue.status))}>
                                                    <span className="relative flex h-2 w-2">
                                                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", issue.status === 'Resolved' ? 'bg-emerald-400' : 'bg-current')}></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                                                    </span>
                                                    {issue.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedIssue(issue);
                                                        setDirective(issue.internal_directive || "");
                                                    }}
                                                    className="rounded-xl text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all gap-2 group"
                                                >
                                                    Oversight
                                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                    {issues.length === 0 ? (
                        <div className="glass-card p-12 text-center rounded-[2rem] border-white/40">
                            <History className="h-10 w-10 opacity-20 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sector Synchronized</p>
                        </div>
                    ) : (
                        issues.map((issue, idx) => {
                            const age = differenceInHours(new Date(), new Date(issue.created_at));
                            const isUnresolved = issue.status !== 'Resolved';
                            const escalationTier = !isUnresolved ? 0 : age > 96 ? 2 : age > 48 ? 1 : 0;

                            return (
                                <motion.div
                                    key={issue.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => {
                                        setSelectedIssue(issue);
                                        setDirective(issue.internal_directive || "");
                                    }}
                                    className={cn(
                                        "glass-card p-6 rounded-[2rem] border-white/40 shadow-xl active:scale-[0.98] transition-all relative overflow-hidden group",
                                        escalationTier === 1 && "bg-amber-50/10",
                                        escalationTier === 2 && "bg-red-50/10"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-mono font-black text-blue-600 text-xs tracking-tighter">{issue.id}</span>
                                            {escalationTier > 0 && (
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-md w-fit",
                                                    escalationTier === 1 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                                                )}>
                                                    Priority: {escalationTier === 1 ? "L1" : "L2"}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={cn("gap-1.5 px-3 py-1 rounded-full border font-bold text-[9px]", getStatusBadgeVariant(issue.status))}>
                                            {issue.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 mb-6">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{issue.type}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1 italic">"{issue.description}"</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Age</span>
                                                <span className={cn(
                                                    "text-xs font-bold",
                                                    escalationTier === 1 ? "text-amber-600" :
                                                        escalationTier === 2 ? "text-red-600" : "text-slate-600"
                                                )}>{age}h</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col rounded-[2.5rem] border-white/40 shadow-2xl glass-card p-0 overflow-hidden">
                    {selectedIssue && (
                        <>
                            <div className="bg-slate-900 p-10 text-white relative">
                                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                                                    <ShieldCheck className="h-5 w-5 text-white" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Tactical Oversight</span>
                                            </div>
                                            <DialogTitle className="text-4xl font-black tracking-tight uppercase leading-none">{selectedIssue.id}</DialogTitle>
                                        </div>
                                        <Badge className={cn("px-5 py-2.5 rounded-2xl border-2 font-black text-xs shadow-2xl", getStatusBadgeVariant(selectedIssue.status))}>
                                            {selectedIssue.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <DialogDescription className="text-slate-400 font-bold text-lg">
                                        Reviewing <span className="text-white underline decoration-blue-500/30 underline-offset-8">{selectedIssue.type}</span> synchronization for sector {hodProfile.department}.
                                    </DialogDescription>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto flex-1" data-lenis-prevent>
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-900">
                                        <div className="p-2 bg-slate-100 rounded-xl">
                                            <MessageSquare className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-xs">Primary Intelligence</h3>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/60 p-8 rounded-[2rem] text-slate-700 leading-relaxed whitespace-pre-wrap font-bold text-sm shadow-inner italic">
                                        "{selectedIssue.description}"
                                    </div>
                                </section>

                                {selectedIssue.attachments && selectedIssue.attachments.length > 0 && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-3 text-blue-600">
                                            <div className="p-2 bg-blue-50 rounded-xl">
                                                <ExternalLink className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs text-blue-600">Supporting Evidence</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {selectedIssue.attachments.map((url, i) => {
                                                const isVideo = url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('video');
                                                const isPdf = url.toLowerCase().includes('.pdf');

                                                if (isVideo) {
                                                    return (
                                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video hover:border-blue-500 transition-colors">
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors z-10 text-white font-bold text-xs uppercase tracking-widest gap-2">
                                                                ▶ Play Video
                                                            </div>
                                                            <video src={url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        </a>
                                                    );
                                                }
                                                if (isPdf) {
                                                    return (
                                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-center h-full min-h-[120px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50 transition-colors group">
                                                            <div className="text-center group-hover:scale-105 transition-transform">
                                                                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                                                <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">View PDF Document</span>
                                                            </div>
                                                        </a>
                                                    );
                                                }

                                                return (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-slate-200 hover:border-blue-500 transition-colors group aspect-video bg-slate-100">
                                                        <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 text-red-600">
                                        <div className="p-2 bg-red-50 rounded-xl border border-red-100/50">
                                            <AlertCircle className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-xs">Administrative Directive</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="directive" className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Guidance for faculty-led synchronization</Label>
                                            <Textarea
                                                id="directive"
                                                placeholder="Enter authoritative guidance or specific instructions for assigned sector personnel..."
                                                value={directive}
                                                onChange={(e) => setDirective(e.target.value)}
                                                className="min-h-[140px] rounded-[1.5rem] bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all p-6 text-base font-medium shadow-sm"
                                            />
                                        </div>
                                        <Button
                                            className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest transition-all shadow-2xl active:scale-[0.98] text-xs"
                                            onClick={handleSendDirective}
                                            disabled={isLoading || !directive}
                                        >
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Internal Directive"}
                                        </Button>
                                    </div>
                                </section>

                                {selectedIssue.resolution_message && (
                                    <section className="pt-10 border-t border-slate-100">
                                        <div className="flex items-center gap-3 text-emerald-600 mb-6">
                                            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs">Sector Action Audit</h3>
                                        </div>
                                        <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] text-emerald-900 border border-emerald-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute -top-2 -right-2 p-4">
                                                <CheckCircle2 className="h-16 w-16 text-emerald-500/10" />
                                            </div>
                                            <p className="font-bold text-lg leading-relaxed">{selectedIssue.resolution_message}</p>
                                        </div>
                                    </section>
                                )}
                            </div>

                            <DialogFooter className="bg-slate-50 p-8 border-t border-slate-100 shrink-0">
                                <Button variant="ghost" onClick={() => setSelectedIssue(null)} className="h-14 rounded-2xl px-12 font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-white transition-all">Dismiss Commander Interface</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HODDashboard;
