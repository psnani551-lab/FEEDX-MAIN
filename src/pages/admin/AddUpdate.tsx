import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatesAPI, Update, uploadFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Loader2, Newspaper, Ghost, Sparkles, FileText, Activity, Plus } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AddUpdate() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [editingItem, setEditingItem] = useState<Update | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    type: "announcement",
    category: "General",
    images: [] as string[],
    files: [] as string[],
    status: "published" as "published" | "draft"
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'files') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        setFormData((prev) => ({
          ...prev,
          [type]: [...prev[type], url],
        }));
        toast({ title: "Upload Success", description: file.name });
      }
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
      const updateData = { ...formData };

      if (isEditMode && editingItem) {
        await updatesAPI.update(editingItem.id, updateData);
        toast({ title: "Update Modified", description: "Changes saved successfully." });
      } else {
        await updatesAPI.create(updateData);
        toast({ title: "Update Published", description: "Syncing to global feed..." });
      }

      setFormData({
        title: "",
        type: "announcement",
        category: "General",
        description: "",
        priority: "medium",
        images: [],
        files: [],
        status: "published"
      });
      setIsEditMode(false);
      setEditingItem(null);
      setIsDialogOpen(false);
      fetchUpdates();
    } catch (error) {
      console.error("Broadcast failed:", error);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpdates = async () => {
    try {
      const data = await updatesAPI.getAll();
      setUpdates(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (item: Update) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await updatesAPI.delete(item.id);
      toast({ title: "Deleted" });
      fetchUpdates();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkDelete = async (ids: string[]): Promise<boolean> => {
    if (!confirm(`Permanently remove ${ids.length} entries?`)) return false;
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(ids.map(id => updatesAPI.delete(id)));
      const failed = results.filter(r => r.status === 'rejected');

      if (failed.length > 0) {
        toast({ title: "Partial Success", description: `${ids.length - failed.length} removed, ${failed.length} failed.`, variant: "destructive" });
      } else {
        toast({ title: "Bulk Delete Success", description: `${ids.length} entries removed.` });
      }
      fetchUpdates();
      return true;
    } catch (error) {
      toast({ title: "Operation Failed", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Update) => {
    setEditingItem(item);
    setIsEditMode(true);
    setFormData({
      title: item.title,
      description: item.description,
      priority: item.priority,
      type: item.type,
      category: item.category,
      images: item.images || [],
      files: item.files || [],
      status: item.status || 'published'
    });
    setIsDialogOpen(true);
  };

  const handleStatusToggle = async (item: Update) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await updatesAPI.updateStatus(item.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Update ${newStatus === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchUpdates();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkStatusToggle = async (ids: string[], status: 'published' | 'draft'): Promise<boolean> => {
    setIsLoading(true);
    try {
      await Promise.all(ids.map(id => updatesAPI.updateStatus(id, status)));
      toast({ title: "Bulk Update Success", description: `${ids.length} entries ${status}.` });
      fetchUpdates();
      return true;
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setFormData({
      title: "",
      type: "announcement",
      category: "General",
      description: "",
      priority: "medium",
      images: [],
      files: [],
      status: "published"
    });
    setIsDialogOpen(false);
  };

  const columns = [
    {
      key: "title",
      label: "Update Detail",
      sortable: true,
      render: (item: Update) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-foreground truncate max-w-[200px]">{item.title}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[8px] uppercase tracking-tighter px-1.5 py-0 ${item.priority === 'high' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : item.priority === 'medium' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5'}`}>
              {item.priority}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{item.type}</span>
          </div>
        </div>
      )
    },
    { key: "category", label: "Category", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (item: Update) => (
        <Badge variant={item.status === 'published' ? "secondary" : "outline"} className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-0' : 'text-slate-500 border-slate-500/20'}`}>
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl shadow-emerald-500/20">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Platform <span className="text-primary">Journal.</span></h1>
              <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/20">Broadcast system updates and academic circulars.</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) handleCancelEdit();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-bold uppercase tracking-widest text-xs hidden sm:flex bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                <Plus className="h-4 w-4" /> New Update
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                  {isEditMode ? 'Edit Update' : 'Add New Update'}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-60">Headline</Label>
                    <Input name="title" value={formData.title} onChange={handleInputChange} required className="premium-boundary h-11" placeholder="Semester Results Live..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Type</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData(f => ({ ...f, type: v }))}>
                        <SelectTrigger className="premium-boundary h-11"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card/95 premium-boundary backdrop-blur-xl">
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="result">Result</SelectItem>
                          <SelectItem value="circular">Circular</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Priority</Label>
                      <Select value={formData.priority} onValueChange={(v: any) => setFormData(f => ({ ...f, priority: v }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card/95 border-white/10 rounded-xl backdrop-blur-xl">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-60">Message Body</Label>
                    <Textarea name="description" value={formData.description} onChange={handleInputChange} required rows={6} className="premium-boundary font-mono text-xs" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <Label className="text-[10px] font-black uppercase opacity-60">Attachments</Label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><Upload className="w-3 h-3 text-primary" /></button>
                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'images')} accept="image/*" multiple className="hidden" />
                      </div>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative aspect-square group">
                            <img src={img} className="w-full h-full object-cover rounded-lg border border-white/10" />
                            <button onClick={() => setFormData(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2 h-2 text-white" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button className="w-full bg-primary text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl shadow-lg shadow-primary/20 group overflow-hidden">
                    <span className="relative z-10">{isEditMode ? 'Update Broadcast' : 'Broadcast Now'}</span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
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
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  History & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminDataTable
                  data={updates}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onBulkDelete={handleBulkDelete}
                  onStatusToggle={handleStatusToggle}
                  onBulkStatusToggle={handleBulkStatusToggle}
                  searchPlaceholder="Search journal entries..."
                  filters={[
                    {
                      key: 'status',
                      label: 'Visibility',
                      options: [
                        { label: 'Published', value: 'published' },
                        { label: 'Draft', value: 'draft' }
                      ]
                    },
                    {
                      key: 'type',
                      label: 'Update Type',
                      options: [
                        { label: 'Announcement', value: 'announcement' },
                        { label: 'Exam', value: 'exam' },
                        { label: 'Result', value: 'result' },
                        { label: 'Circular', value: 'circular' }
                      ]
                    },
                    {
                      key: 'priority',
                      label: 'Priority',
                      options: [
                        { label: 'High', value: 'high' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Low', value: 'low' }
                      ]
                    }
                  ]}
                />
              </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-emerald-500/10 bg-emerald-500/5 backdrop-blur-sm overflow-hidden border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-[10px] uppercase font-black tracking-widest mb-1 text-emerald-500">Pro Tip</h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">High priority updates are highlighted in red on the main feed for maximum visibility.</p>
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
