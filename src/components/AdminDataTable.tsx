import { useState, useEffect } from "react";
import {
    Search, Filter, ChevronDown, MoreHorizontal,
    Trash2, Edit3, Eye, FileCheck, FileX, ChevronLeft, ChevronRight,
    ArrowUpDown, ListFilter, CheckCircle2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

interface AdminDataTableProps {
    data: any[];
    columns: {
        key: string;
        label: string;
        render?: (item: any) => React.ReactNode;
        sortable?: boolean;
    }[];
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    onBulkDelete?: (ids: string[]) => void;
    onStatusToggle?: (item: any) => void;
    onBulkStatusToggle?: (ids: string[], status: 'published' | 'draft') => void;
    searchPlaceholder?: string;
    categoryField?: string;
}

export default function AdminDataTable({
    data,
    columns,
    onEdit,
    onDelete,
    onBulkDelete,
    onStatusToggle,
    onBulkStatusToggle,
    searchPlaceholder = "Search items...",
    categoryField
}: AdminDataTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sync selection with data (remove IDs that no longer exist)
    useEffect(() => {
        const currentIds = new Set(data.map(item => item.id || item.code));
        setSelectedIds(prev => prev.filter(id => currentIds.has(id)));
    }, [data]);

    // Filtering
    const filteredData = data.filter(item => {
        const searchStr = Object.values(item).join(" ").toLowerCase();
        return searchStr.includes(searchTerm.toLowerCase());
    });

    // Sorting
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedData.length && paginatedData.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedData.map(d => d.id || d.code)); // Consistent with individual selection
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-2">
                <div className="relative w-full sm:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder={searchPlaceholder}
                        className="pl-10 h-11 bg-white/5 border-white/5 focus:border-primary/50 rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedIds.length > 0 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                            {onBulkStatusToggle && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-11 rounded-xl gap-2 font-bold px-4 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                                        onClick={() => onBulkStatusToggle(selectedIds, 'published')}
                                    >
                                        <FileCheck className="w-4 h-4" />
                                        Publish
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-11 rounded-xl gap-2 font-bold px-4 border-slate-500/20 text-slate-400 hover:bg-slate-500/10"
                                        onClick={() => onBulkStatusToggle(selectedIds, 'draft')}
                                    >
                                        <FileX className="w-4 h-4" />
                                        Draft
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-11 rounded-xl gap-2 font-bold px-4"
                                onClick={() => onBulkDelete?.(selectedIds)}
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete ({selectedIds.length})
                            </Button>
                        </motion.div>
                    )}
                    <Button variant="outline" className="h-11 border-white/5 bg-white/5 rounded-xl gap-2 text-xs uppercase tracking-widest font-black">
                        <ListFilter className="w-4 h-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <Checkbox
                                        checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </th>
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        className="p-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground"
                                    >
                                        <div className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors" onClick={() => col.sortable && handleSort(col.key)}>
                                            {col.label}
                                            {col.sortable && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                                        </div>
                                    </th>
                                ))}
                                <th className="p-4 w-20 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {paginatedData.map((item, idx) => (
                                    <motion.tr
                                        key={item.id || item.code}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`group hover:bg-white/2 transition-colors ${(selectedIds.includes(item.id) || selectedIds.includes(item.code)) ? 'bg-primary/5' : ''}`}
                                    >
                                        <td className="p-4 w-12 text-center">
                                            <Checkbox
                                                checked={selectedIds.includes(item.id) || selectedIds.includes(item.code)}
                                                onCheckedChange={() => toggleSelect(item.id || item.code)}
                                            />
                                        </td>
                                        {columns.map(col => (
                                            <td key={col.key} className="p-4">
                                                <div className="text-sm font-semibold max-w-xs truncate">
                                                    {col.render ? col.render(item) : item[col.key]}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all focus-glow hover:scale-110">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-xl border-white/10 rounded-xl p-2">
                                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black opacity-50 px-2 py-1.5">Actions</DropdownMenuLabel>
                                                    {onEdit && (
                                                        <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2 rounded-lg py-2 cursor-pointer focus:bg-white/10">
                                                            <Edit3 className="w-4 h-4 text-primary" />
                                                            <span className="font-semibold text-xs">Edit Item</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => onStatusToggle?.(item)} className="gap-2 rounded-lg py-2 cursor-pointer focus:bg-white/10 text-emerald-500">
                                                        {item.status === 'published' ? <FileX className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                                                        <span className="font-semibold text-xs">{item.status === 'published' ? 'Move to Draft' : 'Publish Live'}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5 my-1" />
                                                    <DropdownMenuItem onClick={() => onDelete?.(item)} className="gap-2 rounded-lg py-2 cursor-pointer focus:bg-red-500/10 text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="font-semibold text-xs">Delete Item</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {paginatedData.length === 0 && (
                    <div className="py-20 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">No entries found matching filters</p>
                    </div>
                )}
            </div>

            {/* Pagination Bar */}
            <div className="flex items-center justify-between pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Showing <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="text-foreground">{sortedData.length}</span> entries
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-white/5 rounded-xl hover:bg-white/5 transition-all focus-glow hover:scale-110"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "secondary" : "ghost"}
                                className={`h-10 w-10 rounded-xl font-black text-xs transition-all focus-glow ${currentPage === page ? 'bg-primary/10 text-primary hover:bg-primary/20 scale-110' : 'hover:bg-white/5'}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-white/5 rounded-xl hover:bg-white/5 transition-all focus-glow hover:scale-110"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
