import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { spotlightAPI, Spotlight, uploadFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Loader2, Star, Image as ImageIcon, Sparkles, Award, Camera, Plus } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AddSpotlight() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
  const [editingItem, setEditingItem] = useState<Spotlight | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [] as string[],
    status: "published" as "published" | "draft"
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSpotlights();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
      toast({ title: "Assets Ingested", description: `${files.length} images synchronized.` });
    } catch (error) {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const spotlightData = { ...formData };

      if (isEditMode && editingItem) {
        await spotlightAPI.update(editingItem.id, spotlightData);
        toast({ title: "Spotlight Updated", description: "Changes saved successfully." });
      } else {
        await spotlightAPI.create(spotlightData);
        toast({ title: "Spotlight Active", description: "Global feature story broadcasted." });
      }

      setFormData({
        title: "",
        description: "",
        images: [],
        status: "published"
      });
      setIsEditMode(false);
      setEditingItem(null);
      setIsDialogOpen(false);
      fetchSpotlights();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpotlights = async () => {
    try {
      const data = await spotlightAPI.getAll();
      setSpotlights(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (item: Spotlight) => {
    if (!confirm(`Archive "${item.title}"?`)) return;
    try {
      await spotlightAPI.delete(item.id);
      toast({ title: "Spotlight Archived" });
      fetchSpotlights();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Archive ${ids.length} spotlight stories?`)) return;
    try {
      await Promise.all(ids.map(id => spotlightAPI.delete(id)));
      toast({ title: "Global Archive Complete", description: `${ids.length} stories moved to history.` });
      fetchSpotlights();
    } catch (error) {
      toast({ title: "Bulk Operation Failed", variant: "destructive" });
    }
  };

  const handleEdit = (item: Spotlight) => {
    setEditingItem(item);
    setIsEditMode(true);
    setFormData({
      title: item.title,
      description: item.description,
      images: item.images || [],
      status: item.status || 'published'
    });
    setIsDialogOpen(true);
  };

  const handleStatusToggle = async (item: Spotlight) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await spotlightAPI.updateStatus(item.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Spotlight ${newStatus === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchSpotlights();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkStatusToggle = async (ids: string[], status: 'published' | 'draft') => {
    try {
      await Promise.all(ids.map(id => spotlightAPI.updateStatus(id, status)));
      toast({
        title: "Bulk Update Complete",
        description: `${ids.length} spotlights ${status === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchSpotlights();
    } catch (error) {
      toast({ title: "Bulk Operation Failed", variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      images: [],
      status: "published"
    });
    setIsDialogOpen(false);
  };

  const columns = [
    {
      key: "title",
      label: "Feature Story",
      sortable: true,
      render: (item: Spotlight) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden border border-white/5">
            {item.images[0] ? (
              <img src={item.images[0]} className="w-full h-full object-cover" />
            ) : (
              <Star className="w-5 h-5 text-primary" />
            )}
          </div>
          <span className="font-bold text-foreground truncate max-w-[200px]">{item.title}</span>
        </div>
      )
    },
    {
      key: "images",
      label: "Assets",
      render: (item: Spotlight) => (
        <Badge variant="outline" className="border-white/10 bg-white/5 font-mono text-[10px] lowercase tracking-widest px-2">
          {item.images.length} captures
        </Badge>
      )
    },
    {
      key: "status",
      label: "Visibility",
      render: (item: Spotlight) => (
        <Badge className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-0' : 'bg-slate-500/10 text-slate-500 border-0'}`}>
          {item.status || 'published'}
        </Badge>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 shadow-xl shadow-indigo-500/20">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Global <span className="text-primary">Spotlight.</span></h1>
              <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/20">Highlight high-impact achievements and success stories.</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) handleCancelEdit();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-bold uppercase tracking-widest text-xs hidden sm:flex bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                <Plus className="h-4 w-4" /> New Spotlight
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              <DialogHeader className="p-5 sm:p-6 pb-2 border-b border-white/5 flex-none">
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tighter">
                  {isEditMode ? 'Edit Spotlight' : 'Add New Spotlight'}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden p-5 sm:p-6 pt-4">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 h-full">
                  <div className="w-full md:w-1/2 flex flex-col gap-4 h-full min-h-0">
                    <div className="space-y-1.5 flex-none">
                      <Label className="text-[10px] font-black uppercase opacity-60">Success Story Title</Label>
                      <Input name="title" value={formData.title} onChange={handleInputChange} required className="premium-boundary h-10" placeholder="University Grand Prize Winners..." />
                    </div>

                    <div className="space-y-1.5 flex-1 min-h-0 flex flex-col">
                      <Label className="text-[10px] font-black uppercase flex-none opacity-60">Full Narrative <span className="text-[8px] opacity-40 italic">(Markdown Engine Powered)</span></Label>
                      <Textarea name="description" value={formData.description} onChange={handleInputChange} required className="premium-boundary flex-1 resize-none font-mono text-xs leading-relaxed" placeholder="Chronicle the achievement here..." />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 flex flex-col h-full min-h-0">
                    <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                      <Label className="text-[10px] font-black uppercase opacity-60 flex-none">Visual Assets</Label>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
                      <Button type="button" variant="outline" className="w-full flex-none h-12 border-dashed border-white/10 bg-white/5 rounded-2xl flex gap-2 items-center justify-center group hover:bg-white/10 transition-all" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Synchronizing...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-indigo-500 group-hover:-translate-y-1 transition-transform" />
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Inject Visual Data</span>
                          </>
                        )}
                      </Button>

                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3 flex-1 overflow-y-auto custom-scrollbar pr-1 items-start content-start">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden border border-white/5">
                              <img src={img} alt={`Asset ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <X className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mt-4 flex-none">
                      <Button className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest h-12 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all">
                        {isEditMode ? 'Update Spotlight' : 'Finalize Spotlight'}
                      </Button>
                      {isEditMode && (
                        <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full h-10 rounded-xl border-white/10 text-[10px] uppercase font-bold">
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-8">
          <div className="w-full">
            <Card className="glass-card border-white/10 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="flex items-center gap-2 uppercase tracking-tighter font-black">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Feature Registry
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminDataTable
                  data={spotlights}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onBulkDelete={handleBulkDelete}
                  onStatusToggle={handleStatusToggle}
                  onBulkStatusToggle={handleBulkStatusToggle}
                  searchPlaceholder="Search spotlight archives..."
                />
              </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Award, label: "Achievements", color: "text-amber-500" },
                { icon: ImageIcon, label: "Visual Media", color: "text-indigo-500" },
                { icon: Star, label: "Impact", color: "text-rose-500" }
              ].map((stat, i) => (
                <Card key={i} className="border-white/5 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{stat.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
