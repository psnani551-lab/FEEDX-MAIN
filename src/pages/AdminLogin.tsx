import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import Logo from '@/components/Logo';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use email for Supabase Auth
      const data = await authAPI.login(email, password);

      // Store in localStorage for legacy component support (like AdminLayout)
      if (data.token) localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      toast({
        title: 'Login Successful',
        description: `Welcome, ${data.user.name}!`,
      });

      // Force redirect using window.location for reliability
      window.location.href = '/admin';
    } catch (err: any) {
      const errorMsg = err.message || 'Connection error';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-purple-500/30 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <p className="text-sm text-gray-400">FeedX Management</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Only registered users can login. Contact administrator for access.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
