import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { resourcesAPI, Resource, uploadFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Loader2, Link as LinkIcon, BookOpen, Sparkles, Hash, Layers, Plus } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AddResource() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [editingItem, setEditingItem] = useState<Resource | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    tags: [] as string[],
    images: [] as string[],
    files: [] as string[],
    status: "published" as "published" | "draft"
  });
  const [currentTag, setCurrentTag] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [externalLink, setExternalLink] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, url],
        }));
        toast({ title: "Image Uploaded", description: file.name });
      }
    } catch (error) {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddExternalLink = () => {
    const url = externalLink.trim();
    if (!url) return;
    try {
      new URL(url);
      setFormData((prev) => ({ ...prev, files: [...prev.files, url] }));
      setExternalLink("");
      toast({ title: "Resource Linked" });
    } catch {
      toast({ title: "Invalid URL", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const resourceData = { ...formData };

      if (isEditMode && editingItem) {
        await resourcesAPI.update(editingItem.id, resourceData);
        toast({ title: "Resource Updated", description: "Changes saved successfully." });
      } else {
        await resourcesAPI.create(resourceData);
        toast({ title: "Knowledge Base Updated", description: "Resource is now live." });
      }

      setFormData({
        title: "",
        description: "",
        longDescription: "",
        tags: [],
        images: [],
        files: [],
        status: "published"
      });
      setIsEditMode(false);
      setEditingItem(null);
      setIsDialogOpen(false);
      fetchResources();
    } catch (error) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const data = await resourcesAPI.getAll();
      setResources(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (item: Resource) => {
    if (!confirm(`Remove "${item.title}" from library?`)) return;
    try {
      await resourcesAPI.delete(item.id);
      toast({ title: "Resource Removed" });
      fetchResources();
    } catch (error) {
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Decimate ${ids.length} assets?`)) return;
    try {
      await Promise.all(ids.map(id => resourcesAPI.delete(id)));
      toast({ title: "Inventory Purged", description: `${ids.length} assets removed from library.` });
      fetchResources();
    } catch (error) {
      toast({ title: "Bulk Protocol Error", variant: "destructive" });
    }
  };

  const handleEdit = (item: Resource) => {
    setEditingItem(item);
    setIsEditMode(true);
    setFormData({
      title: item.title,
      description: item.description,
      longDescription: item.longDescription,
      tags: item.tags || [],
      images: item.images || [],
      files: item.files || [],
      status: item.status || 'published'
    });
    setIsDialogOpen(true);
  };

  const handleStatusToggle = async (item: Resource) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await resourcesAPI.updateStatus(item.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Resource ${newStatus === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchResources();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkStatusToggle = async (ids: string[], status: 'published' | 'draft') => {
    try {
      await Promise.all(ids.map(id => resourcesAPI.updateStatus(id, status)));
      toast({
        title: "Bulk Update Complete",
        description: `${ids.length} resources ${status === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchResources();
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
      longDescription: "",
      tags: [],
      images: [],
      files: [],
      status: "published"
    });
    setIsDialogOpen(false);
  };

  const columns = [
    {
      key: "title",
      label: "Knowledge Asset",
      sortable: true,
      render: (item: Resource) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-foreground truncate max-w-[250px]">{item.title}</span>
          <div className="flex flex-wrap gap-1">
            {item.tags?.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[8px] uppercase tracking-widest bg-primary/5 text-primary px-1 border border-primary/10 rounded-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      key: "links",
      label: "Assets",
      render: (item: Resource) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Badge variant="outline" className="text-[9px] h-5 flex gap-1 items-center border-white/10">
            <LinkIcon className="w-2.5 h-2.5" /> {item.files?.length || 0}
          </Badge>
          <Badge variant="outline" className="text-[9px] h-5 flex gap-1 items-center border-white/10">
            <Upload className="w-2.5 h-2.5" /> {item.images?.length || 0}
          </Badge>
        </div>
      )
    },
    {
      key: "status",
      label: "Visibility",
      render: (item: Resource) => (
        <Badge variant={item.status === 'published' ? "secondary" : "outline"} className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${item.status === 'published' ? 'bg-indigo-500/10 text-indigo-500 border-0' : 'text-slate-500 border-slate-500/20'}`}>
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
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Knowledge <span className="text-primary">Base.</span></h1>
              <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/20">Curate and manage academic study materials.</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) handleCancelEdit();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-bold uppercase tracking-widest text-xs hidden sm:flex bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                <Plus className="h-4 w-4" /> New Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                  {isEditMode ? 'Edit Resource' : 'Add New Resource'}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-60">Asset Title</Label>
                    <Input name="title" value={formData.title} onChange={handleInputChange} required className="premium-boundary h-11" placeholder="Advanced Mathematics Vol 1..." />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-60">Teaser text</Label>
                    <Input name="description" value={formData.description} onChange={handleInputChange} required className="premium-boundary h-11" placeholder="Brief intro to the subject..." />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-60">Detailed Index</Label>
                    <Textarea name="longDescription" value={formData.longDescription} onChange={handleInputChange} required rows={4} className="premium-boundary font-mono text-xs" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-60">Classification Tags</Label>
                    <div className="flex gap-2">
                      <Input value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} className="premium-boundary h-10" placeholder="e.g. Science" />
                      <Button type="button" onClick={handleAddTag} variant="secondary" className="h-10 rounded-xl group px-3">
                        <Hash className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map((tag, i) => (
                        <Badge key={i} className="bg-indigo-500/10 text-indigo-500 border-0 hover:bg-indigo-500/20 cursor-pointer" onClick={() => setFormData(f => ({ ...f, tags: f.tags.filter((_, idx) => idx !== i) }))}>
                          {tag} <X className="w-2 h-2 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase opacity-60">Linked Assets (URLs)</Label>
                    </div>
                    <div className="flex gap-2">
                      <Input value={externalLink} onChange={(e) => setExternalLink(e.target.value)} className="premium-boundary h-10" placeholder="https://drive.google..." />
                      <Button type="button" onClick={handleAddExternalLink} variant="secondary" className="h-10 rounded-xl"><LinkIcon className="w-4 h-4" /></Button>
                    </div>
                    {formData.files.length > 0 && (
                      <div className="space-y-1">
                        {formData.files.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-[10px] text-muted-foreground group">
                            <span className="truncate flex-1">{file}</span>
                            <button type="button" onClick={() => setFormData(f => ({ ...f, files: f.files.filter((_, idx) => idx !== i) }))} className="text-rose-500 p-1 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-60">Visual Assets</Label>
                    <Button type="button" variant="outline" className="w-full h-11 border-dashed border-white/10 bg-white/5 rounded-xl text-xs flex gap-2" onClick={() => imageInputRef.current?.click()} disabled={isUploading}>
                      <Upload className="w-4 h-4 text-indigo-500" /> {isUploading ? "Uploading..." : "Click to Upload Preview"}
                    </Button>
                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative aspect-square group">
                            <img src={img} className="w-full h-full object-cover rounded-lg border border-white/10" />
                            <button onClick={() => setFormData(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2 h-2 text-white" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform">
                    {isEditMode ? 'Update Asset' : 'Deploy Asset'}
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
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  Library Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminDataTable
                  data={resources}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onBulkDelete={handleBulkDelete}
                  onStatusToggle={handleStatusToggle}
                  onBulkStatusToggle={handleBulkStatusToggle}
                  searchPlaceholder="Search index..."
                />
              </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-indigo-500/10 bg-indigo-500/5 backdrop-blur-sm overflow-hidden border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-[10px] uppercase font-black tracking-widest mb-1 text-indigo-500">Curator Tip</h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">External links to Google Drive or YouTube are preferred for speed and player compatibility.</p>
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
