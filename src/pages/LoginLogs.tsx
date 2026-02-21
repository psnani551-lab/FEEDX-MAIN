import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Activity, User, Clock, Globe, ShieldCheck, ShieldAlert, History, Search, RefreshCcw } from 'lucide-react';

interface LoginLog {
  id: number;
  username: string;
  login_time: string;
  ip_address: string;
  success: boolean;
  device_info?: string;
}

const parseDevice = (ua?: string): string => {
  if (!ua) return 'Unknown Device';
  if (/iPhone|iPad/.test(ua)) return '📱 iOS';
  if (/Android/.test(ua)) return '📱 Android';
  if (/Windows/.test(ua)) return '🖥 Windows';
  if (/Mac OS/.test(ua)) return '🍎 macOS';
  if (/Linux/.test(ua)) return '🐧 Linux';
  return '🌐 Browser';
};

export default function LoginLogs() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterUsername, setFilterUsername] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('login_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterUsername) {
        query = query.ilike('email', `%${filterUsername}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const normalizedLogs: LoginLog[] = (data || []).map(log => ({
        id: log.id,
        username: log.email || 'Unknown',
        login_time: log.created_at,
        ip_address: log.ip_address || '—',
        success: log.success ?? true,
        device_info: log.user_agent
      }));

      setLogs(normalizedLogs);
    } catch (error) {
      toast({ title: 'Audit Retrieval Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Secured Axis", value: logs.filter(l => l.success).length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Breach Attempts", value: logs.filter(l => !l.success).length, icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Total Handshakes", value: logs.length, icon: History, color: "text-blue-500", bg: "bg-blue-500/10" }
  ];

  const columns = [
    {
      key: "username",
      label: "Operator",
      sortable: true,
      render: (log: LoginLog) => (
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-muted-foreground opacity-40" />
          <span className="font-black text-xs uppercase tracking-widest text-white">{log.username}</span>
        </div>
      )
    },
    {
      key: "login_time",
      label: "Timestamp",
      sortable: true,
      render: (log: LoginLog) => (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold italic">
          <Clock className="w-3 h-3 opacity-40" />
          {new Date(log.login_time).toLocaleString()}
        </div>
      )
    },
    {
      key: "ip_address",
      label: "Access Source",
      render: (log: LoginLog) => (
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-muted-foreground opacity-40" />
          <span className="text-[10px] font-mono text-muted-foreground">{log.ip_address}</span>
        </div>
      )
    },
    {
      key: "device_info",
      label: "Device",
      render: (log: LoginLog) => (
        <span className="text-[10px] font-bold text-muted-foreground">{parseDevice(log.device_info)}</span>
      )
    },
    {
      key: "success",
      label: "Status",
      render: (log: LoginLog) => (
        <Badge variant="outline" className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${log.success ? 'bg-emerald-500/10 text-emerald-500 border-0' : 'bg-rose-500/10 text-rose-500 border-0'}`}>
          {log.success ? '✓ Validated' : '✗ Rejected'}
        </Badge>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-xl shadow-black/20 text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-1">Audit <span className="text-primary">Logs.</span></h1>
              <p className="text-muted-foreground font-medium text-xs uppercase tracking-[0.2em] opacity-40">Global Login Stream & Security Forensics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Filter by ID..."
                value={filterUsername}
                onChange={(e) => setFilterUsername(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl h-12 w-64 pr-10 text-xs font-bold uppercase tracking-widest"
              />
              <Button onClick={fetchLogs} size="icon" variant="ghost" className="absolute right-1 top-1 h-10 w-10 hover:bg-white/5">
                <Search className="w-4 h-4 opacity-40" />
              </Button>
            </div>
            <Button onClick={fetchLogs} disabled={loading} variant="outline" className="h-12 w-12 rounded-xl border-white/10 hover:bg-white/5">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-white/5 bg-card/20 backdrop-blur-xl overflow-hidden relative">
              <div className={`absolute top-0 right-0 p-8 opacity-5`}>
                <stat.icon size={64} />
              </div>
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 mb-2">{stat.label}</p>
                <div className="flex items-end gap-3">
                  <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                  <div className={`mb-2 px-2 py-0.5 rounded-full ${stat.bg} ${stat.color} text-[8px] font-bold uppercase tracking-widest`}>
                    Live Stream
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-white/5 bg-card/10 backdrop-blur-2xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-black opacity-40">Platform Sovereignty Journal</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AdminDataTable
              data={logs}
              columns={columns}
              searchPlaceholder="Sift through records..."
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
