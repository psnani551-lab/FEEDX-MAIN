import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, BarChart3, GraduationCap } from 'lucide-react';
import { dataAnalysisIllustration as analyticsIllustration } from '@/lib/illustrations';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import * as RechartsPrimitive from 'recharts';
import RecommendedResources from '@/components/RecommendedResources';
// import StreakTracker from '@/components/StreakTracker';

type AttendanceSummary = {
  attendancePercentage: number | null;
  totalDays: number | null;
  presentDays: number | null;
  absentDays: number | null;
};

type SemesterSgpaRow = {
  semester: string;
  credits: number | null;
  totalGradePoints: number | null;
  sgpa: number | null;
};

type SubjectRow = {
  semester?: string;
  subject: string;
  code: string;
  type: string;
  marks: number | null;
  grade: string;
  gradePoint?: number | null;
  credits?: number | null;
};

type StudentResults = {
  name?: string;
  pin?: string;
  branch?: string;
  center?: string;
  cgpa?: number | null;
  credits?: string;
  semesterSgpa: SemesterSgpaRow[];
  bestTheory?: { subject: string; marks: number | null; grade: string };
  bestLab?: { subject: string; marks: number | null; grade: string };
  weakSubjects: Array<{ subject: string; marks: number | null; grade: string }>;
  topSubjects: SubjectRow[];
  allSubjects: SubjectRow[];
  gradeCounts: Record<string, number>;
};

