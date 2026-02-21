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
import { X, Upload, Loader2, Newspaper, Ghost, Sparkles, FileText, Activity } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function AddUpdate() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [editingItem, setEditingItem] = useState<Update | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
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

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Retract ${ids.length} journals?`)) return;
    try {
      await Promise.all(ids.map(id => updatesAPI.delete(id)));
      toast({ title: "Feed Harmonized", description: `${ids.length} entries redacted.` });
      fetchUpdates();
    } catch (error) {
      toast({ title: "Broadcast Error", variant: "destructive" });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleBulkStatusToggle = async (ids: string[], status: 'published' | 'draft') => {
    try {
      await Promise.all(ids.map(id => updatesAPI.updateStatus(id, status)));
      toast({
        title: "Bulk Update Complete",
        description: `${ids.length} updates ${status === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchUpdates();
    } catch (error) {
      toast({ title: "Bulk Operation Failed", variant: "destructive" });
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
        <div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl shadow-emerald-500/20">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Platform <span className="text-primary">Journal.</span></h1>
              <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/20">Broadcast system updates and academic circulars.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-white/5 bg-card/40 backdrop-blur-md overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xs uppercase tracking-[0.2em] font-black flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Broadcast Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
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
              </CardContent>
            </Card>

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

          <div className="lg:col-span-8">
            <Card className="border-white/5 bg-card/10 backdrop-blur-xl">
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
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
