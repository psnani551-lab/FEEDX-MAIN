import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FXBotIssue } from "@/lib/api";
import { format } from "date-fns";
import { CheckCircle2, History, MessageSquare, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResolvedIssuesProps {
    issues: FXBotIssue[];
}

const ResolvedIssues = ({ issues }: ResolvedIssuesProps) => {
    return (
        <div className="glass-card border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-200/60">
                        <TableHead className="font-black text-slate-500 py-6 pl-10 uppercase tracking-[0.2em] text-[10px]">Registry Key</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">Audit Context</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">Resolution Intelligence</TableHead>
                        <TableHead className="text-right pr-10 font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">Protocol Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {issues.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-56 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                        <History className="h-10 w-10 opacity-20" />
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-xs">Architectural Archives Empty</p>
                                    <p className="text-[10px] text-slate-400 font-medium">No synchronized records detected in the historical registry.</p>
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
                                className="hover:bg-emerald-50/30 transition-colors border-slate-200/40 group"
                            >
                                <TableCell className="font-mono font-black text-emerald-600 pl-10 py-5">{issue.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 leading-none mb-1.5 uppercase text-[11px] tracking-tight">{issue.category}</span>
                                        <span className="text-[10px] text-slate-400 font-bold truncate max-w-[200px] italic">"{issue.description}"</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-start gap-4 py-2">
                                        <div className="mt-1 p-2 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-md mb-2">
                                                Synchronized
                                            </Badge>
                                            <p className="text-[11px] text-slate-600 font-bold leading-relaxed max-w-[340px]">
                                                {issue.resolution_message || "System-generated resolution: Protocol successfully finalized."}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-10">
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-slate-900 text-xs tracking-tight">
                                            {issue.resolved_at ? format(new Date(issue.resolved_at), "MMM dd, yyyy") : format(new Date(), "MMM dd, yyyy")}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Log</span>
                                    </div>
                                </TableCell>
                            </motion.tr>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ResolvedIssues;
