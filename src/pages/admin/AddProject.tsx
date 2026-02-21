import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Bot, PlusSquare, X } from 'lucide-react';
import { projectsAPI, Project } from '@/lib/api';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function AddProject() {
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('Planning');
    const [description, setDescription] = useState('');
    const [details, setDetails] = useState<string[]>(['']);

    const fetchProjects = async () => {
        try {
            const data = await projectsAPI.getAll();
            setProjects(data || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            toast({ title: 'Error loading projects', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const resetForm = () => {
        setTitle('');
        setSubtitle('');
        setCategory('');
        setStatus('Planning');
        setDescription('');
        setDetails(['']);
        setEditingId(null);
    };

    const handleEdit = (project: Project) => {
        setTitle(project.title);
        setSubtitle(project.subtitle);
        setCategory(project.category);
        setStatus(project.status);
        setDescription(project.description);
        setDetails(project.details.length > 0 ? project.details : ['']);
        setEditingId(project.id);
        setIsDialogOpen(true);
    };

    const handleAddDetail = () => {
        setDetails([...details, '']);
    };

    const handleDetailChange = (index: number, value: string) => {
        const newDetails = [...details];
        newDetails[index] = value;
        setDetails(newDetails);
    };

    const handleRemoveDetail = (index: number) => {
        if (details.length > 1) {
            const newDetails = details.filter((_, i) => i !== index);
            setDetails(newDetails);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const cleanDetails = details.filter(d => d.trim() !== '');
            const payload = {
                title,
                subtitle,
                category,
                status,
                description,
                details: cleanDetails
            };

            if (editingId) {
                await projectsAPI.update(editingId, payload);
                toast({ title: 'Project updated successfully' });
            } else {
                await projectsAPI.create(payload);
                toast({ title: 'Project created successfully' });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchProjects();
        } catch (error) {
            console.error('Save error:', error);
            toast({ title: 'Failed to save project', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await projectsAPI.delete(id);
            toast({ title: 'Project deleted successfully' });
            fetchProjects();
        } catch (error) {
            toast({ title: 'Failed to delete project', variant: 'destructive' });
        }
    };

    return (
        <AdminLayout>
            <ErrorBoundary>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                                Manage <span className="text-primary">Projects.</span>
                            </h1>
                            <p className="text-muted-foreground font-medium">Add or edit student projects and innovations.</p>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 font-bold uppercase tracking-widest text-xs hidden sm:flex">
                                    <Plus className="h-4 w-4" /> New Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                                        {editingId ? 'Edit Project' : 'Add New Project'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase font-black text-[10px] tracking-widest text-muted-foreground">Title</Label>
                                            <Input required value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors" placeholder="e.g. Smart Feedback Analyzer" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase font-black text-[10px] tracking-widest text-muted-foreground">Category</Label>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-colors text-foreground"
                                                required
                                            >
                                                <option value="" disabled className="bg-background text-muted-foreground">Select Category Area</option>
                                                <option value="Technology" className="bg-background text-foreground">Technology</option>
                                                <option value="Student Support" className="bg-background text-foreground">Student Support</option>
                                                <option value="Education" className="bg-background text-foreground">Education</option>
                                                <option value="Innovation" className="bg-background text-foreground">Innovation</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase font-black text-[10px] tracking-widest text-muted-foreground">Subtitle (One-liner)</Label>
                                            <Input required value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors" placeholder="e.g. AI-driven sentiment analysis." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase font-black text-[10px] tracking-widest text-muted-foreground">Status</Label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-colors text-foreground"
                                                required
                                            >
                                                <option value="Planning" className="bg-background text-slate-500 font-bold">Planning</option>
                                                <option value="Coming Soon" className="bg-background text-yellow-500 font-bold">Coming Soon</option>
                                                <option value="Pilot" className="bg-background text-blue-500 font-bold">Pilot</option>
                                                <option value="Active" className="bg-background text-emerald-500 font-bold">Active</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="uppercase font-black text-[10px] tracking-widest text-muted-foreground">Description</Label>
                                        <Textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px] bg-white/5 border-white/10 focus:border-primary/50 transition-colors" placeholder="Full description of the project..." />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="uppercase font-black text-[10px] tracking-widest text-muted-foreground">Project Details / Bullet Points</Label>
                                        {details.map((detail, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    value={detail}
                                                    onChange={(e) => handleDetailChange(index, e.target.value)}
                                                    className="bg-white/5 border-white/10 focus:border-primary/50"
                                                    placeholder={`Bullet point ${index + 1}`}
                                                />
                                                {details.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveDetail(index)} className="shrink-0 text-muted-foreground hover:text-destructive">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={handleAddDetail} className="mt-2 border-white/10 text-xs font-bold uppercase tracking-widest">
                                            <PlusSquare className="h-4 w-4 mr-2" /> Add Detail
                                        </Button>
                                    </div>

                                    <Button type="submit" className="w-full font-bold uppercase tracking-widest">
                                        {editingId ? 'Save Changes' : 'Create Project'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Bot className="w-5 h-5 text-primary" /> Active Portfolios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
                            ) : projects.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-white/5 rounded-xl">
                                    No projects found. Create one to get started.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-white/5">
                                            <TableRow className="border-white/5 hover:bg-transparent">
                                                <TableHead className="font-bold uppercase tracking-widest text-[10px]">Title</TableHead>
                                                <TableHead className="font-bold uppercase tracking-widest text-[10px]">Category</TableHead>
                                                <TableHead className="font-bold uppercase tracking-widest text-[10px]">Status</TableHead>
                                                <TableHead className="text-right font-bold uppercase tracking-widest text-[10px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {projects.map((project) => (
                                                <TableRow key={project.id} className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                                    <TableCell className="font-bold">
                                                        <div>{project.title}</div>
                                                        <div className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">{project.subtitle}</div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium">
                                                        <span className="bg-primary/20 text-primary px-2 py-1 rounded-md">{project.category}</span>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold">
                                                        {project.status}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(project)} className="hover:text-primary hover:bg-primary/10 transition-colors">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </ErrorBoundary>
        </AdminLayout>
    );
}
