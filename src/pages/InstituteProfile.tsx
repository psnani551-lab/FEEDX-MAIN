import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Search, GraduationCap, Users } from 'lucide-react';

import { useEffect } from 'react';
import { institutesAPI, Institute } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const InstituteProfile = () => {
  const [query, setQuery] = useState('');
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    institutesAPI.getAll().then(data => {
      // Filter out draft institutes if any, keeping backward compatibility logic simple
      setInstitutes(data.filter(i => i.status !== 'draft'));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const total = institutes.length;
    const government = institutes.filter((i) => i.type === 'GOV').length;
    const women = institutes.filter((i) => i.mode === 'GIRLS').length;
    return { total, government, women };
  }, [institutes]);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return institutes;
    return institutes.filter((inst) =>
      [inst.code, inst.name, inst.place, inst.dist, inst.region, inst.type, inst.mode]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [query, institutes]);

  return (
    <div className="min-h-screen bg-background">

      <header className="relative border-b border-border bg-background pt-16 pb-10 sm:pt-24 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 opacity-80 blur-2xl" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4 text-left">
            <Badge className="bg-primary text-primary-foreground">Updated List</Badge>
            <h1 className="text-3xl sm:text-5xl font-bold text-gradient">Institute Profile</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Browse all institutes under OU region with quick filters for type, mode, and location. Use the search to find a specific code or campus instantly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="glass-card border-white/10">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Institutes</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-white/10">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Government</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.government}</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-white/10">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Women-focused</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.women}</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 flex flex-col items-center justify-center border border-white/10">
              <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Institute Directory</h3>
              <p className="text-muted-foreground text-center text-sm">Browse {stats.total}+ polytechnic institutes across Telangana</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Institute Directory</h2>
                <p className="text-sm text-muted-foreground">Search by code, name, place, or district.</p>
              </div>
              <Input
                placeholder="Search institutes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr className="text-left">
                      <th className="py-3 px-3 font-semibold text-foreground">#</th>
                      <th className="py-3 px-3 font-semibold text-foreground">Code</th>
                      <th className="py-3 px-3 font-semibold text-foreground">Institute</th>
                      <th className="py-3 px-3 font-semibold text-foreground">Place</th>
                      <th className="py-3 px-3 font-semibold text-foreground">Dist.</th>
                      <th className="py-3 px-3 font-semibold text-foreground">Region</th>
                      <th className="py-3 px-3 font-semibold text-foreground">Type</th>
                      <th className="py-3 px-3 font-semibold text-foreground">Minority</th>
                      <th className="py-3 px-3 font-semibold text-foreground">Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((inst, index) => (
                      <tr key={`${inst.code}-${index}`} className="hover:bg-muted/40">
                        <td className="py-3 px-3 text-foreground">{index + 1}</td>
                        <td className="py-3 px-3 font-semibold">
                          {inst.code === 'IOES' ? (
                            <Link to="/ioes" className="text-primary hover:underline cursor-pointer font-bold">
                              {inst.code}
                            </Link>
                          ) : (
                            <Link to={`/institute/${inst.code}`} className="text-primary hover:underline cursor-pointer">{inst.code}</Link>
                          )}
                        </td>
                        <td className="py-3 px-3 text-foreground">{inst.name}</td>
                        <td className="py-3 px-3 text-foreground">{inst.place}</td>
                        <td className="py-3 px-3 text-foreground">{inst.dist}</td>
                        <td className="py-3 px-3 text-foreground">{inst.region}</td>
                        <td className="py-3 px-3 text-foreground">{inst.type}</td>
                        <td className="py-3 px-3 text-foreground">{inst.minority}</td>
                        <td className="py-3 px-3 text-foreground">{inst.mode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <p className="text-xs text-muted-foreground">Data mapped directly from dynamic registry. Use the search bar to jump to a code or institute name.</p>
          </CardContent>
        </Card>
      </main>


    </div>
  );
};

export default InstituteProfile;
