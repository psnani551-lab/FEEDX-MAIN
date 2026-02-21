import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Palette, Sparkles, Box, Layout, Save, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAppearance() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState({
        primaryColor: "217 91% 60%",
        glowIntensity: 0.25,
        glassContrast: 0.1,
        brandingName: "FeedX Portal"
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('appearance')
                .select('*')
                .eq('id', 'settings')
                .single();

            if (data) {
                setSettings(data as any);
                applyBranding(data.primary_color || data.primaryColor);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const applyBranding = (color: string) => {
        document.documentElement.style.setProperty('--dynamic-primary', color);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('appearance')
                .upsert({
                    id: 'settings',
                    ...settings,
                    updated_at: new Date().toISOString()
                });

            if (!error) {
                toast({ title: "Branding Saved", description: "Global aesthetics updated successfully." });
            } else {
                throw error;
            }
        } catch (error) {
            toast({ title: "Sync Failed", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const colorOptions = [
        { label: "Google Blue", value: "217 91% 60%", color: "bg-[#3b82f6]" },
        { label: "Emerald Edge", value: "160 84% 39%", color: "bg-[#10b981]" },
        { label: "Royal Indigo", value: "243 75% 59%", color: "bg-[#6366f1]" },
        { label: "Rose Crimson", value: "330 81% 60%", color: "bg-[#f43f5e]" },
        { label: "Amber Gold", value: "38 92% 50%", color: "bg-[#f59e0b]" },
        { label: "Cyan Cyber", value: "189 94% 43%", color: "bg-[#06b6d4]" },
    ];

    return (
        <AdminLayout>
            <div className="space-y-10">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-xl shadow-primary/20 text-white">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">Visual <span className="text-primary">Identity.</span></h1>
                            <p className="text-muted-foreground font-medium text-xs uppercase tracking-[0.2em] opacity-40">System-wide Branding & Aesthetic Control</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={fetchSettings} className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 gap-2 font-bold px-6 h-12">
                            <RotateCcw size={16} />
                            Reset
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="rounded-xl bg-primary text-white gap-2 font-black uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/25 h-12">
                            <Save size={16} />
                            Save Config
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-white/5 bg-card/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest font-black flex items-center gap-2">
                                <Box className="w-4 h-4 text-primary" />
                                Color Engine
                            </CardTitle>
                            <CardDescription>Select the system-wide primary accent color.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {colorOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            setSettings(prev => ({ ...prev, primaryColor: opt.value }));
                                            applyBranding(opt.value);
                                        }}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${settings.primaryColor === opt.value ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full ${opt.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                                        {settings.primaryColor === opt.value && (
                                            <motion.div layoutId="activeColor" className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-widest font-black flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Atmospheric Glow
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-0">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-bold uppercase opacity-60">Intensity</Label>
                                        <span className="text-[10px] font-mono text-primary font-bold">{(settings.glowIntensity * 100).toFixed(0)}%</span>
                                    </div>
                                    <Slider
                                        value={[settings.glowIntensity * 100]}
                                        onValueChange={(v) => setSettings(prev => ({ ...prev, glowIntensity: v[0] / 100 }))}
                                        max={100}
                                        step={1}
                                        className="py-4"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-bold uppercase opacity-60">Glass Contrast</Label>
                                        <span className="text-[10px] font-mono text-primary font-bold">{(settings.glassContrast * 100).toFixed(0)}%</span>
                                    </div>
                                    <Slider
                                        value={[settings.glassContrast * 100]}
                                        onValueChange={(v) => setSettings(prev => ({ ...prev, glassContrast: v[0] / 100 }))}
                                        max={100}
                                        step={1}
                                        className="py-4"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/5 bg-primary/5 hover:bg-primary/10 transition-colors cursor-help">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <Layout className="w-8 h-8 text-primary shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Aesthetic Guide</p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">Changes applied here will affect the global CSS variables and update the portal's atmosphere in real-time for all administrators.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
