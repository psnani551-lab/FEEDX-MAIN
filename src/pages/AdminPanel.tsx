import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { notificationsAPI, updatesAPI, resourcesAPI, eventsAPI } from "@/lib/api";
import {
  Users, Bell, Newspaper, BookOpen, Calendar,
  TrendingUp, Activity, ArrowUpRight, ArrowDownRight, ShieldAlert, Database
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminDashboardSkeleton } from "@/components/AdminSkeletons";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AdminPanel() {
  const [stats, setStats] = useState({
    notifications: 0,
    updates: 0,
    resources: 0,
    events: 0,
    users: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [notifs, updates, resources, events, { data: auditLogs }] = await Promise.all([
          notificationsAPI.getAll().catch(() => []),
          updatesAPI.getAll().catch(() => []),
          resourcesAPI.getAll().catch(() => []),
          eventsAPI.getAll().catch(() => []),
          supabase.from('login_logs').select('*').order('created_at', { ascending: false }).limit(5)
        ]);

        const safeActivities = Array.isArray(auditLogs) ? auditLogs.map(log => ({
          ...log,
          type: 'login',
          username: log.email || 'Admin',
          action: 'LOGIN',
          timestamp: log.created_at,
          success: true // If it's in logs, it's a login attempt/success
        })) : [];

        setStats({
          notifications: notifs.length,
          updates: updates.length,
          resources: resources.length,
          events: events.length,
          users: 5042, // Mock for now
        });
        setActivities(safeActivities);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const chartData = [
    { name: 'Mon', users: 4000 },
    { name: 'Tue', users: 4500 },
    { name: 'Wed', users: 4200 },
    { name: 'Thu', users: 5100 },
    { name: 'Fri', users: 4800 },
    { name: 'Sat', users: 5042 },
    { name: 'Sun', users: 5200 },
  ];

  const distributionData = [
    { name: 'Updates', value: stats.updates, color: '#10b981' },
    { name: 'Resources', value: stats.resources, color: '#6366f1' },
    { name: 'Notifications', value: stats.notifications, color: '#f59e0b' },
    { name: 'Events', value: stats.events, color: '#f43f5e' },
  ];

  const statCards = [
    { label: "Community Members", value: stats.users, icon: Users, color: "text-blue-500", trend: "+12%", up: true },
    { label: "Active Notifications", value: stats.notifications, icon: Bell, color: "text-amber-500", trend: "Live", up: true },
    { label: "Platform Updates", value: stats.updates, icon: Newspaper, color: "text-emerald-500", trend: "+2 this week", up: true },
    { label: "Resources", value: stats.resources, icon: BookOpen, color: "text-indigo-500", trend: "+5%", up: true },
    { label: "Planned Events", value: stats.events, icon: Calendar, color: "text-rose-500", trend: "Upcoming", up: true },
  ];

  return (
    <AdminLayout>
      <ErrorBoundary>
        {isLoading ? (
          <AdminDashboardSkeleton />
        ) : (
          <div className="space-y-10">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Systems <span className="text-primary">Overview.</span></h1>
              <p className="text-muted-foreground font-medium">Real-time platform metrics and content status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
              {statCards.map((card, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={card.label}
                >
                  <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all duration-500 focus-glow-hover hover:scale-[1.02]">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg bg-white/5 transition-transform group-hover:scale-110 ${card.color}`}>
                          <card.icon className="w-5 h-5" />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${card.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {card.trend}
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-black">{card.value}</CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-widest font-black opacity-60 mt-1">{card.label}</CardDescription>
                    </CardHeader>
                    <div className="h-1.5 w-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className={`h-full w-2/3 ${card.color.replace('text', 'bg')}/40`}
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-white/5 bg-card/40 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest font-black flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Growth Trajectory
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} hide />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/40">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest font-black flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Content Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Activity Feed and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-8 border-white/5 bg-card/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Live Feed
                  </CardTitle>
                  <CardDescription>Recent administrative actions and updates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {activities.length > 0 ? (
                      activities.slice(0, 5).map((act, i) => (
                        <div key={i} className="flex gap-4 items-start pb-6 border-b border-white/5 last:border-0 last:pb-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${act.type === 'login' ? (act.success ? 'bg-emerald-500/10' : 'bg-rose-500/10') : 'bg-primary/10'}`}>
                            {act.type === 'login' ? (act.success ? <ShieldAlert className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />) : <TrendingUp className="w-4 h-4 text-primary" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              <span className="text-primary font-bold">{act.username}</span> {act.type === 'login' ? (act.success ? 'validated entry' : 'attempted breach') : `${act.action.toLowerCase()}d ${act.resource}`}
                              {act.details?.title && <> "<span className="text-foreground font-bold">{act.details.title}</span>"</>}
                            </p>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{new Date(act.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-muted-foreground italic py-10">Waiting for live data transmission...</p>
                    )}
                    <p className="text-center text-xs text-muted-foreground font-medium pt-4 italic border-t border-white/5">
                      View full forensics in System Logs section.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-4 border-white/5 bg-card/40">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Platform stability and server status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server API</span>
                    <span className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database (JSON)</span>
                    <span className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-4">Quick Links</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold transition-all focus-glow hover:scale-[1.02]">Clear Cache</button>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold transition-all focus-glow hover:scale-[1.02]">Audit Health</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </AdminLayout>
  );
}
