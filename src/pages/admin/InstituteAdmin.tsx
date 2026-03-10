import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Upload, X, Plus, Save, Building2, Loader2, Trash2,
  Users, GraduationCap, BookOpen, Briefcase, Image, Building,
  MessageSquare, HelpCircle, Info, Database, Sparkles, Binary
} from "lucide-react";
import {
  uploadFile, institutesAPI, Institute,
  FacultyMember, Department, Course, Placement,
  GalleryImage, Infrastructure, Review, QA
} from "@/lib/api";

import { Badge } from "@/components/ui/badge";

// Interfaces (Converted to use global Institute type where possible)
type InstituteData = Institute;

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function InstituteAdmin() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [institute, setInstitute] = useState<InstituteData | null>(null);

  useEffect(() => {
    const fetchInstitute = async () => {
      if (!code) return;
      try {
        const data = await institutesAPI.getById(code);
        setInstitute(data);
      } catch (error) {
        toast({ title: "Reference Missing", description: "Identity could not be verified.", variant: "destructive" });
        navigate("/admin/institutes");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstitute();
  }, [code, navigate, toast]);

  const saveInstitute = async () => {
    if (!institute) return;
    setIsSaving(true);
    try {
      await institutesAPI.create(institute);
      toast({ title: "Matrix Synchronized", description: "Global registry updated." });
    } catch (error) {
      toast({ title: "Protocol Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof InstituteData, value: any) => {
    setInstitute(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium animate-pulse">Syncing institutional data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!institute) return null;

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/institutes")} className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">{institute.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/5 border-blue-500/10 text-[10px] uppercase font-black tracking-widest text-primary">{institute.code}</Badge>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Matrix Detail View</span>
              </div>
            </div>
          </div>
          <Button onClick={saveInstitute} disabled={isSaving} className="bg-primary text-white font-black uppercase text-xs tracking-widest h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Global Update
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-white/5 p-2 rounded-2xl border border-white/5">
            {[
              { value: "info", label: "Registry", icon: Info },
              { value: "departments", label: "Nodes", icon: Building2 },
              { value: "faculty", label: "Agents", icon: Users },
              { value: "courses", label: "Programs", icon: BookOpen },
              { value: "placements", label: "Yield", icon: Briefcase },
              { value: "gallery", label: "Assets", icon: Image },
              { value: "infrastructure", label: "Layers", icon: Building },
              { value: "reviews", label: "Signals", icon: MessageSquare },
              { value: "qna", label: "Support", icon: HelpCircle },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-[100px] h-11 px-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 gap-2 transition-all">
                <tab.icon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

            <TabsContent value="info" className="mt-0 outline-none">
              <CollegeInfoTab institute={institute} updateField={updateField} toast={toast} />
            </TabsContent>

            <TabsContent value="departments" className="mt-0 outline-none">
              <DepartmentsTab
                departments={institute.departments || []}
                onChange={(deps) => updateField('departments', deps)}
              />
            </TabsContent>

            <TabsContent value="faculty" className="mt-0 outline-none">
              <FacultyTab
                faculty={institute.faculty || []}
                departments={institute.departments || []}
                onChange={(fac) => updateField('faculty', fac)}
                toast={toast}
              />
            </TabsContent>

            <TabsContent value="courses" className="mt-0 outline-none">
              <CoursesTab
                courses={institute.courses || []}
                departments={institute.departments || []}
                onChange={(courses) => updateField('courses', courses)}
              />
            </TabsContent>

            <TabsContent value="placements" className="mt-0 outline-none">
              <PlacementsTab
                placements={institute.placements || []}
                onChange={(pl) => updateField('placements', pl)}
              />
            </TabsContent>

            <TabsContent value="gallery" className="mt-0 outline-none">
              <GalleryTab
                gallery={institute.gallery || []}
                onChange={(gal) => updateField('gallery', gal)}
                toast={toast}
              />
            </TabsContent>

            <TabsContent value="infrastructure" className="mt-0 outline-none">
              <InfrastructureTab
                infrastructure={institute.infrastructure || []}
                onChange={(infra) => updateField('infrastructure', infra)}
                toast={toast}
              />
            </TabsContent>

            <TabsContent value="reviews" className="mt-0 outline-none">
              <ReviewsTab
                reviews={institute.reviews || []}
                onChange={(rev) => updateField('reviews', rev)}
              />
            </TabsContent>

            <TabsContent value="qna" className="mt-0 outline-none">
              <QnATab
                qna={institute.qna || []}
                onChange={(qa) => updateField('qna', qa)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// ==================== TAB COMPONENTS ====================

// College Info Tab
function CollegeInfoTab({ institute, updateField, toast }: {
  institute: InstituteData;
  updateField: (field: keyof InstituteData, value: any) => void;
  toast: any;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [facilityInput, setFacilityInput] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'bannerImage' | 'logoImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file, "images");
      updateField(field, url);
      toast({ title: `${field === 'bannerImage' ? 'Banner' : 'Logo'} uploaded` });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const addFacility = () => {
    if (facilityInput.trim()) {
      updateField('facilities', [...(institute.facilities || []), facilityInput.trim()]);
      setFacilityInput("");
    }
  };

  const removeFacility = (index: number) => {
    updateField('facilities', (institute.facilities || []).filter((_, i) => i !== index));
  };

  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Institute Name</Label>
            <Input value={institute.name} onChange={(e) => updateField('name', e.target.value)} className="premium-boundary" />
          </div>
          <div>
            <Label>Code</Label>
            <Input value={institute.code} disabled className="bg-muted premium-boundary" />
          </div>
          <div>
            <Label>Place</Label>
            <Input value={institute.place || ''} onChange={(e) => updateField('place', e.target.value)} className="premium-boundary" />
          </div>
          <div>
            <Label>District</Label>
            <Input value={institute.dist || ''} onChange={(e) => updateField('dist', e.target.value)} className="premium-boundary" />
          </div>
          <div>
            <Label>Principal Name</Label>
            <Input value={institute.principal || ''} onChange={(e) => updateField('principal', e.target.value)} className="premium-boundary" />
          </div>
          <div>
            <Label>Established Year</Label>
            <Input value={institute.established || ''} onChange={(e) => updateField('established', e.target.value)} className="premium-boundary" />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={institute.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="premium-boundary"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Vision</Label>
            <Textarea
              value={institute.vision || ''}
              onChange={(e) => updateField('vision', e.target.value)}
              rows={3}
              placeholder="Institute Vision..."
              className="premium-boundary"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Mission</Label>
            <Textarea
              value={institute.mission || ''}
              onChange={(e) => updateField('mission', e.target.value)}
              rows={3}
              placeholder="Institute Mission..."
              className="premium-boundary"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Unique Features</Label>
            <Textarea
              value={institute.unique_features || ''}
              onChange={(e) => updateField('unique_features', e.target.value)}
              rows={3}
              placeholder="Unique physical or academic features..."
              className="premium-boundary"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Textarea value={institute.address || ''} onChange={(e) => updateField('address', e.target.value)} rows={2} className="premium-boundary" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={institute.phone || ''} onChange={(e) => updateField('phone', e.target.value)} className="premium-boundary" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={institute.email || ''} onChange={(e) => updateField('email', e.target.value)} className="premium-boundary" />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={institute.website || ''} onChange={(e) => updateField('website', e.target.value)} className="premium-boundary" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Banner Image</Label>
            <div className="mt-2">
              {institute.bannerImage && (
                <img src={institute.bannerImage} alt="Banner" className="w-full h-32 object-cover rounded mb-2" />
              )}
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bannerImage')} disabled={isUploading} />
            </div>
          </div>
          <div>
            <Label>Logo Image</Label>
            <div className="mt-2">
              {institute.logoImage && (
                <img src={institute.logoImage} alt="Logo" className="w-24 h-24 object-contain rounded mb-2" />
              )}
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoImage')} disabled={isUploading} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              value={facilityInput}
              onChange={(e) => setFacilityInput(e.target.value)}
              placeholder="Add a facility (e.g., Library, Computer Lab)"
              onKeyPress={(e) => e.key === 'Enter' && addFacility()}
              className="premium-boundary"
            />
            <Button onClick={addFacility}><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(institute.facilities || []).map((facility, index) => (
              <span key={index} className="px-3 py-1 bg-primary/20 rounded-full text-sm flex items-center gap-2">
                {facility}
                <button onClick={() => removeFacility(index)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Departments Tab
function DepartmentsTab({ departments, onChange }: {
  departments: Department[];
  onChange: (deps: Department[]) => void;
}) {
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '', intake: '' });

  const addDepartment = () => {
    if (!newDept.name || !newDept.code) return;
    onChange([...departments, {
      id: generateId(),
      name: newDept.name,
      code: newDept.code,
      description: newDept.description,
      intake: parseInt(newDept.intake) || 60,
      labs: []
    }]);
    setNewDept({ name: '', code: '', description: '', intake: '' });
  };

  const removeDepartment = (id: string) => {
    onChange(departments.filter(d => d.id !== id));
  };

  const updateDepartment = (id: string, field: keyof Department, value: any) => {
    onChange(departments.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add New Department</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input placeholder="Department Name" value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} className="premium-boundary" />
          <Input placeholder="Code (e.g., CSE)" value={newDept.code} onChange={(e) => setNewDept({ ...newDept, code: e.target.value })} className="premium-boundary" />
          <Input placeholder="Intake" type="number" value={newDept.intake} onChange={(e) => setNewDept({ ...newDept, intake: e.target.value })} className="premium-boundary" />
          <Button onClick={addDepartment}><Plus className="w-4 h-4 mr-2" /> Add</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Name</Label>
                    <Input value={dept.name} onChange={(e) => updateDepartment(dept.id, 'name', e.target.value)} />
                  </div>
                  <div>
                    <Label>Code</Label>
                    <Input value={dept.code} onChange={(e) => updateDepartment(dept.id, 'code', e.target.value)} />
                  </div>
                  <div>
                    <Label>Intake</Label>
                    <Input type="number" value={dept.intake || ''} onChange={(e) => updateDepartment(dept.id, 'intake', parseInt(e.target.value))} />
                  </div>
                  <div className="md:col-span-3">
                    <Label>Description</Label>
                    <Textarea value={dept.description || ''} onChange={(e) => updateDepartment(dept.id, 'description', e.target.value)} />
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeDepartment(dept.id)} className="text-destructive ml-4">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {departments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No departments added yet</p>
        )}
      </div>
    </div>
  );
}

// Faculty Tab
function FacultyTab({ faculty, departments, onChange, toast }: {
  faculty: FacultyMember[];
  departments: Department[];
  onChange: (fac: FacultyMember[]) => void;
  toast: any;
}) {
  const [newFac, setNewFac] = useState({ name: '', designation: '', qualification: '', department: '', email: '', phone: '', experience: '' });
  const [isUploading, setIsUploading] = useState(false);

  const addFaculty = () => {
    if (!newFac.name || !newFac.designation) return;
    onChange([...faculty, { id: generateId(), ...newFac }]);
    setNewFac({ name: '', designation: '', qualification: '', department: '', email: '', phone: '', experience: '' });
  };

  const removeFaculty = (id: string) => {
    onChange(faculty.filter(f => f.id !== id));
  };

  const updateFaculty = (id: string, field: keyof FacultyMember, value: any) => {
    onChange(faculty.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, facultyId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file, "images");
      updateFaculty(facultyId, 'image', url);
      toast({ title: "Photo uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add New Faculty Member</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input placeholder="Full Name" value={newFac.name} onChange={(e) => setNewFac({ ...newFac, name: e.target.value })} />
          <Input placeholder="Designation" value={newFac.designation} onChange={(e) => setNewFac({ ...newFac, designation: e.target.value })} />
          <Input placeholder="Qualification" value={newFac.qualification} onChange={(e) => setNewFac({ ...newFac, qualification: e.target.value })} />
          <select
            className="px-3 py-2 rounded-md border bg-background premium-boundary"
            value={newFac.department}
            onChange={(e) => setNewFac({ ...newFac, department: e.target.value })}
          >
            <option value="">Select Department</option>
            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <Input placeholder="Email" type="email" value={newFac.email} onChange={(e) => setNewFac({ ...newFac, email: e.target.value })} />
          <Input placeholder="Experience (e.g., 5 years)" value={newFac.experience} onChange={(e) => setNewFac({ ...newFac, experience: e.target.value })} />
          <Button onClick={addFaculty} className="md:col-span-3"><Plus className="w-4 h-4 mr-2" /> Add Faculty</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {faculty.map((fac) => (
          <Card key={fac.id} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {fac.image ? (
                    <img src={fac.image} alt={fac.name} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <Input type="file" accept="image/*" className="mt-2 text-xs w-20" onChange={(e) => handleImageUpload(e, fac.id)} disabled={isUploading} />
                </div>
                <div className="flex-1 grid gap-2">
                  <Input value={fac.name} onChange={(e) => updateFaculty(fac.id, 'name', e.target.value)} placeholder="Name" />
                  <Input value={fac.designation} onChange={(e) => updateFaculty(fac.id, 'designation', e.target.value)} placeholder="Designation" />
                  <Input value={fac.qualification} onChange={(e) => updateFaculty(fac.id, 'qualification', e.target.value)} placeholder="Qualification" />
                  <select
                    className="px-3 py-2 rounded-md border bg-background text-sm premium-boundary"
                    value={fac.department}
                    onChange={(e) => updateFaculty(fac.id, 'department', e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFaculty(fac.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {faculty.length === 0 && (
          <p className="text-center text-muted-foreground py-8 md:col-span-2">No faculty members added yet</p>
        )}
      </div>
    </div>
  );
}

// Courses Tab
function CoursesTab({ courses, departments, onChange }: {
  courses: Course[];
  departments: Department[];
  onChange: (courses: Course[]) => void;
}) {
  const [newCourse, setNewCourse] = useState({ name: '', code: '', duration: '3 years', intake: '', departmentId: '' });

  const addCourse = () => {
    if (!newCourse.name || !newCourse.code) return;
    onChange([...courses, { id: generateId(), ...newCourse, intake: parseInt(newCourse.intake) || 60 }]);
    setNewCourse({ name: '', code: '', duration: '3 years', intake: '', departmentId: '' });
  };

  const removeCourse = (id: string) => {
    onChange(courses.filter(c => c.id !== id));
  };

  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <Input placeholder="Course Name" value={newCourse.name} onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })} />
          <Input placeholder="Code" value={newCourse.code} onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })} />
          <Input placeholder="Duration" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} />
          <Input placeholder="Intake" type="number" value={newCourse.intake} onChange={(e) => setNewCourse({ ...newCourse, intake: e.target.value })} />
          <Button onClick={addCourse}><Plus className="w-4 h-4 mr-2" /> Add</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{course.name}</h3>
                  <p className="text-sm text-muted-foreground">Code: {course.code}</p>
                  <p className="text-sm text-muted-foreground">Duration: {course.duration}</p>
                  <p className="text-sm text-muted-foreground">Intake: {course.intake}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeCourse(course.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && (
          <p className="text-center text-muted-foreground py-8 md:col-span-3">No courses added yet</p>
        )}
      </div>
    </div>
  );
}

// Placements Tab
function PlacementsTab({ placements, onChange }: {
  placements: Placement[];
  onChange: (pl: Placement[]) => void;
}) {
  const [newPl, setNewPl] = useState({ year: '', placed: '', total: '', avgPackage: '', highestPackage: '', recruiters: '' });

  const addPlacement = () => {
    if (!newPl.year) return;
    onChange([...placements, {
      id: generateId(),
      year: newPl.year,
      placed: parseInt(newPl.placed) || 0,
      total: parseInt(newPl.total) || 0,
      avgPackage: newPl.avgPackage,
      highestPackage: newPl.highestPackage,
      topRecruiters: newPl.recruiters.split(',').map(r => r.trim()).filter(Boolean)
    }]);
    setNewPl({ year: '', placed: '', total: '', avgPackage: '', highestPackage: '', recruiters: '' });
  };

  const removePlacement = (id: string) => {
    onChange(placements.filter(p => p.id !== id));
  };

  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add Placement Record</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input placeholder="Year (e.g., 2023-24)" value={newPl.year} onChange={(e) => setNewPl({ ...newPl, year: e.target.value })} />
          <Input placeholder="Students Placed" type="number" value={newPl.placed} onChange={(e) => setNewPl({ ...newPl, placed: e.target.value })} />
          <Input placeholder="Total Students" type="number" value={newPl.total} onChange={(e) => setNewPl({ ...newPl, total: e.target.value })} />
          <Input placeholder="Avg Package (e.g., 4.5 LPA)" value={newPl.avgPackage} onChange={(e) => setNewPl({ ...newPl, avgPackage: e.target.value })} />
          <Input placeholder="Highest Package" value={newPl.highestPackage} onChange={(e) => setNewPl({ ...newPl, highestPackage: e.target.value })} />
          <Input placeholder="Top Recruiters (comma separated)" value={newPl.recruiters} onChange={(e) => setNewPl({ ...newPl, recruiters: e.target.value })} />
          <Button onClick={addPlacement} className="md:col-span-3"><Plus className="w-4 h-4 mr-2" /> Add Placement Record</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {placements.map((pl) => (
          <Card key={pl.id} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="grid gap-2 md:grid-cols-5 flex-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="font-semibold">{pl.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Placed/Total</p>
                    <p className="font-semibold">{pl.placed}/{pl.total} ({Math.round((pl.placed / pl.total) * 100)}%)</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Package</p>
                    <p className="font-semibold">{pl.avgPackage || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Highest</p>
                    <p className="font-semibold">{pl.highestPackage || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Top Recruiters</p>
                    <p className="text-sm">{pl.topRecruiters?.join(', ') || '-'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removePlacement(pl.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {placements.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No placement records added yet</p>
        )}
      </div>
    </div>
  );
}

// Gallery Tab
function GalleryTab({ gallery, onChange, toast }: {
  gallery: GalleryImage[];
  onChange: (gal: GalleryImage[]) => void;
  toast: any;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i], "images");
        onChange([...gallery, { id: generateId(), url, order: gallery.length + 1 + i, caption: '', category: 'General' }]);
      }
      toast({ title: "Images uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (id: string) => {
    onChange(gallery.filter(g => g.id !== id));
  };

  const updateImage = (id: string, field: keyof GalleryImage, value: string) => {
    onChange(gallery.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" accept="image/*" multiple onChange={handleUpload} disabled={isUploading} />
          {isUploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {gallery.map((img) => (
          <Card key={img.id} className="glass-card overflow-hidden">
            <img src={img.url} alt={img.caption} className="w-full h-40 object-cover" />
            <CardContent className="pt-4">
              <Input
                placeholder="Caption"
                value={img.caption || ''}
                onChange={(e) => updateImage(img.id, 'caption', e.target.value)}
                className="mb-2"
              />
              <select
                className="w-full px-3 py-2 rounded-md border bg-background text-sm mb-2"
                value={img.category || 'General'}
                onChange={(e) => updateImage(img.id, 'category', e.target.value)}
              >
                <option value="General">General</option>
                <option value="Campus">Campus</option>
                <option value="Events">Events</option>
                <option value="Labs">Labs</option>
                <option value="Library">Library</option>
                <option value="Sports">Sports</option>
              </select>
              <Button variant="destructive" size="sm" onClick={() => removeImage(img.id)} className="w-full">
                <Trash2 className="w-3 h-3 mr-1" /> Remove
              </Button>
            </CardContent>
          </Card>
        ))}
        {gallery.length === 0 && (
          <p className="text-center text-muted-foreground py-8 md:col-span-4">No gallery images yet</p>
        )}
      </div>
    </div>
  );
}

// Infrastructure Tab
function InfrastructureTab({ infrastructure, onChange, toast }: {
  infrastructure: Infrastructure[];
  onChange: (infra: Infrastructure[]) => void;
  toast: any;
}) {
  const [newInfra, setNewInfra] = useState({ name: '', description: '', capacity: '' });
  const [isUploading, setIsUploading] = useState(false);

  const addInfrastructure = () => {
    if (!newInfra.name) return;
    onChange([...infrastructure, { id: generateId(), ...newInfra, images: [] }]);
    setNewInfra({ name: '', description: '', capacity: '' });
  };

  const removeInfrastructure = (id: string) => {
    onChange(infrastructure.filter(i => i.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, infraId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file, "images");
      onChange(infrastructure.map(i =>
        i.id === infraId ? { ...i, images: [...(i.images || []), url] } : i
      ));
      toast({ title: "Image uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add Infrastructure</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input placeholder="Name (e.g., Computer Lab)" value={newInfra.name} onChange={(e) => setNewInfra({ ...newInfra, name: e.target.value })} className="premium-boundary" />
          <Input placeholder="Capacity (e.g., 60 students)" value={newInfra.capacity} onChange={(e) => setNewInfra({ ...newInfra, capacity: e.target.value })} className="premium-boundary" />
          <Input placeholder="Description" value={newInfra.description} onChange={(e) => setNewInfra({ ...newInfra, description: e.target.value })} className="premium-boundary" />
          <Button onClick={addInfrastructure}><Plus className="w-4 h-4 mr-2" /> Add</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {infrastructure.map((infra) => (
          <Card key={infra.id} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{infra.name}</h3>
                  <p className="text-sm text-muted-foreground">{infra.capacity}</p>
                  <p className="text-sm mt-2">{infra.description}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeInfrastructure(infra.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {(infra.images || []).map((img, idx) => (
                  <img key={idx} src={img} alt="" className="w-20 h-20 object-cover rounded" />
                ))}
              </div>
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, infra.id)} disabled={isUploading} className="premium-boundary" />
            </CardContent>
          </Card>
        ))}
        {infrastructure.length === 0 && (
          <p className="text-center text-muted-foreground py-8 md:col-span-2">No infrastructure added yet</p>
        )}
      </div>
    </div>
  );
}

// Reviews Tab
function ReviewsTab({ reviews, onChange }: {
  reviews: Review[];
  onChange: (rev: Review[]) => void;
}) {
  const [newReview, setNewReview] = useState({ name: '', rating: '5', comment: '' });

  const addReview = () => {
    if (!newReview.name || !newReview.comment) return;
    onChange([...reviews, {
      id: generateId(),
      name: newReview.name,
      rating: parseInt(newReview.rating),
      comment: newReview.comment,
      date: new Date().toISOString(),
      verified: true
    }]);
    setNewReview({ name: '', rating: '5', comment: '' });
  };

  const removeReview = (id: string) => {
    onChange(reviews.filter(r => r.id !== id));
  };

  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add Review</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input placeholder="Reviewer Name" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} className="premium-boundary" />
          <select
            className="px-3 py-2 rounded-md border bg-background premium-boundary"
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
          >
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
          </select>
          <Button onClick={addReview}><Plus className="w-4 h-4 mr-2" /> Add</Button>
          <Textarea
            placeholder="Review comment"
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="md:col-span-3 premium-boundary"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{review.name}</h3>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-muted-foreground'}>★</span>
                      ))}
                    </div>
                    {review.verified && <span className="text-xs text-green-500">Verified</span>}
                  </div>
                  <p className="text-sm mt-2">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(review.date).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeReview(review.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No reviews yet</p>
        )}
      </div>
    </div>
  );
}

// Q&A Tab
function QnATab({ qna, onChange }: {
  qna: QA[];
  onChange: (qa: QA[]) => void;
}) {
  const [newQA, setNewQA] = useState({ question: '', answer: '', askedBy: '' });

  const addQA = () => {
    if (!newQA.question || !newQA.answer) return;
    onChange([...qna, {
      id: generateId(),
      ...newQA,
      answeredBy: 'Admin',
      date: new Date().toISOString()
    }]);
    setNewQA({ question: '', answer: '', askedBy: '' });
  };

  const removeQA = (id: string) => {
    onChange(qna.filter(q => q.id !== id));
  };

  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add Q&A</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input placeholder="Asked by (optional)" value={newQA.askedBy} onChange={(e) => setNewQA({ ...newQA, askedBy: e.target.value })} className="premium-boundary" />
          <Textarea placeholder="Question" value={newQA.question} onChange={(e) => setNewQA({ ...newQA, question: e.target.value })} className="premium-boundary" />
          <Textarea placeholder="Answer" value={newQA.answer} onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })} className="premium-boundary" />
          <Button onClick={addQA}><Plus className="w-4 h-4 mr-2" /> Add Q&A</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {qna.map((qa) => (
          <Card key={qa.id} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Q:</span>
                    <span>{qa.question}</span>
                  </div>
                  <div className="flex items-start gap-2 ml-6">
                    <span className="font-semibold text-green-500">A:</span>
                    <span>{qa.answer}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-6">
                    {qa.askedBy && `Asked by ${qa.askedBy} • `}Answered by {qa.answeredBy} • {new Date(qa.date).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeQA(qa.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {qna.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No Q&A added yet</p>
        )}
      </div>
    </div>
  );
}
