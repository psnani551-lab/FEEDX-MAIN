import { useState, useEffect } from "react";
import {
    Search, Filter, ChevronDown, MoreHorizontal,
    Trash2, Edit3, Eye, FileCheck, FileX, ChevronLeft, ChevronRight,
    ArrowUpDown, ListFilter, CheckCircle2, Clock, X
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
    onDelete?: (item: any) => Promise<void> | void;
    onBulkDelete?: (ids: string[]) => Promise<boolean | void> | boolean | void;
    onStatusToggle?: (item: any) => Promise<void> | void;
    onBulkStatusToggle?: (ids: string[], status: 'published' | 'draft') => Promise<boolean | void> | boolean | void;
    primaryKey?: string;
    searchPlaceholder?: string;
    categoryField?: string;
    filters?: {
        key: string;
        label: string;
        options: { label: string; value: string }[];
        targetKey?: string;
    }[];
}

export default function AdminDataTable({
    data,
    columns,
    onEdit,
    onDelete,
    onBulkDelete,
    onStatusToggle,
    onBulkStatusToggle,
    primaryKey = "id",
    searchPlaceholder = "Search items...",
    categoryField,
    filters = []
}: AdminDataTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sync selection with data (remove IDs that no longer exist)
    useEffect(() => {
        const currentIds = new Set(data.map(item => item[primaryKey]));
        setSelectedIds(prev => prev.filter(id => currentIds.has(id)));
    }, [data, primaryKey]);

    // Filtering
    const filteredData = data.filter(item => {
        if (!item) return false;

        // Search through all values in the item
        const searchStr = Object.values(item)
            .map(v => {
                if (typeof v === 'string' || typeof v === 'number') return String(v);
                if (Array.isArray(v)) return v.map(inner => typeof inner === 'string' ? inner : JSON.stringify(inner)).join(" ");
                return "";
            })
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

        // Filter by active filters
        const matchesFilters = Object.entries(activeFilters).every(([filterKey, value]) => {
            if (!value) return true;

            // Find the filter configuration to get the targetKey
            const filterConfig = filters.find(f => f.key === filterKey);
            const targetKey = filterConfig?.targetKey || filterKey;

            // Handle arrays (e.g. tags) or plain values
            const itemValue = item[targetKey];
            if (Array.isArray(itemValue)) {
                // Case-insensitive array matching
                return itemValue.some(v => String(v).toLowerCase() === String(value).toLowerCase());
            }
            // Case-insensitive string matching
            return String(itemValue || "").toLowerCase() === String(value).toLowerCase();
        });

        return matchesSearch && matchesFilters;
    });

    // Sorting
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const isAllSelectedOnPage = paginatedData.length > 0 && paginatedData.every(item => selectedIds.includes(item[primaryKey]));

    const toggleSelectAll = () => {
        if (isAllSelectedOnPage) {
            // Unselect everything on this page
            const pageIds = new Set(paginatedData.map(d => d[primaryKey]));
            setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
        } else {
            // Select everything on this page (keeping existing selections from other pages)
            const newIds = paginatedData.map(d => d[primaryKey]);
            setSelectedIds(prev => Array.from(new Set([...prev, ...newIds])));
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
                                        onClick={async () => {
                                            if (onBulkStatusToggle) {
                                                const success = await onBulkStatusToggle(selectedIds, 'published');
                                                if (success !== false) {
                                                    setSelectedIds([]);
                                                }
                                            }
                                        }}
                                    >
                                        <FileCheck className="w-4 h-4" />
                                        Publish
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-11 rounded-xl gap-2 font-bold px-4 border-slate-500/20 text-slate-400 hover:bg-slate-500/10"
                                        onClick={async () => {
                                            if (onBulkStatusToggle) {
                                                const success = await onBulkStatusToggle(selectedIds, 'draft');
                                                if (success !== false) {
                                                    setSelectedIds([]);
                                                }
                                            }
                                        }}
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
                                onClick={async () => {
                                    if (onBulkDelete) {
                                        console.log(`[AdminDataTable] Triggering bulk delete for ${selectedIds.length} items:`, selectedIds);
                                        const success = await onBulkDelete(selectedIds);
                                        if (success !== false) {
                                            setSelectedIds([]);
                                        }
                                    }
                                }}
                                aria-label={`Delete ${selectedIds.length} selected items`}
                            >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                                Delete ({selectedIds.length})
                            </Button>
                        </motion.div>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className={`h-11 border-white/5 bg-white/5 rounded-xl gap-2 text-xs uppercase tracking-widest font-black ${Object.keys(activeFilters).length > 0 ? 'text-primary border-primary/20' : ''}`}>
                                <ListFilter className="w-4 h-4" />
                                Filters {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-white/10 rounded-xl p-2 max-h-[350px] overflow-y-auto" data-lenis-prevent>
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black opacity-50 px-2 py-1.5 flex items-center justify-between">
                                Filter By
                                {Object.keys(activeFilters).length > 0 && (
                                    <button
                                        onClick={() => setActiveFilters({})}
                                        className="text-primary hover:underline lowercase font-normal"
                                    >
                                        clear all
                                    </button>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5 my-1" />
                            {filters.map((group) => (
                                <div key={group.key} className="py-2">
                                    <h4 className="px-2 mb-1 text-[9px] uppercase font-bold text-muted-foreground">{group.label}</h4>
                                    {group.options.map((option) => (
                                        <DropdownMenuItem
                                            key={option.value}
                                            onClick={() => {
                                                setActiveFilters(prev => {
                                                    const next = { ...prev };
                                                    if (next[group.key] === option.value) {
                                                        delete next[group.key];
                                                    } else {
                                                        next[group.key] = option.value;
                                                    }
                                                    return next;
                                                });
                                            }}
                                            className="gap-2 rounded-lg py-1.5 cursor-pointer focus:bg-white/10"
                                        >
                                            <div className={`w-3 h-3 rounded-full border border-primary/20 flex items-center justify-center ${activeFilters[group.key] === option.value ? 'bg-primary' : ''}`}>
                                                {activeFilters[group.key] === option.value && <div className="w-1 h-1 bg-white rounded-full" />}
                                            </div>
                                            <span className={`font-semibold text-xs ${activeFilters[group.key] === option.value ? 'text-primary' : ''}`}>{option.label}</span>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator className="bg-white/5 my-2 last:hidden" />
                                </div>
                            ))}
                            {filters.length === 0 && (
                                <div className="px-2 py-4 text-center">
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">No filters available</p>
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Active Filter Badges */}
            {Object.keys(activeFilters).length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                    {Object.entries(activeFilters).map(([key, value]) => {
                        const filterGroup = filters.find(f => f.key === key);
                        const label = filterGroup?.options.find(o => o.value === value)?.label || value;
                        return (
                            <Badge
                                key={key}
                                variant="secondary"
                                className="h-7 pl-3 pr-1 gap-1 border-primary/20 bg-primary/5 text-primary text-[10px] font-bold rounded-full group hover:bg-primary/10 transition-colors"
                            >
                                <span className="opacity-60">{filterGroup?.label}:</span> {label}
                                <button
                                    onClick={() => {
                                        setActiveFilters(prev => {
                                            const next = { ...prev };
                                            delete next[key];
                                            return next;
                                        });
                                    }}
                                    className="p-1 rounded-full hover:bg-primary/20 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}

            {/* Table Area */}
            <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <Checkbox
                                        checked={isAllSelectedOnPage}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </th>
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        className="p-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground"
                                    >
                                        <div
                                            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                                            onClick={() => col.sortable && handleSort(col.key)}
                                            role={col.sortable ? "button" : undefined}
                                            aria-label={col.sortable ? `Sort by ${col.label}` : undefined}
                                        >
                                            {col.label}
                                            {col.sortable && <ArrowUpDown className="w-3 h-3 opacity-50" aria-hidden="true" />}
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
                                        key={item[primaryKey]}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`group hover:bg-white/2 transition-colors ${selectedIds.includes(item[primaryKey]) ? 'bg-primary/5' : ''}`}
                                    >
                                        <td className="p-4 w-12 text-center">
                                            <Checkbox
                                                checked={selectedIds.includes(item[primaryKey])}
                                                onCheckedChange={() => toggleSelect(item[primaryKey])}
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
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all focus-glow hover:scale-110" aria-label="Open item actions">
                                                        <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-xl border-white/10 rounded-xl p-2">
                                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black opacity-50 px-2 py-1.5">Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => onEdit?.(item)} className="gap-2 rounded-lg py-2 cursor-pointer focus:bg-white/10">
                                                        <Edit3 className="w-4 h-4 text-primary" />
                                                        <span className="font-semibold text-xs">Edit Item</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onStatusToggle?.(item)} className="gap-2 rounded-lg py-2 cursor-pointer focus:bg-white/10 text-emerald-500">
                                                        {item.status === 'published' ? <FileX className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                                                        <span className="font-semibold text-xs">{item.status === 'published' ? 'Move to Draft' : 'Publish Live'}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5 my-1" />
                                                    <DropdownMenuItem
                                                        onClick={async () => {
                                                            if (onDelete) {
                                                                await onDelete(item);
                                                                setSelectedIds(prev => prev.filter(id => id !== item[primaryKey]));
                                                            }
                                                        }}
                                                        className="gap-2 rounded-lg py-2 cursor-pointer focus:bg-red-500/10 text-red-500"
                                                    >
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
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
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
                        aria-label="Next page"
                    >
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
