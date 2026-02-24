import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FXBotIssue, fxbotAPI } from "@/lib/api";
import { format } from "date-fns";
import { AlertCircle, Clock, CheckCircle2, ArrowUpRight, MessageSquare, History, ShieldAlert, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TrackIssuesProps {
    issues: FXBotIssue[];
    onRefresh: () => void;
}

const TrackIssues = ({ issues, onRefresh }: TrackIssuesProps) => {
    const [selectedIssue, setSelectedIssue] = useState<FXBotIssue | null>(null);
    const [isEscalateOpen, setIsEscalateOpen] = useState(false);
    const [escalateTo, setEscalateTo] = useState("");
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Pending": return <Clock className="h-3.5 w-3.5" />;
            case "In Progress": return <Clock className="h-3.5 w-3.5" />;
            case "Escalated": return <ShieldAlert className="h-3.5 w-3.5" />;
            case "Resolved": return <CheckCircle2 className="h-3.5 w-3.5" />;
            default: return null;
        }
    };

    const getStatusColorClass = (status: string) => {
        switch (status) {
            case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "In Progress": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Escalated": return "bg-red-50 text-red-700 border-red-200 animate-pulse";
            case "Resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const checkCanEscalate = (issue: FXBotIssue) => {
        if (issue.status !== "Pending" && issue.status !== "In Progress") return false;
        const createdAt = new Date(issue.created_at || "");
        const now = new Date();
        const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        return diffInHours >= 48;
    };

    const handleEscalate = async () => {
        if (!selectedIssue || !escalateTo || !reason) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await fxbotAPI.escalateIssue(selectedIssue.id, escalateTo);
            toast({ title: "Issue Escalated", description: `Successfully escalated to ${escalateTo}` });
            setIsEscalateOpen(false);
            setSelectedIssue(null);
            onRefresh();
        } catch (error: any) {
            toast({ title: "Escalation failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                {/* Desktop View - Table */}
                <div className="hidden md:block glass-card border-white/40 shadow-2xl rounded-[1.5rem] overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-200/60">
                                <TableHead className="font-bold text-slate-500 py-5 pl-8 uppercase tracking-wider text-[10px]">Reference ID</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Classification</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Timestamp</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                                <TableHead className="text-right pr-8 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Navigation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <History className="h-8 w-8 opacity-20" />
                                            <p className="font-medium">No active synchronization found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                issues.map((issue, idx) => (
                                    <motion.tr
                                        key={issue.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-blue-50/30 transition-colors border-slate-200/40 group"
                                    >
                                        <TableCell className="font-mono font-bold text-blue-600 pl-8">{issue.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 leading-none mb-1">{issue.type}</span>
                                                <span className="text-[11px] text-slate-400 font-medium">{issue.category}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-slate-500">
                                            {issue.created_at ? format(new Date(issue.created_at), "MMM dd, HH:mm") : "---"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("gap-1.5 px-3 py-1 rounded-full border shadow-sm font-bold text-[10px]", getStatusColorClass(issue.status))}>
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
                                                    if (navigator.vibrate) navigator.vibrate(5);
                                                    setSelectedIssue(issue);
                                                }}
                                                className="gap-2 rounded-xl text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all overflow-hidden"
                                            >
                                                Track
                                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </TableCell>
                                    </motion.tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View - Card Stack */}
                <div className="md:hidden space-y-4">
                    {issues.length === 0 ? (
                        <div className="glass-card p-12 text-center rounded-[2rem] border-white/40">
                            <History className="h-10 w-10 opacity-20 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Vault Empty</p>
                        </div>
                    ) : (
                        issues.map((issue, idx) => (
                            <motion.div
                                key={issue.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => {
                                    if (navigator.vibrate) navigator.vibrate(10);
                                    setSelectedIssue(issue);
                                }}
                                className="glass-card p-6 rounded-[2rem] border-white/40 shadow-xl active:scale-[0.98] transition-all relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-mono font-black text-blue-600 text-sm tracking-tighter">{issue.id}</span>
                                    <Badge className={cn("gap-1.5 px-3 py-1 rounded-full border font-bold text-[9px]", getStatusColorClass(issue.status))}>
                                        {issue.status}
                                    </Badge>
                                </div>
                                <div className="space-y-1 mb-4">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{issue.type}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">{issue.category}</p>
                                </div>
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged At</span>
                                        <span className="text-xs font-bold text-slate-600">{issue.created_at ? format(new Date(issue.created_at), "MMM dd, HH:mm") : "---"}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Track Status Dialog */}
                <Dialog open={!!selectedIssue && !isEscalateOpen} onOpenChange={(open) => !open && setSelectedIssue(null)}>
                    <DialogContent className="max-w-md max-h-[90vh] flex flex-col rounded-[2rem] border-white/40 shadow-2xl glass-card p-0 overflow-hidden">
                        {selectedIssue && (
                            <>
                                <div className="p-8 bg-slate-50/50 border-b border-slate-200/50">
                                    <Badge variant="outline" className="mb-4 bg-white border-blue-100 text-blue-600 font-black tracking-widest text-[9px] px-2 py-0.5">INTEL-ID: {selectedIssue.id}</Badge>
                                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Track Pipeline</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium">
                                        Current processing state for <span className="text-slate-900 font-bold">{selectedIssue.category}</span> request.
                                    </DialogDescription>
                                </div>

                                <div className="px-8 py-8 space-y-8 overflow-y-auto flex-1">
                                    {/* Timeline Visualization */}
                                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-600/30 before:via-blue-600/30 before:to-transparent">
                                        <div className="relative flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 z-10 border-2 border-white">
                                                    <MessageSquare className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-wide">Initialized</p>
                                                    <p className="text-xs text-slate-400 font-medium">{format(new Date(selectedIssue.created_at || ""), "MMM dd, yyyy @ HH:mm")}</p>
                                                </div>
                                            </div>
                                            {checkCanEscalate(selectedIssue) && (
                                                <Button size="sm" variant="destructive" onClick={() => setIsEscalateOpen(true)} className="h-8 rounded-lg font-bold text-[10px] px-3">
                                                    <AlertCircle className="h-3 w-3 mr-1.5" />
                                                    Escalate
                                                </Button>
                                            )}
                                        </div>

                                        <div className={cn("relative flex items-center justify-between gap-4 transition-opacity", selectedIssue.status === "Pending" && "opacity-30")}>
                                            <div className="flex items-center gap-4">
                                                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl z-10 border-2 border-white transition-all shadow-xl", selectedIssue.status !== "Pending" ? "bg-blue-600 text-white shadow-blue-500/20" : "bg-white text-slate-300 shadow-slate-200/50")}>
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-wide">Processing</p>
                                                    <p className="text-xs text-slate-400 font-medium">
                                                        {selectedIssue.status === "Pending" ? "Awaiting administrative slot" : `Currently handled by ${selectedIssue.whom_to_send}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={cn("relative flex items-center justify-between gap-4 transition-opacity", selectedIssue.status !== "Resolved" && "opacity-30")}>
                                            <div className="flex items-center gap-4">
                                                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl z-10 border-2 border-white transition-all shadow-xl", selectedIssue.status === "Resolved" ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-white text-slate-300 shadow-slate-200/50")}>
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-wide">Synchronized</p>
                                                    <p className="text-xs text-slate-400 font-medium">
                                                        {selectedIssue.status === "Resolved" ? "Finalized and verified" : "Awaiting resolution trigger"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Log Record</p>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedIssue.description}</p>
                                    </div>

                                    {selectedIssue.status === "Escalated" && (
                                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 shadow-lg shadow-red-500/5">
                                            <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 animate-pulse" />
                                            <div>
                                                <p className="text-xs font-black text-red-600 uppercase tracking-widest">Urgent Protocol Active</p>
                                                <p className="text-sm text-slate-600 font-medium">Escalated to {selectedIssue.whom_to_send}. Priority queueing enabled.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 pt-0 shrink-0">
                                    <Button
                                        onClick={() => setSelectedIssue(null)}
                                        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold"
                                    >
                                        Dismiss Record
                                    </Button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Escalate Dialog */}
                <Dialog open={isEscalateOpen} onOpenChange={setIsEscalateOpen}>
                    <DialogContent className="max-w-md max-h-[90vh] flex flex-col rounded-[2.5rem] border-white/40 shadow-2xl glass-card p-8 overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                                <ShieldAlert className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Escalation Protocol</DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium">Elevating issue {selectedIssue?.id} to senior administration.</DialogDescription>
                            </div>
                        </div>

                        <div className="space-y-6 py-4">
                            <div className="space-y-3">
                                <Label className="text-slate-700 text-sm font-bold ml-1">Administrative Target</Label>
                                <Select value={escalateTo} onValueChange={setEscalateTo}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 transition-all font-semibold">
                                        <SelectValue placeholder="Select target authority" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="Principal" className="rounded-xl">Principal Command</SelectItem>
                                        <SelectItem value="HOD" className="rounded-xl">Departmental Head</SelectItem>
                                        <SelectItem value="Admin" className="rounded-xl">System Infrastructure</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-slate-700 text-sm font-bold ml-1">Grounds for Escalation</Label>
                                <Textarea
                                    placeholder="State high-priority justification..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="min-h-[120px] rounded-2xl bg-white border-slate-200 focus:border-red-500 p-4"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-3 sm:justify-center">
                            <Button variant="ghost" onClick={() => setIsEscalateOpen(false)} className="h-14 rounded-2xl font-bold flex-1">Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={handleEscalate}
                                disabled={isLoading}
                                className="h-14 rounded-2xl font-black flex-1 bg-red-600 shadow-xl shadow-red-500/20"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Escalation"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default TrackIssues;
