import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { testimonialsAPI, Testimonial, uploadFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Loader2, Quote, User, Sparkles, MessageSquare, ShieldCheck, Camera, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AddTestimonial() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    content: "",
    image: "",
    status: "published" as "published" | "draft"
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(files[0]);
      setFormData((prev) => ({ ...prev, image: url }));
      toast({ title: "Profile Synchronized", description: "Identity verified." });
    } catch (error) {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const testimonialData = { ...formData };

      if (isEditMode && editingItem) {
        await testimonialsAPI.update(editingItem.id, testimonialData);
        toast({ title: "Testimony Updated", description: "Changes saved successfully." });
      } else {
        await testimonialsAPI.create(testimonialData);
        toast({ title: "Legacy Recorded", description: "Testimonial successfully integrated." });
      }

      setFormData({
        name: "",
        title: "",
        content: "",
        image: "",
        status: "published"
      });
      setIsEditMode(false);
      setEditingItem(null);
      setIsDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const data = await testimonialsAPI.getAll();
      setTestimonials(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (item: Testimonial) => {
    if (!confirm(`Delete testimony from ${item.name}?`)) return;
    try {
      await testimonialsAPI.delete(item.id);
      toast({ title: "Testimony Purged" });
      fetchTestimonials();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Remove ${ids.length} testimonies?`)) return;
    try {
      await Promise.all(ids.map(id => testimonialsAPI.delete(id)));
      toast({ title: "Bulk Extraction Complete", description: `${ids.length} testimonies removed.` });
      fetchTestimonials();
    } catch (error) {
      toast({ title: "Bulk Sync Failed", variant: "destructive" });
    }
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setIsEditMode(true);
    setFormData({
      name: item.name,
      title: item.title,
      content: item.content,
      image: item.image || '',
      status: item.status || 'published'
    });
    setIsDialogOpen(true);
  };

  const handleStatusToggle = async (item: Testimonial) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await testimonialsAPI.updateStatus(item.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Testimonial ${newStatus === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchTestimonials();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkStatusToggle = async (ids: string[], status: 'published' | 'draft') => {
    try {
      await Promise.all(ids.map(id => testimonialsAPI.updateStatus(id, status)));
      toast({
        title: "Bulk Update Complete",
        description: `${ids.length} testimonials ${status === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchTestimonials();
    } catch (error) {
      toast({ title: "Bulk Operation Failed", variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setFormData({
      name: "",
      title: "",
      content: "",
      image: "",
      status: "published"
    });
    setIsDialogOpen(false);
  };

  const columns = [
    {
      key: "name",
      label: "Participant Identity",
      sortable: true,
      render: (item: Testimonial) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-white/5 shadow-sm">
            {item.image ? (
              <img src={item.image} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground leading-none mb-1">{item.name}</span>
            <span className="text-[10px] text-muted-foreground opacity-60 uppercase font-black tracking-tighter">{item.title}</span>
          </div>
        </div>
      )
    },
    {
      key: "content",
      label: "Narrative",
      render: (item: Testimonial) => (
        <span className="text-xs italic text-muted-foreground truncate max-w-[250px] inline-block">
          "{item.content}"
        </span>
      )
    },
    {
      key: "status",
      label: "Authenticity",
      render: (item: Testimonial) => (
        <Badge className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${item.status === 'published' ? 'bg-indigo-500/10 text-indigo-500 border-0' : 'bg-slate-500/10 text-slate-500 border-0'}`}>
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 shadow-xl shadow-indigo-500/20 text-white">
              <Quote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Global <span className="text-primary">Evidence.</span></h1>
              <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/20">Manage high-fidelity user testimonials and social validation.</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) handleCancelEdit();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-bold uppercase tracking-widest text-xs hidden sm:flex bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                <Plus className="h-4 w-4" /> New Testimony
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                  {isEditMode ? 'Edit Testimony' : 'Add New Testimony'}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Identity Name</Label>
                      <Input name="name" value={formData.name} onChange={handleInputChange} required className="premium-boundary h-11" placeholder="Dr. Sarah Jenkins..." />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Designation</Label>
                      <Input name="title" value={formData.title} onChange={handleInputChange} required className="premium-boundary h-11" placeholder="Senior Researcher..." />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-60">Direct Quotation</Label>
                    <Textarea name="content" value={formData.content} onChange={handleInputChange} required rows={5} className="premium-boundary font-mono text-xs italic leading-relaxed" placeholder="The impact of FeedX has been..." />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase opacity-60">Identity Snapshot</Label>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                    <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                      <div className="relative group shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/20 bg-black/40 flex items-center justify-center">
                          {formData.image ? (
                            <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-white/20" />
                          )}
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-background shadow-lg" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                          {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                        </Button>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Upload Protocol</p>
                        <p className="text-[11px] text-muted-foreground font-medium">Standardize profile visuals for maximum credibility.</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all">
                    {isEditMode ? 'Update Testimony' : 'Register Testimony'}
                  </Button>
                  {isEditMode && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full h-14 rounded-2xl border-white/10">
                      Cancel Edit
                    </Button>
                  )}
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
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  Evidence Registry
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminDataTable
                  data={testimonials}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onBulkDelete={handleBulkDelete}
                  onStatusToggle={handleStatusToggle}
                  onBulkStatusToggle={handleBulkStatusToggle}
                  searchPlaceholder="Search testimonies..."
                />
              </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Card className="border-indigo-500/10 bg-indigo-500/5 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                    <div>
                      <p className="text-[9px] uppercase font-black tracking-widest text-indigo-500">Social Yield</p>
                      <p className="text-xs font-bold">Authenticated</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] uppercase font-black opacity-40">System Status</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