const toNumber = (s: string | undefined): number | null => {
  if (!s) return null;
  const cleaned = s.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

type ResultsApiPayload = {
  Table?: Array<{
    CenterCode?: string;
    CenterName?: string;
    Pin?: string;
    StudentName?: string;
    BranchCode?: string;
    Scheme?: string;
  }>;
  Table1?: Array<{
    TotalMaxCredits?: number | string;
    CreditsGained?: number | string;
    CGPA?: number | string;
  }>;
  Table2?: Array<{
    Subject_Code?: string;
    SubjectName?: string;
    Semester?: string;
    SemId?: number | string;
    SubjectTotal?: number | string;
    HybridGrade?: string;
    GradePoint?: number | string;
    MaxCredits?: number | string;
  }>;
  Table3?: Array<{
    Semester?: string;
    Credits?: number | string;
    TotalGradePoints?: number | string;
    SGPA?: number | string;
    SemId?: number | string;
  }>;
};

const normalizePin = (p: string) => (p || '').trim().toUpperCase();

const fmtOne = (n: number | null) => (n == null ? '—' : n.toFixed(1));

const inferType = (subject: string, credits: number | null) => {
  const s = (subject || '').toLowerCase();
  if (s.includes(' lab') || s.endsWith(' lab') || s.includes('laboratory')) return 'Lab';
  if (credits != null && credits <= 1.26) return 'Lab';
  return 'Theory';
};

const parseResultsJson = (payload: ResultsApiPayload, fallbackPin: string): StudentResults => {
  const student = payload.Table?.[0] || {};
  const summary = payload.Table1?.[0] || {};

  const studentName = (student.StudentName || '').trim() || undefined;
  const studentPin = normalizePin(student.Pin || fallbackPin) || undefined;
  const branchFromApi = (student as any).Branch || (student as any).BranchName || student.BranchCode || '';
  const scheme = (student.Scheme || '').trim();
  const branch = branchFromApi ? `${branchFromApi}${scheme ? ` (${scheme})` : ''}` : undefined;

  const centerName = (student.CenterName || '').trim();
  const centerCode = (student.CenterCode || '').trim();
  const center = centerName ? `${centerName}${centerCode ? ` (${centerCode})` : ''}` : undefined;

  const cgpa = typeof summary.CGPA === 'number' ? summary.CGPA : toNumber(String(summary.CGPA ?? ''));
  const totalMaxCredits = typeof summary.TotalMaxCredits === 'number'
    ? summary.TotalMaxCredits
    : toNumber(String(summary.TotalMaxCredits ?? ''));
  const creditsGained = typeof summary.CreditsGained === 'number'
    ? summary.CreditsGained
    : toNumber(String(summary.CreditsGained ?? ''));
  const credits =
    creditsGained != null && totalMaxCredits != null ? `${fmtOne(creditsGained)}/${fmtOne(totalMaxCredits)}` : undefined;

  const semesterSgpa: SemesterSgpaRow[] = (payload.Table3 || [])
    .map((r) => {
      const credits = toNumber(String(r.Credits ?? ''));
      const totalGradePoints = toNumber(String(r.TotalGradePoints ?? ''));
      const sgpaFromApi = toNumber(String(r.SGPA ?? ''));
      const computedSgpa =
        sgpaFromApi != null
          ? sgpaFromApi
          : credits != null && credits > 0 && totalGradePoints != null
            ? Number((totalGradePoints / credits).toFixed(2))
            : null;

      return {
        semester: String(r.Semester || '').trim(),
        credits,
        totalGradePoints,
        sgpa: computedSgpa,
      };
    })
    .filter((r) => r.semester);

  const allSubjects: SubjectRow[] = (payload.Table2 || [])
    .map((r) => {
      const subject = String(r.SubjectName || '').trim();
      const code = String(r.Subject_Code || '').trim();
      const semester = String(r.Semester || '').trim();
      const marks = toNumber(String(r.SubjectTotal ?? ''));
      const grade = String(r.HybridGrade || '').trim();
      const gradePoint = toNumber(String(r.GradePoint ?? ''));
      const creditsNum = toNumber(String(r.MaxCredits ?? ''));
      const type = inferType(subject, creditsNum);
      return {
        semester,
        subject,
        code,
        type,
        marks,
        grade,
        gradePoint,
        credits: creditsNum,
      };
    })
    .filter((s) => s.subject && s.code);

  const subjectsWithMarks = allSubjects.filter((s) => typeof s.marks === 'number');
  const bestTheorySubject = subjectsWithMarks
    .filter((s) => s.type === 'Theory')
    .sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))[0];
  const bestLabSubject = subjectsWithMarks
    .filter((s) => s.type === 'Lab')
    .sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))[0];

  const bestTheory = bestTheorySubject
    ? { subject: bestTheorySubject.subject, marks: bestTheorySubject.marks ?? null, grade: bestTheorySubject.grade }
    : undefined;
  const bestLab = bestLabSubject
    ? { subject: bestLabSubject.subject, marks: bestLabSubject.marks ?? null, grade: bestLabSubject.grade }
    : undefined;

  const weakSubjects = subjectsWithMarks
    .slice()
    .sort((a, b) => (a.marks ?? 0) - (b.marks ?? 0))
    .slice(0, 5)
    .map((s) => ({ subject: s.subject, marks: s.marks ?? null, grade: s.grade }));

  const topSubjects = subjectsWithMarks
    .slice()
    .sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))
    .slice(0, 5);

  const gradeCounts: Record<string, number> = {};
  for (const s of allSubjects) {
    const g = (s.grade || '').trim();
    if (!g) continue;
    gradeCounts[g] = (gradeCounts[g] || 0) + 1;
  }

  return {
    name: studentName,
    pin: studentPin,
    branch,
    center,
    cgpa,
    credits,
    semesterSgpa,
    bestTheory,
    bestLab,
    weakSubjects,
    topSubjects,
    allSubjects,
    gradeCounts,
  };
};

