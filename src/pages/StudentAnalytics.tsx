import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, BarChart3, GraduationCap, Trophy, TrendingUp, TrendingDown, AlertCircle, BookOpen, Star, Award, Calendar, MapPin, Hash } from 'lucide-react';
import { dataAnalysisIllustration as analyticsIllustration } from '@/lib/illustrations';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import * as RechartsPrimitive from 'recharts';
import RecommendedResources from '@/components/RecommendedResources';

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
  maxMarks: number;
  source: string;
};

// ── SBTET Filter Options ────────────────────────────────────────────────
const SCHEME_OPTIONS = [{ label: 'C24', value: '11' }, { label: 'C18', value: '9' }, { label: 'C16', value: '8' }];
const SEM_OPTIONS = [{ label: '1st Sem', value: '1' }, { label: '2nd Sem', value: '2' }, { label: '3rd Sem', value: '3' }, { label: '4th Sem', value: '4' }, { label: '5th Sem', value: '5' }, { label: '6th Sem', value: '6' }];
const EXAM_OPTIONS = [{ label: 'Mid 1', value: '1' }, { label: 'Mid 2', value: '2' }, { label: 'Semester (Final)', value: 'semester' }, { label: 'Regular', value: '3' }, { label: 'Supplementary', value: '4' }];
// Fallback exam sessions (used only if /api/exam-sessions is unreachable)
const FALLBACK_EXAM_SESSIONS = [
  { label: 'APR-2025', value: '91' },
  { label: 'NOV-2024', value: '90' },
  { label: 'APR-2024', value: '88' },
  { label: 'NOV-2023', value: '86' },
];


// ── Helpers (must be defined before parsers below) ────────────────────
const toNumber = (s: string | undefined): number | null => {
  if (!s) return null;
  const cleaned = s.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const normalizePin = (p: string) => (p || '').trim().toUpperCase();
const fmtOne = (n: number | null) => (n == null ? '—' : n.toFixed(1));

const inferType = (subject: string, credits: number | null) => {
  const s = (subject || '').toLowerCase();
  // Credits are 0 for mid-terms, so they aren't reliable for type inference there.
  // We use keyword matching as a fallback/primary for mid-terms.
  const isLabKeyword = s.includes(' lab') || s.endsWith(' lab') || s.includes('laboratory') || s.includes('drawing') || s.includes('workshop') || s.includes('practice') || s.includes('project');

  if (isLabKeyword) return 'Lab';
  if (credits != null && credits > 0 && credits <= 1.25) return 'Lab';
  if (credits != null && credits > 1.25) return 'Theory';

  return 'Theory';
};

// ── Old API format (Table/Table1/Table2/Table3 — C18 final results) ───
type ResultsApiPayload = {
  Table?: Array<{ CenterCode?: string; CenterName?: string; Pin?: string; StudentName?: string; BranchCode?: string; Scheme?: string }>;
  Table1?: Array<{ TotalMaxCredits?: number | string; CreditsGained?: number | string; CGPA?: number | string }>;
  Table2?: Array<{ Subject_Code?: string; SubjectName?: string; Semester?: string; SemId?: number | string; SubjectTotal?: number | string; HybridGrade?: string; GradePoint?: number | string; MaxCredits?: number | string }>;
  Table3?: Array<{ Semester?: string; Credits?: number | string; TotalGradePoints?: number | string; SGPA?: number | string; SemId?: number | string }>;
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
  const totalMaxCredits = typeof summary.TotalMaxCredits === 'number' ? summary.TotalMaxCredits : toNumber(String(summary.TotalMaxCredits ?? ''));
  const creditsGained = typeof summary.CreditsGained === 'number' ? summary.CreditsGained : toNumber(String(summary.CreditsGained ?? ''));
  const credits = creditsGained != null && totalMaxCredits != null ? `${fmtOne(creditsGained)}/${fmtOne(totalMaxCredits)}` : undefined;
  const semesterSgpa: SemesterSgpaRow[] = (payload.Table3 || []).map((r) => {
    const c = toNumber(String(r.Credits ?? ''));
    const tgp = toNumber(String(r.TotalGradePoints ?? ''));
    const sgpaFromApi = toNumber(String(r.SGPA ?? ''));
    const computedSgpa = sgpaFromApi != null ? sgpaFromApi : (c != null && c > 0 && tgp != null ? Number((tgp / c).toFixed(2)) : null);
    return { semester: String(r.Semester || '').trim(), credits: c, totalGradePoints: tgp, sgpa: computedSgpa };
  }).filter((r) => r.semester);
  const allSubjects: SubjectRow[] = (payload.Table2 || []).map((r) => {
    const subject = String(r.SubjectName || '').trim();
    const code = String(r.Subject_Code || '').trim();
    const semester = String(r.Semester || '').trim();
    const marks = toNumber(String(r.SubjectTotal ?? ''));
    const grade = String(r.HybridGrade || '').trim();
    const gradePoint = toNumber(String(r.GradePoint ?? ''));
    const creditsNum = toNumber(String(r.MaxCredits ?? ''));
    const type = inferType(subject, creditsNum);
    return { semester, subject, code, type, marks, grade, gradePoint, credits: creditsNum };
  }).filter((s) => s.subject && s.code);
  const swm = allSubjects.filter((s) => typeof s.marks === 'number');
  const bestTheory = (() => { const b = swm.filter(s => s.type === 'Theory').sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))[0]; return b ? { subject: b.subject, marks: b.marks ?? null, grade: b.grade } : undefined; })();
  const bestLab = (() => { const b = swm.filter(s => s.type === 'Lab').sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))[0]; return b ? { subject: b.subject, marks: b.marks ?? null, grade: b.grade } : undefined; })();
  const weakSubjects = swm.slice().sort((a, b) => (a.marks ?? 0) - (b.marks ?? 0)).slice(0, 5).map(s => ({ subject: s.subject, marks: s.marks ?? null, grade: s.grade }));
  const topSubjects = swm.slice().sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0)).slice(0, 5);
  const gradeCounts: Record<string, number> = {};
  for (const s of allSubjects) { const g = (s.grade || '').trim(); if (g) gradeCounts[g] = (gradeCounts[g] || 0) + 1; }
  return { name: studentName, pin: studentPin, branch, center, cgpa, credits, semesterSgpa, bestTheory, bestLab, weakSubjects, topSubjects, allSubjects, gradeCounts, maxMarks: 100, source: 'final' };
};

