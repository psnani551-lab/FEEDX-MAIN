import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { notificationsAPI, Notification } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Bell, FileText, Sparkles, Info, Eye, EyeOff, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AddNotification() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingItem, setEditingItem] = useState<Notification | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const notificationData = { ...formData };

      if (isEditMode && editingItem) {
        await notificationsAPI.update(editingItem.id, notificationData);
        toast({ title: "Notification Updated", description: "Changes saved successfully." });
      } else {
        await notificationsAPI.create(notificationData);
        toast({ title: "Success", description: "Notification published." });
      }

      setFormData({ title: "", description: "" });
      setIsEditMode(false);
      setEditingItem(null);
      setIsDialogOpen(false);
      fetchNotifications();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationsAPI.getAll();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (item: Notification) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await notificationsAPI.delete(item.id);
      toast({ title: "Deleted", description: "Entry removed successfully." });
      fetchNotifications();
    } catch (error) {
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} entries?`)) return;
    try {
      await Promise.all(ids.map(id => notificationsAPI.delete(id)));
      toast({ title: "Bulk Delete Success", description: `${ids.length} entries removed.` });
      fetchNotifications();
    } catch (error) {
      toast({ title: "Operation Failed", variant: "destructive" });
    }
  };

  const handleEdit = (item: Notification) => {
    setEditingItem(item);
    setIsEditMode(true);
    setFormData({
      title: item.title,
      description: item.description
    });
    setIsDialogOpen(true);
  };

  const handleStatusToggle = async (item: Notification) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await notificationsAPI.updateStatus(item.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Notification ${newStatus === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchNotifications();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkStatusToggle = async (ids: string[], status: 'published' | 'draft') => {
    try {
      await Promise.all(ids.map(id => notificationsAPI.updateStatus(id, status)));
      toast({
        title: "Bulk Update Complete",
        description: `${ids.length} notifications ${status === 'published' ? 'published' : 'moved to draft'}.`
      });
      fetchNotifications();
    } catch (error) {
      toast({ title: "Bulk Operation Failed", variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setFormData({ title: "", description: "" });
    setIsDialogOpen(false);
  };

  const columns = [
    {
      key: "title",
      label: "Notification Content",
      sortable: true,
      render: (item: Notification) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-foreground truncate max-w-[240px]">{item.title}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item: Notification) => (
        <Badge variant={item.status === 'published' ? "secondary" : "outline"} className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-0' : 'text-amber-500 border-amber-500/20'}`}>
          {item.status || 'published'}
        </Badge>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">Notifications <span className="text-primary">Hub.</span></h1>
              <p className="text-muted-foreground mt-1">Industrial-grade alert management engine.</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) handleCancelEdit();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-bold uppercase tracking-widest text-xs hidden sm:flex bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/20">
                <Plus className="h-4 w-4" /> New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                  {isEditMode ? 'Edit Notification' : 'Add New Notification'}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Heading</Label>
                    <Input
                      name="title"
                      placeholder="Maintenance Update..."
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="premium-boundary h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Message</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="h-6 text-[9px] uppercase font-black">
                        {showPreview ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                        {showPreview ? 'Edit' : 'Preview'}
                      </Button>
                    </div>
                    {showPreview ? (
                      <div className="min-h-[150px] p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <MarkdownRenderer content={formData.description || '*Quick preview appear here...*'} />
                      </div>
                    ) : (
                      <Textarea
                        name="description"
                        placeholder="Industrial grade markdown supported..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={8}
                        className="premium-boundary font-mono text-xs"
                      />
                    )}
                  </div>
                  <Button className="w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl">
                    {isEditMode ? 'Update Notification' : 'Publish Live'}
                  </Button>
                  {isEditMode && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full h-12 rounded-xl border-white/10">
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
            <Card className="glass-card border-white/10 backdrop-blur-lg">
              <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm uppercase tracking-widest font-black">Active Stream</CardTitle>
                  <CardDescription className="text-[10px] font-medium">Manage and audit outgoing platform alerts.</CardDescription>
                </div>
                <Sparkles className="w-5 h-5 text-primary/40" />
              </CardHeader>
              <CardContent className="pt-6">
                <AdminDataTable
                  data={notifications}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onBulkDelete={handleBulkDelete}
                  onStatusToggle={handleStatusToggle}
                  onBulkStatusToggle={handleBulkStatusToggle}
                  searchPlaceholder="Search notifications..."
                />
              </CardContent>
            </Card>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-white/5 bg-primary/5 backdrop-blur-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2 opacity-60">
                    <Info className="w-3 h-3" />
                    Dev Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[10px] text-muted-foreground leading-relaxed pt-0">
                  Use <code>**bold**</code> for emphasis and <code>[text](url)</code> for dynamic links within the notifications.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
