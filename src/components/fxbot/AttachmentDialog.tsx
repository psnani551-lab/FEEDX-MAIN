import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Play, Eye, X, Download, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fxbotAPI } from "@/lib/api";

interface AttachmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    issueId: string;
}

const AttachmentDialog = ({ isOpen, onClose, issueId }: AttachmentDialogProps) => {
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        const fetchAttachments = async () => {
            if (!isOpen || !issueId) return;
            
            setIsLoading(true);
            try {
                console.log(`[AttachmentDialog] Fetching attachments for issue: ${issueId}`);
                const urls = await fxbotAPI.getIssueAttachments(issueId);
                console.log(`[AttachmentDialog] Received URLs:`, urls);
                if (isMounted) {
                    setAttachments(urls);
                }
            } catch (error) {
                console.error("Error fetching attachments:", error);
                if (isMounted) {
                    setAttachments([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAttachments();

        return () => {
            isMounted = false;
        };
    }, [isOpen, issueId]);
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rounded-[2.5rem] border-white/40 shadow-2xl glass-card p-0 overflow-hidden outline-none">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <Badge className="bg-blue-600 text-white border-none px-3 py-1 mb-3 text-[10px] font-black tracking-widest shadow-lg shadow-blue-500/20">
                                    SUPPORTING EVIDENCE
                                </Badge>
                                <DialogTitle className="text-4xl font-black tracking-tight leading-none uppercase">PROTOCOL {issueId}</DialogTitle>
                                <DialogDescription className="text-slate-400 font-bold mt-2">
                                    {isLoading ? "Fetching attached media..." : `Reviewing ${attachments.length} attached media files for this case.`}
                                </DialogDescription>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onClose}
                                className="rounded-full text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar" data-lenis-prevent>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                            <Loader2 className="h-12 w-12 opacity-50 animate-spin text-blue-500" />
                            <p className="font-bold uppercase tracking-widest text-xs">Accessing Secure Database...</p>
                        </div>
                    ) : attachments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                            <FileText className="h-12 w-12 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-xs">No attachments found in registry.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {attachments.map((url, i) => {
                                const isVideo = url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('video');
                                const isPdf = url.toLowerCase().includes('.pdf');

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group relative bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden hover:border-blue-500 transition-all"
                                    >
                                        <div className="aspect-video relative overflow-hidden bg-slate-100">
                                            {isVideo ? (
                                                <video 
                                                    src={url} 
                                                    className="w-full h-full object-cover"
                                                    controls={false}
                                                />
                                            ) : isPdf ? (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                                    <FileText className="h-16 w-16 text-blue-500 opacity-20" />
                                                </div>
                                            ) : (
                                                <img 
                                                    src={url} 
                                                    alt={`Evidence ${i + 1}`} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            )}
                                            
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10">
                                                <a 
                                                    href={url} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </a>
                                                <a 
                                                    href={url} 
                                                    download 
                                                    className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                                                >
                                                    <Download className="h-5 w-5" />
                                                </a>
                                            </div>

                                            {isVideo && (
                                                <div className="absolute top-4 right-4 z-20">
                                                    <Badge className="bg-black/60 backdrop-blur-md text-white border-none gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                                        <Play className="h-3 w-3 fill-current" /> VIDEO
                                                    </Badge>
                                                </div>
                                            )}
                                            {isPdf && (
                                                <div className="absolute top-4 right-4 z-20">
                                                    <Badge className="bg-red-600 text-white border-none gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                                        <FileText className="h-3 w-3" /> PDF
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex items-center justify-between bg-white border-t border-slate-100/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Registry Entry</span>
                                                <span className="text-sm font-bold text-slate-700">Evidence_{i + 1}</span>
                                            </div>
                                            <Badge variant="outline" className="font-bold text-[10px] border-slate-200 text-slate-500 px-3 py-1 rounded-xl">
                                                VERIFIED
                                            </Badge>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="bg-slate-50 p-8 border-t border-slate-100 shrink-0">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        className="h-14 rounded-2xl px-10 font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-white transition-all border-slate-200"
                    >
                        Dismiss Overlay
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AttachmentDialog;