// ── New mid-term parser (GetC18MidStudentWiseReport) ─────────────────
const parseMidResultsJson = (rawData: any, fallbackPin: string, sem: string): StudentResults => {
  const record = Array.isArray(rawData) ? rawData[0] : rawData;
  const studentInfo = record?.studentInfo?.[0] || {};
  const subjects: any[] = record?.studentWiseReport || [];
  const semLabel = SEM_OPTIONS.find(s => s.value === sem)?.label || sem;
  const allSubjects: SubjectRow[] = subjects
    .filter(r => r.Subject_Code && r.SubjectName)
    .map(r => {
      const subject = String(r.SubjectName || '').trim();
      const code = String(r.Subject_Code || '').trim();
      const marks = toNumber(String(r.MID1_MARKS ?? r.MID2_MARKS ?? r.Internal_MARKS ?? ''));
      const grade = String(r.Grade || r.HybridGrade || '').trim();
      const gradePoint = toNumber(String(r.GradePoint ?? ''));
      const creditsNum = toNumber(String(r.MaxCredits ?? r.Credits ?? ''));
      const type = inferType(subject, creditsNum);
      return { semester: semLabel, subject, code, type, marks, grade, gradePoint, credits: creditsNum };
    });
  const swm = allSubjects.filter(s => typeof s.marks === 'number');
  const bestTheory = (() => { const b = swm.filter(s => s.type === 'Theory').sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))[0]; return b ? { subject: b.subject, marks: b.marks ?? null, grade: b.grade } : undefined; })();
  const bestLab = (() => { const b = swm.filter(s => s.type === 'Lab').sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))[0]; return b ? { subject: b.subject, marks: b.marks ?? null, grade: b.grade } : undefined; })();
  const weakSubjects = swm.slice().sort((a, b) => (a.marks ?? 0) - (b.marks ?? 0)).slice(0, 5).map(s => ({ subject: s.subject, marks: s.marks ?? null, grade: s.grade }));
  const topSubjects = swm.slice().sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0)).slice(0, 5);
  const gradeCounts: Record<string, number> = {};
  for (const s of allSubjects) { const g = (s.grade || '').trim(); if (g) gradeCounts[g] = (gradeCounts[g] || 0) + 1; }
  return {
    name: (studentInfo.StudentName || '').trim() || undefined,
    pin: normalizePin(studentInfo.Pin || fallbackPin) || undefined,
    branch: (studentInfo.BranchName || studentInfo.BranchCode || '').trim() || undefined,
    center: (studentInfo.CollegeName || studentInfo.CenterName || '').trim() || undefined,
    cgpa: null, credits: undefined, semesterSgpa: [],
    bestTheory, bestLab, weakSubjects, topSubjects, allSubjects, gradeCounts,
    maxMarks: 25,
    source: 'mid',
  };
};