const StudentAnalytics = () => {
  const navigate = useNavigate();
  const FEATURE_SOON = false;
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<StudentResults | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);

  const chartConfig = useMemo(
    () => ({
      sgpa: { label: 'SGPA', color: 'hsl(var(--primary))' },
      count: { label: 'Count', color: 'hsl(var(--primary))' },
    }),
    []
  );

  const fetchAll = async () => {
    if (FEATURE_SOON) {
      setError('Student analytics feature will be available soon.');
      return;
    }

    const normalized = normalizePin(pin);
    if (!normalized) {
      setError('Please enter a valid PIN.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Check cache first for immediate feedback (optional, but let's do it for offline-first)
    const cacheKey = `feedx_analytics_cache_${normalized.toLowerCase()}`;
    const cachedData = localStorage.getItem(cacheKey);
    let initialResults = null;
    let initialAttendance = null;

    if (cachedData) {
      try {
        const { results: cResults, attendance: cAttendance } = JSON.parse(cachedData);
        initialResults = cResults;
        initialAttendance = cAttendance;
        setResults(cResults);
        setAttendance(cAttendance);
        console.log('[DEBUG] Loaded from cache:', normalized);
      } catch (err) {
        console.error('[DEBUG] Cache parse error:', err);
      }
    } else {
      setResults(null);
      setAttendance(null);
    }

    const API_BASE = import.meta.env.VITE_API_URL || '';
    console.log(`[DEBUG] Fetching analytics for PIN: ${normalized}`);

    try {
      const [resultsResp, attendanceResp] = await Promise.allSettled([
        fetch(`${API_BASE}/api/results?pin=${encodeURIComponent(normalized)}`),
        fetch(`${API_BASE}/api/attendance?pin=${encodeURIComponent(normalized)}`),
      ]);

      let resultsError: string | null = null;
      let attendanceError: string | null = null;
      let newResults = initialResults;
      let newAttendance = initialAttendance;

      if (resultsResp.status === 'fulfilled') {
        const resRes = resultsResp.value;
        if (!resRes.ok) {
          const maybe = await resRes.json().catch(() => null);
          resultsError = maybe?.error || 'Failed to fetch results';
        } else {
          const resJson = await resRes.json();
          if (!resJson?.success || !resJson?.data) {
            resultsError = resJson?.error || 'Invalid results response';
          } else {
            newResults = parseResultsJson(resJson.data as ResultsApiPayload, normalized);
            setResults(newResults);
          }
        }
      } else {
        resultsError = resultsResp.reason?.message || 'Failed to fetch results';
      }

      if (attendanceResp.status === 'fulfilled') {
        const attRes = attendanceResp.value;
        if (!attRes.ok) {
          const maybe = await attRes.json().catch(() => null);
          attendanceError = maybe?.error || maybe?.message || 'Failed to fetch attendance';
        } else {
          const attJson = await attRes.json();
          if (!attJson?.success) {
            attendanceError = attJson?.error || 'Invalid attendance response';
          } else {
            newAttendance = (attJson.attendanceSummary || null) as AttendanceSummary | null;
            setAttendance(newAttendance);
          }
        }
      } else {
        attendanceError = attendanceResp.reason?.message || 'Failed to fetch attendance';
      }

      // If we have new data, update the cache
      if (newResults || newAttendance) {
        localStorage.setItem(cacheKey, JSON.stringify({
          results: newResults,
          attendance: newAttendance,
          timestamp: new Date().toISOString()
        }));
      }

      // Only show a blocking error if results failed AND we have no cache
      if (resultsError) {
        if (!newResults) {
          setError(resultsError);
        } else {
          toast({
            title: "Offline Mode",
            description: "Showing cached data. Updates currently unavailable.",
            variant: "destructive"
          });
        }
      } else if (attendanceError && !newAttendance) {
        toast({
          title: "Attendance Offline",
          description: "Could not sync latest attendance data.",
          variant: "default"
        });
      }
    } catch (e: any) {
      console.error('[DEBUG] Access Error:', e);
      if (!results && !attendance) {
        setError(e?.message || 'Failed to fetch analytics. Please try again.');
      } else {
        toast({
          title: "Network Error",
          description: "Using cached data due to network issues.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sgpaChartData = (results?.semesterSgpa || []).map((r) => ({
    semester: r.semester,
    sgpa: r.sgpa ?? 0,
  }));

  const gradeChartData = Object.entries(results?.gradeCounts || {})
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => a.grade.localeCompare(b.grade));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative border-b border-border bg-background pt-24 pb-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 opacity-80 blur-2xl" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-gradient">Student Analytics</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Enter your PIN to fetch attendance and academic performance details.
            </p>
          </div>
          <img src={analyticsIllustration} alt="Student analytics" className="w-full max-w-sm animate-float" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Fetch by PIN
              </CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <Input id="pin" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter PIN" />
                </div>
                <Button onClick={fetchAll} className="bg-gradient-brand hover:opacity-90" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Fetch analytics
                </Button>
              </div>
              {error && (
                <Alert className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Student Summary */}
          {(results || attendance) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Student Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <div className="font-semibold break-words">{results?.name || '—'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">PIN</Label>
                    <div className="font-semibold">{results?.pin || pin}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Branch</Label>
                    <div className="font-semibold">{results?.branch || '—'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Center</Label>
                    <div className="font-semibold break-words">{results?.center || '—'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">CGPA</Label>
                    <div className="font-semibold">{results?.cgpa == null ? '—' : results.cgpa.toFixed(1)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Credits</Label>
                    <div className="font-semibold">{results?.credits || '—'}</div>
                  </div>
                </div>

                {/* Attendance (summary only) */}
                {(attendance || results) && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <Label className="text-sm text-muted-foreground">Attendance %</Label>
                      <div className="text-2xl font-semibold text-primary">
                        {attendance?.attendancePercentage == null ? '0.0%' : `${attendance.attendancePercentage.toFixed(1)}%`}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <Label className="text-sm text-muted-foreground">Total days</Label>
                      <div className="text-2xl font-semibold">{attendance?.totalDays ?? '0'}</div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <Label className="text-sm text-muted-foreground">Present days</Label>
                      <div className="text-2xl font-semibold">{attendance?.presentDays ?? '0'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SGPA chart */}
          {results && results.semesterSgpa.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Semester-wise SGPA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-auto mb-6">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Semester</TableHead>
                          <TableHead className="text-right">Credits</TableHead>
                          <TableHead className="text-right">Total Grade Points</TableHead>
                          <TableHead className="text-right">SGPA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.semesterSgpa.map((r) => (
                          <TableRow key={r.semester}>
                            <TableCell className="font-medium">{r.semester}</TableCell>
                            <TableCell className="text-right">{r.credits == null ? '—' : r.credits.toFixed(1)}</TableCell>
                            <TableCell className="text-right">{r.totalGradePoints == null ? '—' : r.totalGradePoints.toFixed(1)}</TableCell>
                            <TableCell className="text-right">{r.sgpa == null ? '—' : r.sgpa.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {results.semesterSgpa.map((r) => (
                      <div key={r.semester} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary">{r.semester}</span>
                          <Badge variant="outline" className="text-primary font-bold">SGPA: {r.sgpa == null ? '—' : r.sgpa.toFixed(2)}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Credits: <span className="text-foreground font-medium">{r.credits == null ? '—' : r.credits.toFixed(1)}</span></div>
                          <div className="text-right">Grade Points: <span className="text-foreground font-medium">{r.totalGradePoints == null ? '—' : r.totalGradePoints.toFixed(1)}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <RechartsPrimitive.BarChart data={sgpaChartData} margin={{ left: 12, right: 12 }}>
                    <RechartsPrimitive.CartesianGrid vertical={false} />
                    <RechartsPrimitive.XAxis dataKey="semester" tickLine={false} axisLine={false} />
                    <RechartsPrimitive.YAxis tickLine={false} axisLine={false} domain={[0, 10]} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <RechartsPrimitive.Bar dataKey="sgpa" fill="var(--color-sgpa)" radius={[8, 8, 0, 0]} />
                  </RechartsPrimitive.BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Recommended Resources */}
          {results && results.weakSubjects.length > 0 && (
            <RecommendedResources
              weakSubjects={results.weakSubjects}
              topSubjects={results.topSubjects}
            />
          )}

          {/* Highlights */}
          {results && (results.bestTheory || results.bestLab || results.weakSubjects.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Best Theory</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {results.bestTheory ? (
                    <div>
                      <div className="font-semibold text-foreground">{results.bestTheory.subject}</div>
                      <div>Marks: {results.bestTheory.marks ?? '—'} • Grade: {results.bestTheory.grade}</div>
                    </div>
                  ) : (
                    '—'
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Best Lab</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {results.bestLab ? (
                    <div>
                      <div className="font-semibold text-foreground">{results.bestLab.subject}</div>
                      <div>Marks: {results.bestLab.marks ?? '—'} • Grade: {results.bestLab.grade}</div>
                    </div>
                  ) : (
                    '—'
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Weak Subjects</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {results.weakSubjects.length ? (
                    <ul className="space-y-4">
                      {results.weakSubjects.map((s) => (
                        <li key={`${s.subject}-${s.grade}`} className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-foreground line-clamp-1">{s.subject}</span>
                            <Badge variant="outline" className="text-[10px] h-5">{s.grade}</Badge>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs">Marks: {s.marks ?? '—'}</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs text-primary font-bold"
                              onClick={() => navigate(`/resources?q=${encodeURIComponent(s.subject.split(' ').slice(0, 2).join(' '))}`)}
                            >
                              Search Materials →
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'All subjects are performing well!'
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top subjects */}
          {results && results.topSubjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Subjects</CardTitle>
                <CardDescription>Best scoring subjects from the results page.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  {/* Desktop View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead className="text-right">Marks</TableHead>
                          <TableHead className="text-right">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.topSubjects.slice(0, 10).map((s) => (
                          <TableRow key={`${s.code}-${s.semester}`}>
                            <TableCell className="font-medium">{s.subject}</TableCell>
                            <TableCell>{s.code}</TableCell>
                            <TableCell>{s.type}</TableCell>
                            <TableCell>{s.semester}</TableCell>
                            <TableCell className="text-right">{s.marks ?? '—'}</TableCell>
                            <TableCell className="text-right font-bold text-primary">{s.grade}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden space-y-4">
                    {results.topSubjects.slice(0, 8).map((s) => (
                      <div key={`${s.code}-${s.semester}`} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="font-semibold text-foreground line-clamp-1">{s.subject}</div>
                          <Badge className="bg-primary/20 text-primary border-primary/20">{s.grade}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          <div>Semester: <span className="text-foreground">{s.semester}</span></div>
                          <div className="text-right">Marks: <span className="text-foreground">{s.marks ?? '—'}</span></div>
                          <div>Code: <span className="text-foreground">{s.code}</span></div>
                          <div className="text-right">Type: <span className="text-foreground">{s.type}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All subjects */}
          {results && results.allSubjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>All Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full max-h-[340px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sem</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Marks</TableHead>
                        <TableHead className="text-right">Grade</TableHead>
                        <TableHead className="text-right">GP</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.allSubjects.map((s) => (
                        <TableRow key={`${s.code}-${s.semester}-${s.type}`}>
                          <TableCell>{s.semester}</TableCell>
                          <TableCell className="font-medium">{s.subject}</TableCell>
                          <TableCell>{s.code}</TableCell>
                          <TableCell>{s.type}</TableCell>
                          <TableCell className="text-right">{s.marks ?? '—'}</TableCell>
                          <TableCell className="text-right">{s.grade}</TableCell>
                          <TableCell className="text-right">{s.gradePoint ?? '—'}</TableCell>
                          <TableCell className="text-right">{s.credits ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grade distribution */}
          {results && gradeChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[260px] w-full">
                  <RechartsPrimitive.BarChart data={gradeChartData} margin={{ left: 12, right: 12 }}>
                    <RechartsPrimitive.CartesianGrid vertical={false} />
                    <RechartsPrimitive.XAxis dataKey="grade" tickLine={false} axisLine={false} />
                    <RechartsPrimitive.YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <RechartsPrimitive.Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]} />
                  </RechartsPrimitive.BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentAnalytics;
