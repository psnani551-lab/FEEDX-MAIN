import { useState, useEffect } from 'react';

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

const parseDeviceDetails = (ua?: string) => {
  if (!ua) return { os: 'Unknown OS', osIcon: '💻', browser: 'Unknown Browser' };

  let os = 'Unknown OS';
  let osIcon = '💻';
  if (/Windows NT 10.0/.test(ua)) { os = 'Windows 10/11'; osIcon = '🖥'; }
  else if (/Windows/.test(ua)) { os = 'Windows'; osIcon = '🖥'; }
  else if (/Mac OS X/.test(ua)) { os = 'macOS'; osIcon = '🍎'; }
  else if (/Android/.test(ua)) { os = 'Android'; osIcon = '📱'; }
  else if (/iPhone|iPad|iPod/.test(ua)) { os = 'iOS'; osIcon = '📱'; }
  else if (/Linux/.test(ua)) { os = 'Linux'; osIcon = '🐧'; }

  let browser = 'Unknown Browser';
  if (/Chrome/.test(ua) && !/Edg/.test(ua) && !/OPR/.test(ua)) browser = 'Chrome';
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Firefox/.test(ua)) browser = 'Firefox';
  else if (/Edg/.test(ua)) browser = 'Edge';
  else if (/OPR/.test(ua) || /Opera/.test(ua)) browser = 'Opera';

  return { os, osIcon, browser };
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
      // Fetch real login data from VPS — no Supabase contact, ISP-safe
      let url = '/api/auth/login-logs';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let normalizedLogs: LoginLog[] = (data || []).map((log: any) => ({
        id: log.id,
        username: log.username || log.email || 'Unknown',
        login_time: log.login_time || log.created_at,
        ip_address: log.ip_address || '—',
        success: log.success ?? true,
        device_info: log.userAgent || log.user_agent || log.device_info
      }));

      // Filter by username if provided
      if (filterUsername) {
        normalizedLogs = normalizedLogs.filter(l =>
          l.username.toLowerCase().includes(filterUsername.toLowerCase())
        );
      }

      setLogs(normalizedLogs);
    } catch (error) {
      toast({ title: 'Audit Retrieval Error', description: 'Could not load login logs.', variant: 'destructive' });
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
      label: "Operator ID",
      sortable: true,
      render: (log: LoginLog) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${log.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs uppercase tracking-widest text-foreground">{log.username}</span>
            <span className="text-[9px] text-muted-foreground uppercase opacity-60 mt-0.5">Authorization Target</span>
          </div>
        </div>
      )
    },
    {
      key: "login_time",
      label: "Temporal Data",
      sortable: true,
      render: (log: LoginLog) => {
        const d = new Date(log.login_time);
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
              <Clock className="w-3 h-3 text-primary" />
              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{d.toLocaleDateString()}</span>
          </div>
        );
      }
    },
    {
      key: "ip_address",
      label: "Access Source",
      render: (log: LoginLog) => (
        <div className="flex flex-col gap-1">
          <a
            href={`https://whatismyipaddress.com/ip/${log.ip_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            title="Trace IP Location"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-mono font-bold text-foreground underline decoration-blue-500/50 underline-offset-4">{log.ip_address}</span>
          </a>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-60">Network Origin</span>
        </div>
      )
    },
    {
      key: "device_info",
      label: "System Signature",
      render: (log: LoginLog) => {
        const { os, osIcon, browser } = parseDeviceDetails(log.device_info);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px]">{osIcon}</span>
              <span className="text-[11px] font-bold text-foreground">{os}</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground text-indigo-400">{browser}</span>
          </div>
        );
      }
    },
    {
      key: "success",
      label: "Access Status",
      render: (log: LoginLog) => (
        <div className="flex justify-end pr-4">
          <Badge variant="outline" className={`uppercase text-[10px] font-black tracking-widest px-3 py-1 rounded-full ${log.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}`}>
            {log.success ? '✓ Granted' : '✗ Denied'}
          </Badge>
        </div>
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