// ── Semester final-exam parser (GetStudentWiseReport) ─────────────────────
const parseSemesterResultsJson = (rawData: any, fallbackPin: string): StudentResults => {
  const record = Array.isArray(rawData) ? rawData[0] : rawData;
  const studentInfo = record?.studentInfo?.[0] || {};
  const sgpaCgpaInfo = record?.studentSGPACGPAInfo?.[0] || {};
  const subjects: any[] = record?.studentWiseReport || [];

  const cgpa = toNumber(String(sgpaCgpaInfo.CGPA ?? ''));
  const sgpa = toNumber(String(sgpaCgpaInfo.SGPA ?? ''));
  const totalCredits = toNumber(String(sgpaCgpaInfo.SgpaTotalCredits ?? ''));

  const semesterSgpa: SemesterSgpaRow[] = sgpa != null ? [{
    semester: studentInfo.Sem || '—',
    credits: totalCredits,
    totalGradePoints: toNumber(String(sgpaCgpaInfo.SgpaTotalPoints ?? '')),
    sgpa,
  }] : [];

  const allSubjects: SubjectRow[] = subjects
    .filter(r => r.Subject_Code && r.SubjectName)
    .map(r => {
      const subject = String(r.SubjectName || '').trim();
      const code = String(r.Subject_Code || '').trim();
      const semester = String(r.Semester || studentInfo.Sem || '').trim();
      // SubjectTotal is out of 100; for mid-only context use Internal_MARKS
      const marks = toNumber(String(r.SubjectTotal ?? r.Internal_MARKS ?? ''));
      const grade = String(r.HybridGrade || '').trim();
      const gradePoint = toNumber(String(r.GradePoint ?? ''));
      const creditsNum = toNumber(String(r.MaxCredits ?? r.CreditsGained ?? ''));
      const type = inferType(subject, creditsNum);
      return { semester, subject, code, type, marks, grade, gradePoint, credits: creditsNum };
    });

  const swm = allSubjects.filter(s => typeof s.marks === 'number');
  const bestTheory = (() => { const b = swm.filter(s => s.type === 'Theory').sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))[0]; return b ? { subject: b.subject, marks: b.marks ?? null, grade: b.grade } : undefined; })();
  const bestLab = (() => { const b = swm.filter(s => s.type === 'Lab').sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))[0]; return b ? { subject: b.subject, marks: b.marks ?? null, grade: b.grade } : undefined; })();
  const weakSubjects = swm.slice().sort((a, b) => (a.marks ?? 0) - (b.marks ?? 0)).slice(0, 5).map(s => ({ subject: s.subject, marks: s.marks ?? null, grade: s.grade }));
  const topSubjects = swm.slice().sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0)).slice(0, 5);
  const gradeCounts: Record<string, number> = {};
  for (const s of allSubjects) { const g = (s.grade || '').trim(); if (g) gradeCounts[g] = (gradeCounts[g] || 0) + 1; }

  const credits = totalCredits != null ? `${totalCredits}` : undefined;
  return {
    name: (studentInfo.StudentName || '').trim() || undefined,
    pin: normalizePin(studentInfo.Pin || fallbackPin) || undefined,
    branch: (studentInfo.BranchName || studentInfo.BranchCode || '').trim() || undefined,
    center: (studentInfo.CollegeName || '').trim() || undefined,
    cgpa, credits, semesterSgpa,
    bestTheory, bestLab, weakSubjects, topSubjects, allSubjects, gradeCounts,
    maxMarks: 100,
    source: 'semester',
  };
};

