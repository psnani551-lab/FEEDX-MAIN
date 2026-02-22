import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FXBotIssue, Student } from "@/lib/api";
import { format, differenceInHours } from "date-fns";
import { AlertTriangle, Clock, CheckCircle2, LayoutDashboard, ExternalLink, Globe, TrendingUp, ShieldCheck, ChevronRight, Activity, FileText, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PrincipalDashboardProps {
    issues: FXBotIssue[];
    onRefresh: () => void;
    principalProfile: Student;
}

const PrincipalDashboard = ({ issues, onRefresh, principalProfile }: PrincipalDashboardProps) => {
    const [selectedIssue, setSelectedIssue] = useState<FXBotIssue | null>(null);

    // Calculate Branch-wise Stats
    const branchStats = useMemo(() => {
        const stats: Record<string, { total: number; resolved: number; escalated: number }> = {};
        issues.forEach(issue => {
            const dept = issue.department || 'UNKNOWN';
            if (!stats[dept]) stats[dept] = { total: 0, resolved: 0, escalated: 0 };
            stats[dept].total++;
            if (issue.status === 'Resolved') stats[dept].resolved++;
            if (differenceInHours(new Date(), new Date(issue.created_at)) > 96) stats[dept].escalated++;
        });
        return stats;
    }, [issues]);

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "In Progress": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Escalated": return "bg-red-50 text-red-700 border-red-200 animate-pulse";
            case "Resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="space-y-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
            >
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center overflow-hidden shadow-2xl border border-slate-100 p-0.5 group">
                        <img src={`${import.meta.env.BASE_URL}fxbot-logo.jpg`} alt="FXBOT" className="w-full h-full object-cover rounded-[1.8rem] group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Institutional Executive Command</span>
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">ADMINISTRATION</h2>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="glass-card bg-white/60 p-5 rounded-3xl border border-white/40 shadow-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1.5">Resolved Metrics</p>
                            <p className="text-3xl font-black text-slate-900 leading-none">{issues.filter(i => i.status === 'Resolved').length}</p>
                        </div>
                    </div>
                    <div className="glass-card bg-white/60 p-5 rounded-3xl border border-white/40 shadow-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1.5">Priority Queue</p>
                            <p className="text-3xl font-black text-slate-900 leading-none">{issues.filter(i => differenceInHours(new Date(), new Date(i.created_at)) > 96).length}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Branch-wise Health Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Object.entries(branchStats).map(([dept, data], idx) => {
                    const health = Math.round((data.resolved / data.total) * 100) || 0;
                    return (
                        <motion.div
                            key={dept}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card bg-white/40 p-8 rounded-[2rem] border border-white/40 shadow-2xl hover:shadow-blue-500/5 transition-all group overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Activity className="h-24 w-24 text-blue-600" />
                            </div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{dept} BRANCH</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sector Performance</p>
                                </div>
                                <Badge className={cn("rounded-xl px-3 py-1 font-black text-[10px] shadow-sm", health > 70 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200")}>
                                    {health}% HEALTH
                                </Badge>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="h-4 w-full bg-slate-100/50 rounded-full overflow-hidden p-1 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${health}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={cn("h-full rounded-full transition-all shadow-lg", health > 70 ? "bg-emerald-500" : "bg-amber-500")}
                                    />
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-slate-900">{data.total}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Syncs</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={cn("text-2xl font-black", data.escalated > 0 ? "text-red-600" : "text-slate-400")}>{data.escalated}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Violations</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Global Audit Log */}
            <div className="glass-card border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs">GLOBAL OVERSIGHT TIMELINE</h3>
                        </div>
                        <p className="text-[11px] font-medium text-slate-400">ARCHITECT VIEW • CONFIDENTIAL SYSTEM LOGS</p>
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-slate-50/30">
                        <TableRow className="hover:bg-transparent border-slate-200/60">
                            <TableHead className="w-[140px] font-bold text-slate-500 py-6 pl-10 uppercase tracking-wider text-[10px]">Access ID</TableHead>
                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Sector</TableHead>
                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Processing State</TableHead>
                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Latency Report</TableHead>
                            <TableHead className="text-right pr-10 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Audit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issues.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <History className="h-8 w-8 opacity-20" />
                                        <p className="font-medium">Institutional datasets are currently synchronized.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            issues.map((issue, idx) => {
                                const age = differenceInHours(new Date(), new Date(issue.created_at));
                                const isResolved = issue.status === 'Resolved';
                                const isCritical = !isResolved && age > 168; // 1 week+

                                return (
                                    <motion.tr
                                        key={issue.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={cn("hover:bg-blue-50/40 transition-colors border-slate-200/40 group", isCritical && "bg-red-50/30")}
                                    >
                                        <TableCell className="font-mono font-black text-blue-600 pl-10">
                                            <div className="flex flex-col gap-1.5">
                                                <span>{issue.id}</span>
                                                {!isResolved && (
                                                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-lg w-fit bg-slate-900 text-white shadow-lg shadow-black/10">
                                                        SYSTEM QUEUE
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-black text-[10px] border-slate-200 bg-white/50 text-slate-500 px-3 py-1 rounded-xl shadow-sm tracking-wider">
                                                {issue.department.toUpperCase()}
                                            </Badge>
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
                                        <TableCell className="text-sm">
                                            <div className="flex flex-col">
                                                <span className={cn("font-black tracking-tight", age > 96 ? "text-red-600" : "text-slate-900")}>{age}h</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Total Delay</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-10">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedIssue(issue)}
                                                className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white transition-all overflow-hidden group/btn"
                                            >
                                                <ExternalLink className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
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
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col rounded-[3rem] border-white/40 shadow-2xl glass-card p-0 overflow-hidden">
                    {selectedIssue && (
                        <>
                            <div className="bg-slate-900 p-10 text-white relative">
                                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                                            <ShieldCheck className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Institutional Audit Log</span>
                                    </div>
                                    <DialogTitle className="text-5xl font-black font-mono tracking-tighter leading-none mb-4">{selectedIssue.id}</DialogTitle>
                                    <div className="flex gap-3">
                                        <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md px-4 py-1.5 rounded-xl font-black text-[10px] tracking-wider uppercase">{selectedIssue.department}</Badge>
                                        <Badge className={cn("px-4 py-1.5 rounded-xl border-none font-black text-[10px] tracking-wider uppercase", getStatusBadgeVariant(selectedIssue.status))}>{selectedIssue.status}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto flex-1">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-900">
                                        <div className="p-2 bg-slate-100 rounded-xl">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-xs">Primary intelligence Record</h3>
                                    </div>
                                    <div className="text-slate-700 leading-relaxed bg-slate-50 border border-slate-200/60 p-8 rounded-[2.5rem] font-bold text-sm shadow-inner italic">
                                        "{selectedIssue.description}"
                                    </div>
                                </section>

                                {selectedIssue.internal_directive && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-3 text-red-600">
                                            <div className="p-2 bg-red-50 rounded-xl border border-red-100/50">
                                                <ShieldCheck className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs">Administrative Directive</h3>
                                        </div>
                                        <div className="text-red-900 bg-red-50 p-6 rounded-[2rem] border border-red-100 italic font-bold text-sm ring-1 ring-red-200">
                                            "{selectedIssue.internal_directive}"
                                        </div>
                                    </section>
                                )}

                                {selectedIssue.resolution_message && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-3 text-emerald-600">
                                            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-xs">Sector Resolution Log</h3>
                                        </div>
                                        <div className="text-emerald-900 bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 font-bold text-sm shadow-sm">
                                            {selectedIssue.resolution_message}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <div className="p-8 pt-0 shrink-0">
                                <Button
                                    className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs transition-all shadow-2xl"
                                    onClick={() => setSelectedIssue(null)}
                                >
                                    Dismiss Institutional View
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PrincipalDashboard;
