import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Printer, Calendar, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { attendanceIllustration as attendenceIllustration } from '@/lib/illustrations';

const ViewAttendance = () => {
  const [pin, setPin] = useState('');
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin || pin.trim() === '') {
      setError('Please enter a valid PIN');
      return;
    }

    setIsLoading(true);
    setError('');
    setAttendanceData(null);

    try {
      // Try to call the Flask backend API
      // Use relative path to avoid ad blocker issues
      const API_BASE = import.meta.env.VITE_API_URL || '';

      try {
        const response = await fetch(`${API_BASE}/api/attendance?pin=${encodeURIComponent(pin)}`, {
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch attendance data' }));
          const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
          console.error('API Error Response:', errorData);

          // For 404, it means data not found (not a server issue)
          if (response.status === 404) {
            const notFoundError: any = new Error(errorMessage);
            notFoundError.isNotFound = true;
            throw notFoundError;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log('DEBUG - API Response:', data);
        console.log('DEBUG - Student Info:', data.studentInfo);
        console.log('DEBUG - Attendance Records:', data.attendanceRecords);

        if (!data.success) {
          const error: any = new Error(data.error || 'Invalid response from server');
          // If error message suggests data not found, mark it as such
          if (data.error && data.error.toLowerCase().includes('not found')) {
            error.isNotFound = true;
          }
          throw error;
        }

        // Check if studentInfo exists and has data
        if (!data.studentInfo || Object.keys(data.studentInfo).length === 0) {
          const notFoundError: any = new Error(data.error || 'No student data found for this PIN. Please verify the PIN is correct and exists in SBTET system.');
          notFoundError.isNotFound = true;
          throw notFoundError;
        }

        // Transform SBTET API response to match our UI format
        const transformedData = {
          studentInfo: {
            name: data.studentInfo.Name || data.studentInfo.StudentName || 'N/A',
            rollNo: data.studentInfo.Pin || data.studentInfo.Studentid || pin,
            semester: data.studentInfo.Semester || 'N/A',
            branch: data.studentInfo.BranchCode || data.studentInfo.Branch || 'N/A',
            scheme: data.studentInfo.Scheme || 'N/A',
            attendeeId: data.studentInfo.AttendeeId || data.studentInfo.UAN || 'N/A'
          },
          overallAttendance: {
            totalClasses: parseInt(data.studentInfo.WorkingDays || data.studentInfo.TotalDays || '0') || 0,
            attendedClasses: parseInt(data.studentInfo.NumberOfDaysPresent || data.studentInfo.PresentDays || '0') || 0,
            percentage: parseFloat(data.studentInfo.Percentage || data.studentInfo.AttendancePercentage || '0') || 0,
            status: getAttendanceStatus(parseFloat(data.studentInfo.Percentage || data.studentInfo.AttendancePercentage || '0') || 0)
          },
          dailyAttendance: data.attendanceRecords || []
        };

        console.log('DEBUG - Transformed Data:', transformedData);

        setAttendanceData(transformedData);
      } catch (fetchError: any) {
        const errorMessage = fetchError.message || '';

        // Check if this is a "data not found" error (not a server issue)
        if (fetchError.isNotFound) {
          console.warn('Data not found for PIN:', pin);
          setError(`❌ Data not found: ${errorMessage}`);
          setIsLoading(false);
          return; // Don't show demo data for invalid PINs
        }

        // For actual server issues, use mock data as fallback
        // Check if error is due to ad blocker or browser extension
        if (errorMessage.includes('ERR_BLOCKED_BY_CLIENT') || errorMessage.includes('blocked') || fetchError.name === 'TypeError') {
          console.warn('Request blocked (likely by ad blocker). Using demo data.');
          setError('⚠️ Server issue: Request blocked by browser extension (ad blocker). Showing sample data. Try disabling ad blocker or restart dev server.');
        } else {
          console.warn('API unavailable, using demo data:', errorMessage);
          setError('⚠️ Server issue: Backend server not available. Showing sample data. To use real SBTET data, start the backend server.');
        }

        const mockData = {
          studentInfo: {
            name: "Demo Student",
            rollNo: pin,
            semester: "4",
            branch: "CPS",
            scheme: "C16",
            attendeeId: "DEMO-001"
          },
          overallAttendance: {
            totalClasses: 200,
            attendedClasses: 171,
            percentage: 85.5,
            status: getAttendanceStatus(85.5)
          },
          dailyAttendance: [
            { Date: "2025-11-20T00:00:00", Status: "P", AttendanceMonth: "November" },
            { Date: "2025-11-19T00:00:00", Status: "P", AttendanceMonth: "November" },
            { Date: "2025-11-18T00:00:00", Status: "A", AttendanceMonth: "November" },
            { Date: "2025-11-17T00:00:00", Status: "P", AttendanceMonth: "November" },
            { Date: "2025-11-16T00:00:00", Status: "W", AttendanceMonth: "November" },
            { Date: "2025-11-15T00:00:00", Status: "HP", AttendanceMonth: "November" },
            { Date: "2025-11-14T00:00:00", Status: "P", AttendanceMonth: "November" },
            { Date: "2025-11-13T00:00:00", Status: "H", AttendanceMonth: "November" },
            { Date: "2025-11-12T00:00:00", Status: "P", AttendanceMonth: "November" },
            { Date: "2025-11-11T00:00:00", Status: "E", AttendanceMonth: "November" }
          ]
        };

        setAttendanceData(mockData);
        // Error message already set above based on error type
      }
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      setError(err.message || 'Failed to fetch attendance data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 65) return 'Average';
    return 'Poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-600 bg-green-50 dark:text-green-100 dark:bg-green-900';
      case 'Good': return 'text-blue-600 bg-blue-50 dark:text-blue-100 dark:bg-blue-900';
      case 'Average': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-100 dark:bg-yellow-900';
      case 'Poor': return 'text-red-600 bg-red-50 dark:text-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-100 dark:bg-gray-800';
    }
  };

  const getStatusDetails = (status: string) => {
    let color = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    let label = status;

    if (status === 'P') {
      color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      label = 'Present';
    } else if (status === 'A') {
      color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      label = 'Absent';
    } else if (status === 'HP') {
      color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      label = 'Half Present';
    } else if (status === 'H') {
      color = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      label = 'Holiday';
    } else if (status === 'W' || status === 'W/P') {
      color = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      label = status === 'W/P' ? 'Weekend/Present' : 'Weekend';
    } else if (status === 'E') {
      color = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      label = 'Event';
    }
    return { color, label };
  };

  const renderStudentInfo = (studentInfo: any) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Student Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Name</Label>
            <p className="text-lg font-semibold">{studentInfo.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">PIN / Roll Number</Label>
            <p className="text-lg font-semibold">{studentInfo.rollNo}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Semester</Label>
            <p className="text-lg font-semibold">{studentInfo.semester}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Branch</Label>
            <p className="text-lg font-semibold">{studentInfo.branch}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Scheme</Label>
            <p className="text-lg font-semibold">{studentInfo.scheme}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Attendee ID</Label>
            <p className="text-lg font-semibold">{studentInfo.attendeeId}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOverallAttendance = (overallAttendance: any) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Overall Attendance Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{overallAttendance.totalClasses}</div>
            <div className="text-sm text-muted-foreground">Total Classes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{overallAttendance.attendedClasses}</div>
            <div className="text-sm text-muted-foreground">Classes Attended</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{overallAttendance.percentage.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Attendance %</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold px-3 py-1 rounded-full ${getStatusColor(overallAttendance.status)}`}>
              {overallAttendance.status}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Status</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSubjectWiseAttendance = (subjects: any[]) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Daily Attendance Records</CardTitle>
        <CardDescription>Complete attendance history from SBTET portal</CardDescription>
      </CardHeader>
      <CardContent>
        {subjects && subjects.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="font-medium">Status Legend:</span>
              <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">P=Present</span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">A=Absent</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">HP=Half Present</span>
              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">H=Holiday</span>
              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">W=Weekend</span>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">E=Event</span>
            </div>
            <div className="w-full">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((record, index) => {
                      const status = record.Status || record.status || '-';
                      const { color, label } = getStatusDetails(status);

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {record.Date ? new Date(record.Date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </TableCell>
                          <TableCell>{record.AttendanceMonth || 'N/A'}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                              {label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {subjects.map((record, index) => {
                  const status = record.Status || record.status || '-';
                  const { color, label } = getStatusDetails(status);
                  const dateStr = record.Date ? new Date(record.Date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : 'N/A';

                  return (
                    <div key={index} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-foreground">{dateStr}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{record.AttendanceMonth || 'N/A'}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${color}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No daily attendance records available</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative border-b border-border bg-background pt-24 pb-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 opacity-80 blur-2xl" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-gradient">
              View Attendance
            </h1>
            <p className="text-lg text-muted-foreground">
              Fetch attendance data from SBTET Telangana portal
            </p>
          </div>
          <img src={attendenceIllustration} alt="Attendance" className="w-full max-w-sm" />
        </div>
      </div>

      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">

            {/* Search Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student PIN
                </CardTitle>
                <CardDescription>
                  Enter your PIN to fetch attendance data from SBTET Telangana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="max-w-md">
                    <Label htmlFor="pin">PIN</Label>
                    <Input
                      id="pin"
                      placeholder="Enter your student PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Fetch Attendance
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert className="mb-6" variant={error.includes('Demo mode') ? 'default' : 'destructive'}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Attendance Data Display */}
            {attendanceData && (
              <div className="space-y-6">
                {renderStudentInfo(attendanceData.studentInfo)}
                {renderOverallAttendance(attendanceData.overallAttendance)}
                {attendanceData.dailyAttendance && attendanceData.dailyAttendance.length > 0 &&
                  renderSubjectWiseAttendance(attendanceData.dailyAttendance)}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewAttendance;