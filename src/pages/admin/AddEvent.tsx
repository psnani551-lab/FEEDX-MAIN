import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { eventsAPI, Event, uploadFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/useAutoSave";
import { X, Upload, Loader2, Calendar, MapPin, Link as LinkIcon, Sparkles, Trophy, Globe, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


export default function AddEvent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingItem, setEditingItem] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    registerLink: "",
    image: "",
    status: "upcoming" as "upcoming" | "conducted" | "published" | "draft",
    isComingSoon: false,
    files: [] as string[],
    adminStatus: "published" as "published" | "draft"
  });
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Auto-save hook - saves draft every 2 seconds
  const { clearDraft, loadDraft } = useAutoSave(formData, 'admin-event-draft', 2000);

  // Load draft on component mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && !isEditMode) {
      setFormData(draft);
      toast({
        title: "Draft Restored",
        description: "Your previous work has been recovered.",
      });
    }
  }, []); // Only run once on mount

  useEffect(() => {
    fetchEvents();
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
      toast({ title: "Visual Asset Locked", description: files[0].name });
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
      const eventData = {
        ...formData,
        date: formData.isComingSoon ? "Coming Soon" : formData.date || "TBA",
        time: formData.isComingSoon ? "TBA" : formData.time || "TBA",
        status: formData.status,
      };

      if (isEditMode && editingItem) {
        await eventsAPI.update(editingItem.id, eventData);
        toast({ title: "Event Updated", description: "Changes saved successfully." });
      } else {
        await eventsAPI.create(eventData);
        toast({ title: "Event Synchronized", description: "Global event broadcast active." });
      }

      // Clear the auto-saved draft after successful submission
      clearDraft();


      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        registerLink: "",
        image: "",
        status: "upcoming",
        isComingSoon: false,
        files: [],
        adminStatus: "published"
      });
      setIsEditMode(false);
      setEditingItem(null);
      setIsDialogOpen(false);
      fetchEvents();
    } catch (error) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await eventsAPI.getAll();
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (item: Event) => {
    if (!confirm(`Cancel "${item.title}"?`)) return;
    try {
      await eventsAPI.delete(item.id);
      toast({ title: "Event Purged" });
      fetchEvents();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Purge ${ids.length} events?`)) return;
    try {
      await Promise.all(ids.map(id => eventsAPI.delete(id)));
      toast({ title: "Bulk Purge Complete", description: `${ids.length} events removed.` });
      fetchEvents();
    } catch (error) {
      toast({ title: "Bulk Sync Failed", variant: "destructive" });
    }
  };

  const handleEdit = (item: Event) => {
    setEditingItem(item);
    setIsEditMode(true);
    setFormData({
      title: item.title,
      description: item.description,
      date: item.date === 'Coming Soon' ? '' : item.date,
      time: item.time === 'TBA' ? '' : item.time,
      location: item.location,
      registerLink: item.registerLink || '',
      image: item.image || '',
      status: item.status,
      isComingSoon: item.date === 'Coming Soon',
      files: item.files || [],
      adminStatus: (item.status as any) || 'published'
    });
    setIsDialogOpen(true);
  };

  const handleStatusToggle = async (item: Event) => {
    const newStatus = (item.status as any) === 'published' ? 'draft' : 'published';
    try {
      await eventsAPI.updateStatus(item.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Event ${newStatus === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchEvents();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkStatusToggle = async (ids: string[], status: 'published' | 'draft') => {
    try {
      await Promise.all(ids.map(id => eventsAPI.updateStatus(id, status)));
      toast({
        title: "Bulk Update Complete",
        description: `${ids.length} events ${status === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchEvents();
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
      date: "",
      time: "",
      location: "",
      registerLink: "",
      image: "",
      status: "upcoming",
      isComingSoon: false,
      files: [],
      adminStatus: "published"
    });
    setIsDialogOpen(false);
  };

  const columns = [
    {
      key: "title",
      label: "Event Manifest",
      sortable: true,
      render: (item: Event) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-foreground truncate max-w-[200px]">{item.title}</span>
          <div className="flex items-center gap-2">
            <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{item.location}</span>
          </div>
        </div>
      )
    },
    {
      key: "date",
      label: "Timeline",
      render: (item: Event) => (
        <div className="flex flex-col text-[11px]">
          <span className="font-mono text-primary font-black uppercase tracking-tighter">{item.date}</span>
          <span className="text-muted-foreground opacity-60 text-[9px]">{item.time}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Phase",
      render: (item: Event) => (
        <Badge className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${item.status === 'upcoming' ? 'bg-amber-500/10 text-amber-500 border-0' : 'bg-blue-500/10 text-blue-500 border-0'}`}>
          {item.status}
        </Badge>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 shadow-xl shadow-amber-500/20">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase">Global <span className="text-primary">Events.</span></h1>
                <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/20">Coordinate webinars, meetups, and academic sessions.</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) handleCancelEdit();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-bold uppercase tracking-widest text-xs hidden sm:flex bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/20">
                  <Plus className="h-4 w-4" /> New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                    {isEditMode ? 'Edit Event' : 'Add New Event'}
                  </DialogTitle>
                </DialogHeader>
                <div className="pt-4">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Event Title</Label>
                      <Input name="title" value={formData.title} onChange={handleInputChange} required className="premium-boundary h-11" placeholder="AI Global Meetup 2026..." />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Objective</Label>
                      <Textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} className="premium-boundary font-mono text-xs" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <div className="flex gap-3 items-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <Label className="font-black text-sm uppercase tracking-tighter text-primary">Stealth Launch</Label>
                      </div>
                      <Switch checked={formData.isComingSoon} onCheckedChange={(v) => setFormData(f => ({ ...f, isComingSoon: v }))} />
                    </div>

                    {!formData.isComingSoon && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase opacity-60">Calendar Date</Label>
                          <Input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="premium-boundary h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase opacity-60">Standard Time</Label>
                          <Input type="time" name="time" value={formData.time} onChange={handleInputChange} required className="premium-boundary h-11" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Deployment Location</Label>
                      <Input name="location" value={formData.location} onChange={handleInputChange} required className="premium-boundary h-11" placeholder="Zoom Hybrid / Tech Hall A" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Access URL</Label>
                      <Input name="registerLink" type="url" value={formData.registerLink} onChange={handleInputChange} className="premium-boundary h-11" placeholder="https://register.zoom.us/..." />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Event Snapshot</Label>
                      <Button type="button" variant="outline" className="w-full h-11 border-dashed border-white/10 bg-white/5 rounded-xl text-xs flex gap-2" onClick={() => imageInputRef.current?.click()} disabled={isUploading}>
                        <Upload className="w-4 h-4 text-amber-500" /> {isUploading ? "Uploading..." : formData.image ? "Change Visual" : "Upload Visual"}
                      </Button>
                      <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      {formData.image && (
                        <div className="relative aspect-video mt-2 overflow-hidden rounded-xl border border-white/10">
                          <img src={formData.image} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFormData(f => ({ ...f, image: "" }))} className="absolute top-2 right-2 bg-rose-500 rounded-full p-1"><X className="w-3 h-3 text-white" /></button>
                        </div>
                      )}
                    </div>

                    <Button className="w-full bg-amber-600 text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all">
                      {isEditMode ? 'Update Event' : 'Finalize Deployment'}
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
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-white/10">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="flex items-center gap-2 uppercase tracking-tighter font-black">
                <Calendar className="w-5 h-5 text-amber-500" />
                Strategic Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <AdminDataTable
                data={events}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBulkDelete={handleBulkDelete}
                onStatusToggle={handleStatusToggle}
                onBulkStatusToggle={handleBulkStatusToggle}
                searchPlaceholder="Search event registry..."
              />
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <Card className="border-emerald-500/10 bg-emerald-500/5 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-emerald-500">Global Sync</p>
                  <p className="text-xs font-bold">100% Availability</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-indigo-500/10 bg-indigo-500/5 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-indigo-500">Live Feedback</p>
                  <p className="text-xs font-bold">Enabled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
