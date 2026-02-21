import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Plus, Save, Building2, Loader2, MapPin, Phone, Globe, Mail, User as UserIcon, BookOpen, Warehouse, Sparkles, Binary } from "lucide-react";
import { uploadFile, institutesAPI, Institute } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function AddInstitute() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Institute>>({
    code: "",
    name: "",
    place: "",
    dist: "",
    region: "OU",
    type: "PVT",
    minority: "NA",
    mode: "COED",
    description: "",
    images: [],
    address: "",
    phone: "",
    email: "",
    website: "",
    principal: "",
    courses: [],
    facilities: [],
    status: "published"
  });
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [courseInput, setCourseInput] = useState("");
  const [facilityInput, setFacilityInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      const data = await institutesAPI.getAll();
      setInstitutes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...urls],
      }));
      toast({ title: "Visual Assets Locked", description: `${files.length} campus views ingested.` });
    } catch (error) {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  const addItem = (type: 'courses' | 'facilities', val: string, setInput: (v: string) => void) => {
    if (val.trim()) {
      setFormData((prev) => {
        const newItem = type === 'courses'
          ? { id: Date.now().toString(), name: val.trim(), code: val.trim().slice(0, 3).toUpperCase(), duration: "3 years", intake: 60 }
          : val.trim();

        return {
          ...prev,
          [type]: [...(prev[type] || []), newItem],
        };
      });
      setInput("");
    }
  };

  const removeItem = (type: 'courses' | 'facilities', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: (prev[type] as any[]).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      toast({ title: "Reference Code Required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await institutesAPI.create(formData);
      toast({ title: "Registry Updated", description: `Institute ${formData.code} synchronized successfully.` });
      setFormData({
        code: "", name: "", place: "", dist: "", region: "OU", type: "PVT", minority: "NA", mode: "COED",
        description: "", images: [], address: "", phone: "", email: "", website: "", principal: "",
        courses: [], facilities: [], status: "published"
      });
      setIsEditMode(false);
      setEditingCode(null);
      setIsDialogOpen(false);
      fetchInstitutes();
    } catch (error) {
      toast({ title: "Protocol Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Institute) => {
    setFormData({
      code: item.code,
      name: item.name,
      place: item.place || "",
      dist: item.dist || "",
      region: item.region || "OU",
      type: item.type || "PVT",
      minority: item.minority || "NA",
      mode: item.mode || "COED",
      description: item.description || "",
      images: item.images || [],
      address: item.address || "",
      phone: item.phone || "",
      email: item.email || "",
      website: item.website || "",
      principal: item.principal || "",
      courses: item.courses || [],
      facilities: item.facilities || [],
      status: item.status || "published"
    });
    setEditingCode(item.code);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      code: "", name: "", place: "", dist: "", region: "OU", type: "PVT", minority: "NA", mode: "COED",
      description: "", images: [], address: "", phone: "", email: "", website: "", principal: "",
      courses: [], facilities: [], status: "published"
    });
    setEditingCode(null);
    setIsEditMode(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async (item: Institute) => {
    if (!confirm(`Decommission ${item.code}?`)) return;
    try {
      await institutesAPI.delete(item.code);
      toast({ title: "Registry Purged" });
      fetchInstitutes();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Decommission ${ids.length} institutions?`)) return;
    try {
      await Promise.all(ids.map(id => institutesAPI.delete(id)));
      toast({ title: "Registry Harmonized", description: `${ids.length} nodes removed from global network.` });
      fetchInstitutes();
    } catch (error) {
      toast({ title: "Sync Protocol Error", variant: "destructive" });
    }
  };

  const processBulkImport = async () => {
    setIsLoading(true);
    try {
      const rows = bulkData.split('\n').filter(r => r.trim());
      const parsedData = rows.map(row => {
        const [code, name, place, dist] = row.split(',').map(s => s.trim());
        return { code, name, place, dist, status: 'published' };
      }).filter(i => i.code && i.name);

      if (parsedData.length === 0) {
        toast({ title: "Invalid Payload", description: "Format: code, name, place, district", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('institutes')
        .upsert(parsedData, { onConflict: 'code' });

      if (error) throw error;

      toast({ title: "Ingress Successful", description: `${parsedData.length} records synthesized.` });
      setIsBulkOpen(false);
      setBulkData("");
      fetchInstitutes();
    } catch (error) {
      toast({ title: "Transmission Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: "code",
      label: "Registry ID",
      sortable: true,
      render: (item: Institute) => (
        <div className="flex flex-col">
          <span className="font-black text-primary text-xs uppercase tracking-widest">{item.code}</span>
          <span className="text-[10px] text-muted-foreground font-bold truncate max-w-[150px]">{item.name}</span>
        </div>
      )
    },
    {
      key: "location",
      label: "Geography",
      render: (item: Institute) => (
        <div className="flex items-center gap-1.5 text-[10px]">
          <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="font-medium text-muted-foreground opacity-80 uppercase">{item.place}, {item.dist}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item: Institute) => (
        <Badge className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-0' : 'bg-slate-500/10 text-slate-500 border-0'}`}>
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 shadow-xl shadow-blue-500/20 text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Institute <span className="text-primary">Registry.</span></h1>
              <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/20">Manage global institutional profiles and academic infrastructure.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-xl border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 font-bold gap-2 focus-glow" onClick={() => setIsBulkOpen(true)}>
              <Binary className="w-4 h-4" />
              Bulk Ingress
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) handleCancelEdit();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-bold uppercase tracking-widest text-xs hidden sm:flex bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-xl px-6">
                  <Plus className="h-4 w-4" /> New Institute
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[1000px] border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                    {isEditMode ? 'Edit Institute Protocol' : 'Institute Protocol Architect'}
                  </DialogTitle>
                </DialogHeader>
                <div className="pt-4">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2 lg:col-span-1">
                        <Label className="text-[10px] font-black uppercase opacity-60">Reference Code</Label>
                        <Input name="code" value={formData.code} onChange={handleChange} required className="premium-boundary h-11 uppercase font-black text-primary tracking-widest" placeholder="JNGP" />
                      </div>
                      <div className="space-y-2 lg:col-span-3">
                        <Label className="text-[10px] font-black uppercase opacity-60">Full Identity Name</Label>
                        <Input name="name" value={formData.name} onChange={handleChange} required className="premium-boundary h-11" placeholder="Jawaharlal Nehru Government Polytechnic..." />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                      <div className="space-y-2 lg:col-span-2">
                        <Label className="text-[10px] font-black uppercase opacity-60">Location (Place)</Label>
                        <Input name="place" value={formData.place} onChange={handleChange} className="premium-boundary h-11" />
                      </div>
                      <div className="space-y-2 lg:col-span-1">
                        <Label className="text-[10px] font-black uppercase opacity-60">District Code</Label>
                        <Input name="dist" value={formData.dist} onChange={handleChange} className="premium-boundary h-11 uppercase" />
                      </div>
                      <div className="space-y-2 lg:col-span-1">
                        <Label className="text-[10px] font-black uppercase opacity-60">Region</Label>
                        <Input name="region" value={formData.region} onChange={handleChange} className="premium-boundary h-11" />
                      </div>
                      <div className="space-y-2 lg:col-span-1">
                        <Label className="text-[10px] font-black uppercase opacity-60">Admin Type</Label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full h-11 px-3 premium-boundary text-xs font-bold uppercase">
                          <option value="GOV">GOV</option>
                          <option value="PVT">PVT</option>
                          <option value="AID">AIDED</option>
                        </select>
                      </div>
                      <div className="space-y-2 lg:col-span-1">
                        <Label className="text-[10px] font-black uppercase opacity-60">System Mode</Label>
                        <select name="mode" value={formData.mode} onChange={handleChange} className="w-full h-11 px-3 premium-boundary text-xs font-bold uppercase">
                          <option value="COED">COED</option>
                          <option value="GIRLS">WOMEN</option>
                          <option value="BOYS">MEN</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Mission Statement / Description</Label>
                      <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="premium-boundary font-mono text-xs" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <CardHeader className="p-0 pb-2 border-b border-white/5 flex flex-row items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <CardTitle className="text-[10px] uppercase font-black tracking-widest opacity-60">Secure Communications</CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[9px] uppercase opacity-40">Principal Lead</Label>
                              <Input name="principal" value={formData.principal} onChange={handleChange} className="premium-boundary h-9 text-xs" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[9px] uppercase opacity-40">Direct Phone</Label>
                              <Input name="phone" value={formData.phone} onChange={handleChange} className="premium-boundary h-9 text-xs" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] uppercase opacity-40">Official Mail</Label>
                            <Input name="email" type="email" value={formData.email} onChange={handleChange} className="premium-boundary h-9 text-xs" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] uppercase opacity-40">Global URL</Label>
                            <Input name="website" value={formData.website} onChange={handleChange} className="premium-boundary h-9 text-xs" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] uppercase opacity-40">Physical Coordinates (Address)</Label>
                            <Textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="premium-boundary text-xs" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <CardHeader className="p-0 pb-2 border-b border-white/5 flex flex-row items-center gap-2">
                          <Binary className="w-4 h-4 text-blue-500" />
                          <CardTitle className="text-[10px] uppercase font-black tracking-widest opacity-60">Infrastructure & Academics</CardTitle>
                        </CardHeader>
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-[9px] uppercase opacity-40">Courses Manifest</Label>
                            <div className="flex gap-2">
                              <Input value={courseInput} onChange={(v) => setCourseInput(v.target.value)} className="premium-boundary h-9 text-xs" placeholder="Add Degree..." />
                              <Button type="button" size="icon" className="h-9 w-9 bg-primary" onClick={() => addItem('courses', courseInput, setCourseInput)}><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.courses?.map((c, i) => (
                                <Badge key={i} variant="outline" className="bg-blue-500/5 border-blue-500/20 text-[10px] rounded-lg pl-3 pr-1 py-1 flex gap-2">
                                  {typeof c === 'string' ? c : c.name} <button type="button" onClick={() => removeItem('courses', i)}><X className="w-3 h-3 text-rose-500" /></button>
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-[9px] uppercase opacity-40">Facility Ingress</Label>
                            <div className="flex gap-2">
                              <Input value={facilityInput} onChange={(v) => setFacilityInput(v.target.value)} className="premium-boundary h-9 text-xs" placeholder="Add Library/Lab..." />
                              <Button type="button" size="icon" className="h-9 w-9 bg-indigo-500" onClick={() => addItem('facilities', facilityInput, setFacilityInput)}><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.facilities?.map((f, i) => (
                                <Badge key={i} variant="outline" className="bg-indigo-500/5 border-indigo-500/20 text-[10px] rounded-lg pl-3 pr-1 py-1 flex gap-2">
                                  {f} <button type="button" onClick={() => removeItem('facilities', i)}><X className="w-3 h-3 text-rose-500" /></button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase opacity-60">Campus Visual Archives</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {formData.images?.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 shadow-lg group">
                            <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-rose-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <X className="w-6 h-6 text-white" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="aspect-square rounded-xl border-dashed border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all">
                          {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Sync Visual</span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isEditMode ? 'Update Institution Profile' : 'Register Institution Profile'}
                    </Button>
                    {isEditMode && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full h-14 rounded-2xl border-white/10 bg-transparent text-white focus:bg-white/5 hover:bg-white/10 uppercase font-black text-xs tracking-widest mt-4">
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
          <div className="w-full">
            <Card className="glass-card border-white/10 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="flex items-center gap-2 uppercase tracking-tighter font-black">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Registry Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminDataTable
                  data={institutes}
                  columns={columns}
                  onDelete={handleDelete}
                  onBulkDelete={handleBulkDelete}
                  searchPlaceholder="Search global codes..."
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {[
              { icon: BookOpen, label: "Academic Depth", value: `${institutes.reduce((acc, i) => acc + (i.courses?.length || 0), 0)} Courses`, color: "text-blue-500" },
              { icon: Warehouse, label: "Asset Density", value: `${institutes.reduce((acc, i) => acc + (i.facilities?.length || 0), 0)} Facilities`, color: "text-indigo-500" }
            ].map((stat, i) => (
              <Card key={i} className="border-white/5 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    <div>
                      <p className="text-[9px] uppercase font-black tracking-widest opacity-40">{stat.label}</p>
                      <p className="text-sm font-black">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
          <DialogContent className="sm:max-w-[600px] border-white/5 bg-card/95 backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tighter uppercase">Industrial <span className="text-primary">Ingress.</span></DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-40">Batch Institute Synchronization Protocol</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black opacity-60">Dataset (CSV Format)</Label>
                <p className="text-[10px] text-muted-foreground italic mb-2">Structure: Code, Name, Place, District (One per line)</p>
                <Textarea
                  placeholder="EX: JNGP, Jawaharlal Nehru Poly, Hyderabad, HYD"
                  className="min-h-[300px] premium-boundary font-mono text-xs bg-black/20"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                />
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 italic text-[10px] text-muted-foreground">
                <Binary className="w-4 h-4 text-primary shrink-0" />
                This will resolve primary keys and update existing records if codes match. New records will be synthesized automatically.
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" className="rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => setIsBulkOpen(false)}>Abort</Button>
              <Button className="rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/25" onClick={processBulkImport} disabled={isLoading}>Execute Ingress</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout >
  );
}