const StudentAnalytics = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [schemeId, setSchemeId] = useState('11');
  const [semYearId, setSemYearId] = useState('2');
  const [examTypeId, setExamTypeId] = useState('1');
  const [examMonthYearId, setExamMonthYearId] = useState('91');
  const [examSessions, setExamSessions] = useState<{ label: string; value: string }[]>(FALLBACK_EXAM_SESSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<StudentResults | null>(null);

  // Fetch live exam sessions from SBTET on mount
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/exam-sessions`)
      .then(r => r.json())
      .then(json => {
        if (json?.success && json.sessions?.length) {
          setExamSessions(json.sessions);
          // Auto-select most recent (first in sorted list)
          setExamMonthYearId(json.sessions[0].value);
        }
      })
      .catch(() => { /* keep fallback list */ });
  }, []);


  const chartConfig = useMemo(
    () => ({
      sgpa: { label: 'SGPA', color: 'hsl(var(--primary))' },
      count: { label: 'Count', color: 'hsl(var(--primary))' },
    }),
    []
  );

  const fetchAll = async () => {
    const normalized = normalizePin(pin);
    if (!normalized) {
      setError('Please enter a valid PIN.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    try {
      const params = new URLSearchParams({ pin: normalized, schemeId, semYearId, examTypeId });
      if (examTypeId === 'semester') params.set('examMonthYearId', examMonthYearId);


      const resultsResp = await fetch(`${API_BASE}/api/results?${params.toString()}`);

      // ── Results ─────────────────────────────────────────────────────
      if (resultsResp.ok) {
        const resJson = await resultsResp.json().catch(() => null);
        if (!resJson?.success || !resJson?.data) {
          setError(resJson?.error || 'No data found. Try a different Scheme, Semester, or Exam Type.');
        } else {
          // Route to correct parser: semester → parseSemesterResultsJson, final → parseResultsJson, mid → parseMidResultsJson
          const src = resJson.source as string;
          const parsed = src === 'semester'
            ? parseSemesterResultsJson(resJson.data, normalized)
            : src === 'final'
              ? parseResultsJson(resJson.data, normalized)
              : parseMidResultsJson(resJson.data, normalized, semYearId);
          setResults(parsed);
        }
      } else {
        const resJson = await resultsResp.json().catch(() => null);
        setError(resJson?.error || 'Failed to connect to backend. Is the server running?');
      }

    } catch (e: any) {
      setError(e?.message || 'Unexpected error. Please try again.');
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
              <CardDescription>Select your exam details exactly as on the SBTET portal, then enter your PIN.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end mb-4">
                {/* Scheme */}
                <div className="space-y-2">
                  <Label>Scheme</Label>
                  <Select value={schemeId} onValueChange={setSchemeId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SCHEME_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Semester */}
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={semYearId} onValueChange={setSemYearId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEM_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Exam Type */}
                <div className="space-y-2">
                  <Label>Exam Type</Label>
                  <Select value={examTypeId} onValueChange={setExamTypeId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXAM_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Exam Month/Year — only for Semester Final */}
                {examTypeId === 'semester' && (
                  <div className="space-y-2">
                    <Label>Exam Month/Year</Label>
                    <Select value={examMonthYearId} onValueChange={setExamMonthYearId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {examSessions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* PIN */}
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <div className="relative">
                    <Input
                      id="pin"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="e.g. 24054-AI-019"
                      onKeyDown={(e) => e.key === 'Enter' && fetchAll()}
                      className="pr-10"
                    />
                    {pin && (
                      <button
                        onClick={() => setPin('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear PIN"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <Button onClick={fetchAll} className="w-full sm:w-auto bg-gradient-brand hover:opacity-90 active:scale-95 transition-all" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Analytics
              </Button>
              {error && (
                <Alert className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* ── SKELETON LOADING STATE ── */}
          {isLoading && (
            <div className="space-y-6 animate-pulse">
              {/* Hero Profile Skeleton */}
              <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-muted/10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <Skeleton className="w-24 h-24 rounded-full bg-muted/40" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-8 w-3/4 sm:w-64 bg-muted/40" />
                    <div className="flex flex-wrap gap-4">
                      <Skeleton className="h-4 w-32 bg-muted/40" />
                      <Skeleton className="h-4 w-32 bg-muted/40" />
                      <Skeleton className="h-4 w-32 bg-muted/40" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full mt-2 bg-muted/40" />
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-3 w-full md:w-auto">
                    <Skeleton className="h-14 w-full md:w-32 rounded-2xl bg-muted/40" />
                    <Skeleton className="h-14 w-full md:w-32 rounded-2xl bg-muted/40" />
                    <Skeleton className="h-14 w-full md:w-32 rounded-2xl bg-muted/40" />
                  </div>
                </div>
              </div>

              {/* Subject Performance Skeleton */}
              <Card className="border-border/40">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-48 bg-muted/40" />
                  <Skeleton className="h-4 w-64 mt-1 bg-muted/40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-[140px] md:w-[220px] space-y-1">
                        <Skeleton className="h-4 w-full bg-muted/40" />
                        <Skeleton className="h-3 w-2/3 bg-muted/40" />
                      </div>
                      <Skeleton className="h-2.5 flex-1 rounded-full bg-muted/40" />
                      <Skeleton className="h-4 w-8 bg-muted/40" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Best Performers Row Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full rounded-2xl bg-muted/40" />
                <Skeleton className="h-20 w-full rounded-2xl bg-muted/40" />
              </div>
            </div>
          )}


          {/* ── RESULTS DASHBOARD ──────────────────────────────────────── */}
          {results && (() => {
            const allMarks = results.allSubjects.filter(s => typeof s.marks === 'number').map(s => s.marks as number);
            const avgMark = allMarks.length ? allMarks.reduce((a, b) => a + b, 0) / allMarks.length : null;
            const maxPossible = results.maxMarks;
            const perfScore = avgMark != null ? Math.min(100, Math.round((avgMark / maxPossible) * 100)) : null;
            const perfColor = perfScore == null ? '#6366f1' : perfScore >= 80 ? '#22c55e' : perfScore >= 60 ? '#f59e0b' : '#ef4444';
            const perfLabel = perfScore == null ? '—' : perfScore >= 80 ? 'Excellent' : perfScore >= 60 ? 'Good' : perfScore >= 40 ? 'Average' : 'Needs Work';
            const strongSubjects = results.allSubjects
              .filter(s => typeof s.marks === 'number' && (s.marks as number) >= (avgMark ?? 0))
              .sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0));
            const weakSubjects = results.allSubjects
              .filter(s => typeof s.marks === 'number' && (s.marks as number) < (avgMark ?? 0))
              .sort((a, b) => (a.marks ?? 0) - (b.marks ?? 0));

            return (
              <>
                {/* ── HERO PROFILE CARD ── */}
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 backdrop-blur-sm p-6 md:p-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                  <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Avatar / Performance Ring */}
                    <div className="flex-shrink-0">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                          <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
                          <circle
                            cx="48" cy="48" r="40" fill="none" stroke={perfColor} strokeWidth="6"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - (perfScore ?? 0) / 100)}`}
                            strokeLinecap="round" className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-black" style={{ color: perfColor }}>{perfScore ?? '—'}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Score</span>
                        </div>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight truncate">{results.name || 'Student'}</h2>
                        <Badge className="text-xs font-bold px-3" style={{ background: perfColor + '22', color: perfColor, border: `1px solid ${perfColor}44` }}>
                          {perfLabel}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {results.pin && <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{results.pin}</span>}
                        {results.branch && <span className="flex items-center gap-1 truncate"><Award className="w-3 h-3 flex-shrink-0" />{results.branch}</span>}
                        {results.center && <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 flex-shrink-0" />{results.center}</span>}
                      </div>
                      {results.cgpa != null && (
                        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                          <Star className="w-4 h-4 text-primary" />
                          <span className="font-black text-primary text-sm">CGPA: {results.cgpa.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-3 w-full md:w-auto md:min-w-[140px]">
                      {[
                        { label: 'Subjects', value: results.allSubjects.length, icon: <BookOpen className="w-3.5 h-3.5" /> },
                        { label: 'Avg Marks', value: avgMark != null ? avgMark.toFixed(1) : '—', icon: <BarChart3 className="w-3.5 h-3.5" /> },
                        { label: 'Credits', value: results.source === 'mid' ? 'Mid-term' : (results.credits || (results.cgpa != null ? '—' : 'Mid')), icon: <Calendar className="w-3.5 h-3.5" /> },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-2xl bg-background/60 border border-border/60 px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">{stat.icon}<span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span></div>
                          <div className="text-lg font-black">{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── SUBJECT MARKS VISUALIZER ── */}
                {results.allSubjects.length > 0 && (
                  <Card className="border-border/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Subject Performance
                      </CardTitle>
                      <CardDescription>Visual breakdown of marks for each subject</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.allSubjects
                          .filter(s => typeof s.marks === 'number')
                          .sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0))
                          .map((s) => {
                            const pct = Math.min(100, Math.round(((s.marks ?? 0) / maxPossible) * 100));
                            const barColor = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
                            return (
                              <div key={`${s.code}-${s.type}`} className="flex items-center gap-3">
                                <div className="w-[140px] md:w-[220px] flex-shrink-0">
                                  <div className="text-xs font-semibold text-foreground line-clamp-1" title={s.subject}>{s.subject}</div>
                                  <div className="text-[10px] text-muted-foreground">{s.code} · {s.type}</div>
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-700"
                                      style={{ width: `${pct}%`, background: barColor }}
                                    />
                                  </div>
                                  <span className="text-sm font-black w-8 text-right" style={{ color: barColor }}>{s.marks}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Recharts bar chart */}
                      {results.allSubjects.filter(s => s.marks != null).length > 0 && (
                        <div className="mt-6">
                          <ChartContainer config={chartConfig} className="h-[220px] w-full">
                            <RechartsPrimitive.BarChart
                              data={results.allSubjects.filter(s => s.marks != null).map(s => ({ name: s.code, marks: s.marks }))}
                              margin={{ left: 4, right: 4, top: 4 }}
                            >
                              <RechartsPrimitive.CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                              <RechartsPrimitive.XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                              <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} domain={[0, maxPossible]} />
                              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                              <RechartsPrimitive.Bar dataKey="marks" fill="var(--color-sgpa)" radius={[6, 6, 0, 0]} />
                            </RechartsPrimitive.BarChart>
                          </ChartContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ── STRONG / WEAK SUBJECTS ── */}
                {(strongSubjects.length > 0 || weakSubjects.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Strong Subjects */}
                    <Card className="border-green-500/20 bg-green-500/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400 text-base">
                          <TrendingUp className="w-5 h-5" />Strong Subjects
                          <Badge className="ml-auto bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 text-xs">{strongSubjects.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {strongSubjects.slice(0, 5).map(s => {
                            const pct = Math.min(100, Math.round(((s.marks ?? 0) / maxPossible) * 100));
                            return (
                              <div key={`${s.code}-strong`} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold line-clamp-1 text-foreground">{s.subject}</span>
                                  <span className="text-sm font-black text-green-600 dark:text-green-400 ml-2 flex-shrink-0">{s.marks}</span>
                                </div>
                                <div className="h-1.5 bg-green-500/15 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                          {strongSubjects.length === 0 && <p className="text-sm text-muted-foreground">No strong subjects yet.</p>}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Weak Subjects */}
                    <Card className="border-red-500/20 bg-red-500/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-base">
                          <TrendingDown className="w-5 h-5" />Needs Improvement
                          <Badge className="ml-auto bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30 text-xs">{weakSubjects.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {weakSubjects.slice(0, 5).map(s => {
                            const pct = Math.min(100, Math.round(((s.marks ?? 0) / maxPossible) * 100));
                            return (
                              <div key={`${s.code}-weak`} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold line-clamp-1 text-foreground">{s.subject}</span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-sm font-black text-red-500">{s.marks}</span>
                                    <button
                                      onClick={() => navigate(`/resources?q=${encodeURIComponent(s.subject.split(' ').slice(0, 2).join(' '))}`)}
                                      className="text-[10px] font-bold text-primary underline hover:no-underline"
                                    >Resources →</button>
                                  </div>
                                </div>
                                <div className="h-1.5 bg-red-500/15 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                          {weakSubjects.length === 0 && <p className="text-sm text-muted-foreground text-green-600">All subjects above average! 🎉</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}


                {/* ── RECOMMENDED RESOURCES ── */}
                {results.weakSubjects.length > 0 && (
                  <RecommendedResources weakSubjects={results.weakSubjects} topSubjects={results.topSubjects} />
                )}

                {/* ── Best Theory & Lab ── */}
                {(results.bestTheory || results.bestLab) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.bestTheory && (
                      <div className="flex items-center gap-4 p-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
                        <div className="p-3 rounded-xl bg-yellow-500/10">
                          <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Best Theory</div>
                          <div className="font-black text-foreground line-clamp-1">{results.bestTheory.subject}</div>
                          <div className="text-sm text-muted-foreground">Marks: <span className="font-bold text-yellow-600 dark:text-yellow-400">{results.bestTheory.marks ?? '—'}</span></div>
                        </div>
                      </div>
                    )}
                    {results.bestLab && (
                      <div className="flex items-center gap-4 p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5">
                        <div className="p-3 rounded-xl bg-purple-500/10">
                          <Star className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Best Lab</div>
                          <div className="font-black text-foreground line-clamp-1">{results.bestLab.subject}</div>
                          <div className="text-sm text-muted-foreground">Marks: <span className="font-bold text-purple-600 dark:text-purple-400">{results.bestLab.marks ?? '—'}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SGPA Chart (final results only) ── */}
                {results.semesterSgpa.length > 0 && (
                  <Card className="border-border/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="w-5 h-5 text-primary" />Semester SGPA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[260px] w-full">
                        <RechartsPrimitive.BarChart data={results.semesterSgpa.map(r => ({ semester: r.semester, sgpa: r.sgpa ?? 0 }))} margin={{ left: 12, right: 12 }}>
                          <RechartsPrimitive.CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                          <RechartsPrimitive.XAxis dataKey="semester" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                          <RechartsPrimitive.YAxis tickLine={false} axisLine={false} domain={[0, 10]} tick={{ fontSize: 11 }} />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                          <RechartsPrimitive.Bar dataKey="sgpa" fill="var(--color-sgpa)" radius={[8, 8, 0, 0]} />
                        </RechartsPrimitive.BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}

                {/* ── ALL SUBJECTS TABLE ── */}
                {results.allSubjects.length > 0 && (
                  <Card className="border-border/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="w-5 h-5 text-primary" />All Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full max-h-[360px] overflow-auto rounded-xl border border-border/40">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="font-bold">Subject</TableHead>
                              <TableHead>Code</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Marks</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.allSubjects.map((s, i) => {
                              const pct = s.marks != null ? Math.min(100, Math.round((s.marks / maxPossible) * 100)) : null;
                              const isWeak = typeof s.marks === 'number' && avgMark != null && s.marks < avgMark;
                              return (
                                <TableRow key={`${s.code}-${s.type}-${i}`} className={isWeak ? 'bg-red-500/5' : ''}>
                                  <TableCell className="font-medium">{s.subject}</TableCell>
                                  <TableCell className="text-muted-foreground text-xs">{s.code}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {pct != null && (
                                        <div className="hidden sm:block w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' }} />
                                        </div>
                                      )}
                                      <span className={`font-black text-sm ${isWeak ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                        {s.marks ?? '—'}
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            );
          })()}

        </div>
      </div>

      
    </div>
  );
};

export default StudentAnalytics;
