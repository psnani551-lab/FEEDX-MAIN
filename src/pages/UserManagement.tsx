import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Users, AlertCircle, Mail, Phone, Shield, Fingerprint, History, UserPlus, X, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    pin: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('login_logs') // For now, we'll list admins from login logs or a dedicated table
        .select('email, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Since we don't have a dedicated 'admin_users' table yet in the schema, 
      // we'll derive unique users from logs for the UI, or just show a warning.
      const uniqueUsers: User[] = Array.from(new Set(data?.map(l => l.email))).map((email, idx) => ({
        id: idx,
        username: (email as string) || 'Admin',
        name: (email as string)?.split('@')[0] || 'Administrator',
        email: (email as string) || '',
        phone: 'N/A',
        created_at: (data?.find(l => l.email === email)?.created_at as string) || new Date().toISOString()
      }));

      setUsers(uniqueUsers);
    } catch (error) {
      toast({ title: 'System Access Error', description: 'Failed to retrieve user registry.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            username: formData.username,
            phone: formData.phone,
            pin: formData.pin
          }
        }
      });

      if (error) throw error;

      toast({ title: 'Identity Created', description: `User ${formData.username} has been granted access.` });
      setFormData({ username: '', password: '', name: '', email: '', phone: '', pin: '' });
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      toast({ title: 'Protocol Failure', description: error instanceof Error ? error.message : 'Registration failed', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Revoke access for ${user.username}?`)) return;
    toast({ title: 'Notice', description: 'Service decommissioning in progress. Please use Supabase dashboard for user pruning.' });
  };

  const columns = [
    {
      key: "user",
      label: "Identity",
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs uppercase tracking-widest text-white">{user.username}</span>
            <span className="text-[10px] text-muted-foreground font-bold">{user.name}</span>
          </div>
        </div>
      )
    },
    {
      key: "contact",
      label: "Communications",
      render: (user: User) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Mail className="w-2.5 h-2.5" />
            <span className="truncate max-w-[150px]">{user.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Phone className="w-2.5 h-2.5" />
            <span>{user.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: "created_at",
      label: "Created At",
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
          <History className="w-3 h-3" />
          {new Date(user.created_at).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-700 shadow-xl shadow-purple-500/20 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-1">Access <span className="text-purple-500">Control.</span></h1>
              <p className="text-muted-foreground font-medium text-xs uppercase tracking-[0.2em] opacity-40">Security Registry & Identity Management</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white font-black uppercase text-xs tracking-widest h-14 px-8 rounded-2xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            {showForm ? 'Abort Entry' : 'Manual Ingress'}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className={`${showForm ? 'xl:col-span-8' : 'xl:col-span-12'} transition-all duration-500 space-y-8`}>
            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-black opacity-40 flex items-center gap-2">
                  <Users className="w-3 h-3" /> User Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminDataTable
                  data={users}
                  columns={columns}
                  onDelete={handleDelete}
                  searchPlaceholder="Search identities..."
                />
              </CardContent>
            </Card>
          </div>

          {showForm && (
            <div className="xl:col-span-4 animate-in slide-in-from-right duration-500">
              <Card className="border-purple-500/20 bg-purple-500/5 backdrop-blur-2xl relative overflow-hidden sticky top-24">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                <CardHeader>
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Identity Creation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-40">System Username</Label>
                        <Input
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-40">Access Password</Label>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-40">Physical Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-40">Encryption Email</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-xl h-11"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase opacity-40">Link Phone</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl h-11"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase opacity-40">Security PIN</Label>
                          <Input
                            value={formData.pin}
                            onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl h-11"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className="w-full bg-purple-600 h-12 rounded-xl mt-4 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-purple-500/20"
                    >
                      {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Execute Registration'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
