import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Calculator, Calendar, AlertTriangle, CheckCircle, Info, Target, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { attendanceIllustration as attendenceIllustration } from '@/lib/illustrations';
import { toast } from 'sonner';

const AttendanceCalculator = () => {
  const [pin, setPin] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({
    totalClasses: '',
    attendedClasses: '',
    semester: '',
    branch: ''
  });

  const [result, setResult] = useState<{
    percentage: number;
    status: 'excellent' | 'good' | 'warning' | 'danger';
    message: string;
    remainingClasses: number;
    canMiss: number;
    fetched?: boolean;
    studentName?: string;
  } | null>(null);

  const fetchAttendance = async () => {
    if (!pin.trim()) {
      toast.error('Please enter a PIN');
      return;
    }

    setIsFetching(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE}/api/attendance?pin=${pin}`);
      const data = await response.json();

      if (data.success && data.attendanceSummary) {
        const { totalDays, presentDays, attendancePercentage } = data.attendanceSummary;
        setFormData({
          ...formData,
          totalClasses: totalDays?.toString() || '',
          attendedClasses: presentDays?.toString() || '',
        });

        // Auto-calculate
        const percentage = Math.round(attendancePercentage || 0);
        let status: 'excellent' | 'good' | 'warning' | 'danger';
        let message = '';

        if (percentage >= 85) {
          status = 'excellent';
          message = 'Excellent attendance! You\'re eligible for all examinations.';
        } else if (percentage >= 75) {
          status = 'good';
          message = 'Good attendance. You\'re eligible for examinations.';
        } else if (percentage >= 65) {
          status = 'warning';
          message = 'Your attendance is below 75%. Consider improving it.';
        } else {
          status = 'danger';
          message = 'Critical! Your attendance is below 65%. You may not be eligible for examinations.';
        }

        const canMiss = Math.floor((presentDays || 0) / 0.75 - (totalDays || 0));

        setResult({
          percentage,
          status,
          message,
          remainingClasses: (totalDays || 0) - (presentDays || 0),
          canMiss: canMiss > 0 ? canMiss : 0,
          fetched: true,
          studentName: data.studentInfo?.StudentName
        });

        toast.success(`Attendance fetched for ${data.studentInfo?.StudentName || pin}`);
      } else {
        toast.error(data.error || 'Failed to fetch attendance');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to connect to server');
    } finally {
      setIsFetching(false);
    }
  };

  const calculateAttendance = () => {
    const total = parseInt(formData.totalClasses);
    const attended = parseInt(formData.attendedClasses);

    if (!total || !attended || attended > total) {
      toast.error('Invalid attendance data');
      return;
    }

    const percentage = Math.round((attended / total) * 100);
    let status: 'excellent' | 'good' | 'warning' | 'danger';
    let message = '';

    if (percentage >= 85) {
      status = 'excellent';
      message = 'Excellent attendance! You\'re eligible for all examinations.';
    } else if (percentage >= 75) {
      status = 'good';
      message = 'Good attendance. You\'re eligible for examinations.';
    } else if (percentage >= 65) {
      status = 'warning';
      message = 'Your attendance is below 75%. Consider improving it.';
    } else {
      status = 'danger';
      message = 'Critical! Your attendance is below 65%. You may not be eligible for examinations.';
    }

    // Calculate remaining classes needed for 75%
    const targetAttendance = Math.ceil((total * 0.75) - attended);
    const canMiss = Math.floor(attended / 0.75 - total);

    setResult({
      percentage,
      status,
      message,
      remainingClasses: total - attended,
      canMiss: canMiss > 0 ? canMiss : 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'danger': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const attendanceTips = [
    "Maintain at least 75% attendance for examination eligibility",
    "SBTET requires minimum 65% attendance for final eligibility",
    "Medical certificates are accepted for genuine medical issues",
    "Regular attendance helps in better understanding of subjects",
    "Use the calculator regularly to track your progress"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative border-b border-border bg-background pt-24 pb-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 opacity-80 blur-2xl" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-gradient">Attendance</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Calculate your attendance percentage and check your examination eligibility
            </p>
          </div>
          <img src={attendenceIllustration} alt="Attendance" className="w-full max-w-sm" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Fetch */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Quick Fetch from SBTET
                </CardTitle>
                <CardDescription>
                  Enter your PIN to automatically fetch your attendance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter your PIN (e.g., 21062-CM-001)"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="bg-background"
                  />
                  <Button
                    onClick={fetchAttendance}
                    disabled={isFetching}
                    className="shrink-0"
                  >
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Data'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Calculate Your Attendance
                </CardTitle>
                <CardDescription>
                  Enter your attendance details manually or confirm fetched data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Semester</SelectItem>
                        <SelectItem value="2">2nd Semester</SelectItem>
                        <SelectItem value="3">3rd Semester</SelectItem>
                        <SelectItem value="4">4th Semester</SelectItem>
                        <SelectItem value="5">5th Semester</SelectItem>
                        <SelectItem value="6">6th Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="civil">Civil Engineering</SelectItem>
                        <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                        <SelectItem value="electrical">Electrical Engineering</SelectItem>
                        <SelectItem value="electronics">Electronics Engineering</SelectItem>
                        <SelectItem value="computer">Computer Engineering</SelectItem>
                        <SelectItem value="automobile">Automobile Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalClasses">Total Classes Conducted</Label>
                    <Input
                      id="totalClasses"
                      type="number"
                      placeholder="e.g., 120"
                      value={formData.totalClasses}
                      onChange={(e) => setFormData({ ...formData, totalClasses: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attendedClasses">Classes Attended</Label>
                    <Input
                      id="attendedClasses"
                      type="number"
                      placeholder="e.g., 95"
                      value={formData.attendedClasses}
                      onChange={(e) => setFormData({ ...formData, attendedClasses: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={calculateAttendance}
                  className="w-full bg-gradient-brand hover:opacity-90 transition-smooth"
                  disabled={!formData.totalClasses || !formData.attendedClasses}
                >
                  Calculate Eligibility
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card className="mt-6 border-primary/30 shadow-lg animate-in zoom-in-95 duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      Attendance Results
                    </div>
                    {result.fetched && (
                      <Badge variant="outline" className="text-xs">Fetched from SBTET</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.studentName && (
                    <div className="text-center -mt-2 mb-4">
                      <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Student Name</p>
                      <p className="text-xl font-bold">{result.studentName}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2 text-primary">{result.percentage}%</div>
                    <Progress value={result.percentage} className="h-3 mb-2" />
                    <p className={`text-lg font-medium ${getStatusColor(result.status)}`}>
                      {result.message}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="text-2xl font-bold text-blue-600">{result.remainingClasses}</div>
                      <div className="text-sm text-muted-foreground">Classes Conducted To Date</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="text-2xl font-bold text-green-600">{result.canMiss}</div>
                      <div className="text-sm text-muted-foreground">Classes You Can Miss</div>
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-accent/5 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 text-primary">
                      <Target className="w-4 h-4" />
                      Detailed Recommendations
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {result.percentage >= 75 ? (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Excellent! You have maintained the required attendance. You can safely miss up to <strong>{result.canMiss}</strong> more classes while staying above 75%.</span>
                        </li>
                      ) : (
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span>You need to attend <strong>{Math.ceil((parseInt(formData.totalClasses) * 0.75) - parseInt(formData.attendedClasses))}</strong> more classes consecutively to reach the 75% threshold.</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span>SBTET regulations require a minimum of 65% for examination eligibility with condonation.</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendance Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  SBTET Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-md bg-green-500/10 text-green-700 dark:text-green-400">
                    <span className="text-sm font-medium">75% and Above</span>
                    <Badge className="bg-green-500 hover:bg-green-600">Eligible</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                    <span className="text-sm font-medium">65% to 74.9%</span>
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">Condonation</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md bg-red-500/10 text-red-700 dark:text-red-400">
                    <span className="text-sm font-medium">Below 65%</span>
                    <Badge variant="destructive">Detained</Badge>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic leading-tight mt-2">
                  *Condonation is subject to approval by the principal and payment of prescribed fee for genuine medical reasons.
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendance Success Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {attendanceTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="mt-1">
                        <CheckCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Info className="w-8 h-8 text-primary mx-auto opacity-50" />
                  <h4 className="font-bold">Need Help?</h4>
                  <p className="text-xs text-muted-foreground">
                    If your attendance isn't showing correctly, please contact your department HOD or college administration.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.open('mailto:support@feedx.com')}>
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AttendanceCalculator;