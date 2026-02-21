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
        <div className="glass-card border-white/40 shadow-2xl rounded-[1.5rem] overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-200/60">
                        <TableHead className="font-bold text-slate-500 py-5 pl-8 uppercase tracking-wider text-[10px]">Registry ID</TableHead>
                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Historical Context</TableHead>
                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Resolution Protocol</TableHead>
                        <TableHead className="text-right pr-8 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Completion Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {issues.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-48 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <History className="h-8 w-8 opacity-20" />
                                    <p className="font-medium">No archived records found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        issues.map((issue, idx) => (
                            <motion.tr
                                key={issue.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-emerald-50/30 transition-colors border-slate-200/40 group"
                            >
                                <TableCell className="font-mono font-bold text-emerald-600 pl-8">{issue.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 leading-none mb-1">{issue.category}</span>
                                        <span className="text-[11px] text-slate-400 font-medium line-clamp-1 italic">"{issue.description}"</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 p-1 bg-emerald-100 rounded-lg">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Resolved</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[300px]">
                                                {issue.resolution_message || "Issue successfully addressed and synchronized."}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-8 font-medium text-slate-500 text-sm">
                                    {issue.resolved_at ? format(new Date(issue.resolved_at), "MMM dd, yyyy") : format(new Date(), "MMM dd, yyyy")}
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
