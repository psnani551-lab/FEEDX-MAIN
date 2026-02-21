import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FXBotIssue, fxbotAPI, Student } from "@/lib/api";
import { format, differenceInHours } from "date-fns";
import { AlertCircle, Clock, CheckCircle2, MessageSquare, ExternalLink, ChevronRight, Loader2, ShieldAlert, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FacultyDashboardProps {
    issues: FXBotIssue[];
    onRefresh: () => void;
    facultyProfile: Student;
}

const FacultyDashboard = ({ issues, onRefresh, facultyProfile }: FacultyDashboardProps) => {
    const [selectedIssue, setSelectedIssue] = useState<FXBotIssue | null>(null);
    const [resolution, setResolution] = useState("");
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

    const handleUpdateStatus = async (status: string) => {
        if (!selectedIssue) return;

        setIsLoading(true);
        try {
            await fxbotAPI.updateIssueStatus(selectedIssue.id, status, status === "Resolved" ? resolution : undefined);
            toast({ title: `Issue ${status}`, description: `Status updated successfully.` });
            setSelectedIssue(null);
            setResolution("");
            onRefresh();
        } catch (error: any) {
            toast({ title: "Update failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass-card border-white/40 shadow-2xl rounded-[1.5rem] overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-200/60">
                            <TableHead className="w-[140px] font-bold text-slate-500 py-5 pl-8 uppercase tracking-wider text-[10px]">Reference</TableHead>
                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Core Classification</TableHead>
                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Recipient</TableHead>
                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Aging Report</TableHead>
                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                            <TableHead className="text-right pr-8 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Navigation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issues.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden grayscale opacity-30 shadow-inner">
                                            <img src="/fxbot-logo.jpg" alt="FXBOT" className="w-full h-full object-cover" />
                                        </div>
                                        <p className="font-medium">No pending feedback detected in your sector.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            issues.map((issue, idx) => {
                                const age = differenceInHours(new Date(), new Date(issue.created_at || ''));
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
                                                    <motion.span
                                                        initial={{ scale: 0.9 }}
                                                        animate={{ scale: 1 }}
                                                        className={cn(
                                                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg w-fit shadow-sm",
                                                            escalationTier === 1 ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-red-100 text-red-600 border border-red-200"
                                                        )}>
                                                        {escalationTier === 1 ? "DEPT REVIEW" : "INSTITUTIONAL"}
                                                    </motion.span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 leading-none mb-1">{issue.type}</span>
                                                <span className="text-[11px] text-slate-400 font-medium">{issue.category}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-bold text-[10px] bg-slate-50 border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg shadow-sm">
                                                {issue.whom_to_send}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "font-black tracking-tight",
                                                    escalationTier === 1 ? "text-amber-600" :
                                                        escalationTier === 2 ? "text-red-600" : "text-slate-600"
                                                )}>{age}h ago</span>
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
                                                onClick={() => setSelectedIssue(issue)}
                                                className="rounded-xl text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all gap-2 group"
                                            >
                                                Manage
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

            <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] border-white/40 shadow-2xl glass-card p-0 overflow-hidden">
                    {selectedIssue && (
                        <>
                            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <Badge className="bg-blue-600 text-white border-none px-3 py-1 mb-3 text-[10px] font-black tracking-widest shadow-lg shadow-blue-500/20">
                                                PROTOCOL: {selectedIssue.id}
                                            </Badge>
                                            <DialogTitle className="text-4xl font-black tracking-tight leading-none">{selectedIssue.type}</DialogTitle>
                                            <DialogDescription className="text-slate-400 font-bold mt-2 flex items-center gap-2">
                                                <ShieldAlert className="h-4 w-4 text-blue-500" />
                                                DEPT: {facultyProfile.department} • CAT: {selectedIssue.category}
                                            </DialogDescription>
                                        </div>
                                        <Badge className={cn("px-4 py-2 rounded-2xl border-2 font-black text-xs shadow-xl", getStatusBadgeVariant(selectedIssue.status))}>
                                            {selectedIssue.status.toUpperCase()}
                                        </Badge>
                                    </div>

                                    {selectedIssue.status !== 'Resolved' && differenceInHours(new Date(), new Date(selectedIssue.created_at || '')) > 24 && (
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="bg-amber-100/10 backdrop-blur-md rounded-2xl p-4 border border-amber-500/20 flex items-center gap-3"
                                        >
                                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                                            <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">Advisory: Pending review nearing administrative escalation thresholds.</span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-900">
                                        <div className="p-2 bg-slate-100 rounded-xl">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-xs">Submission Metadata</h3>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/60 p-8 rounded-[2rem] text-slate-700 leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
                                        {selectedIssue.description}
                                    </div>
                                </section>

                                {selectedIssue.internal_directive && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-3 text-red-600">
                                            <div className="p-2 bg-red-50 rounded-xl">
                                                <ShieldAlert className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs text-red-600">Administrative Directive</h3>
                                        </div>
                                        <div className="bg-red-50/40 p-8 rounded-[2rem] text-red-800 leading-relaxed whitespace-pre-wrap border border-red-100 italic font-bold text-sm shadow-sm ring-1 ring-red-200">
                                            "{selectedIssue.internal_directive}"
                                        </div>
                                    </section>
                                )}

                                {selectedIssue.status !== "Resolved" && (
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3 text-emerald-600">
                                            <div className="p-2 bg-emerald-50 rounded-xl">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs text-emerald-600">Execution Block</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="resolution" className="text-slate-700 text-sm font-bold ml-1">Resolution Protocol Record</Label>
                                                <Textarea
                                                    id="resolution"
                                                    placeholder="State the technical and administrative steps taken..."
                                                    value={resolution}
                                                    onChange={(e) => setResolution(e.target.value)}
                                                    className="min-h-[160px] rounded-[1.5rem] bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all p-6 text-base"
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <Button
                                                    className="flex-1 h-16 rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-black uppercase tracking-widest transition-all text-xs"
                                                    onClick={() => handleUpdateStatus("In Progress")}
                                                    disabled={isLoading || selectedIssue.status === "In Progress"}
                                                >
                                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initiate Review"}
                                                </Button>
                                                <Button
                                                    className="flex-1 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 text-xs"
                                                    onClick={() => handleUpdateStatus("Resolved")}
                                                    disabled={isLoading || !resolution}
                                                >
                                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Finalize Protocol"}
                                                </Button>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {selectedIssue.status === "Resolved" && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-3 text-emerald-600">
                                            <div className="p-2 bg-emerald-50 rounded-xl">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs text-emerald-600">Post-Action Audit</h3>
                                        </div>
                                        <div className="bg-emerald-50/50 p-8 rounded-[2rem] text-emerald-900 border border-emerald-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4">
                                                <CheckCircle2 className="h-12 w-12 text-emerald-500/20" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase text-emerald-600 mb-3 tracking-widest">Resolution Finalized on {selectedIssue.resolved_at ? format(new Date(selectedIssue.resolved_at), "MMM dd, yyyy") : "N/A"}</p>
                                            <p className="font-bold text-lg leading-relaxed">{selectedIssue.resolution_message}</p>
                                        </div>
                                    </section>
                                )}
                            </div>

                            <DialogFooter className="bg-slate-50 p-8 border-t border-slate-100">
                                <Button variant="ghost" onClick={() => setSelectedIssue(null)} className="h-14 rounded-2xl px-10 font-bold text-slate-500 hover:bg-white transition-all">Dismiss Interface</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FacultyDashboard;
