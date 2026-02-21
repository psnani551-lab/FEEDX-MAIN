import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Printer, Trophy, Target, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ViewResults = () => {
  const [formData, setFormData] = useState({
    rollNo: '',
    semester: '',
    examType: ''
  });
  const [resultsData, setResultsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      // Mock results data
      const mockData = {
        studentName: "John Doe",
        rollNo: formData.rollNo,
        semester: formData.semester,
        examType: formData.examType,
        overallGrade: "B+",
        overallPercentage: 78.5,
        totalMarks: 625,
        obtainedMarks: 491,
        subjects: [
          {
            name: "Mathematics",
            code: "MATH101",
            internalMarks: 25,
            externalMarks: 75,
            totalMarks: 100,
            grade: "B",
            status: "Pass"
          },
          {
            name: "Physics",
            code: "PHYS101",
            internalMarks: 22,
            externalMarks: 68,
            totalMarks: 90,
            grade: "C+",
            status: "Pass"
          },
          {
            name: "Chemistry",
            code: "CHEM101",
            internalMarks: 28,
            externalMarks: 72,
            totalMarks: 100,
            grade: "B",
            status: "Pass"
          },
          {
            name: "Computer Science",
            code: "CS101",
            internalMarks: 24,
            externalMarks: 65,
            totalMarks: 89,
            grade: "C+",
            status: "Pass"
          },
          {
            name: "English",
            code: "ENG101",
            internalMarks: 26,
            externalMarks: 74,
            totalMarks: 100,
            grade: "B",
            status: "Pass"
          }
        ]
      };
      setResultsData(mockData);
      setIsLoading(false);
    }, 2000);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return "bg-green-600";
      case 'A': return "bg-green-500";
      case 'B+': return "bg-blue-500";
      case 'B': return "bg-blue-400";
      case 'C+': return "bg-yellow-500";
      case 'C': return "bg-yellow-400";
      case 'D': return "bg-orange-500";
      case 'F': return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Pass" ? "bg-green-500" : "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-8 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                View Results
              </h1>
              <p className="text-muted-foreground">
                Check your examination results and grades
              </p>
            </div>

            {/* Search Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Examination Details
                </CardTitle>
                <CardDescription>
                  Enter your roll number to view results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rollNo">Roll Number</Label>
                      <Input
                        id="rollNo"
                        placeholder="Enter roll number"
                        value={formData.rollNo}
                        onChange={(e) => handleChange('rollNo', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select onValueChange={(value) => handleChange('semester', value)}>
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
                      <Label htmlFor="examType">Exam Type</Label>
                      <Select onValueChange={(value) => handleChange('examType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="supplementary">Supplementary</SelectItem>
                          <SelectItem value="revaluation">Revaluation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    View Results
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results Display */}
            {resultsData && (
              <div className="space-y-6">
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Results Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{resultsData.overallGrade}</div>
                        <div className="text-sm text-muted-foreground">Overall Grade</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{resultsData.overallPercentage}%</div>
                        <div className="text-sm text-muted-foreground">Percentage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{resultsData.obtainedMarks}</div>
                        <div className="text-sm text-muted-foreground">Marks Obtained</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{resultsData.totalMarks}</div>
                        <div className="text-sm text-muted-foreground">Total Marks</div>
                      </div>
                    </div>

                    <Alert>
                      <AlertDescription>
                        Student Name: <strong>{resultsData.studentName}</strong> |
                        Roll Number: <strong>{resultsData.rollNo}</strong> |
                        Semester: <strong>{resultsData.semester}</strong> |
                        Exam Type: <strong>{resultsData.examType}</strong>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Subject-wise Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Subject-wise Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full">
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject Code</TableHead>
                              <TableHead>Subject Name</TableHead>
                              <TableHead className="text-center">Internal</TableHead>
                              <TableHead className="text-center">External</TableHead>
                              <TableHead className="text-center">Total</TableHead>
                              <TableHead className="text-center">Grade</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {resultsData.subjects.map((subject, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{subject.code}</TableCell>
                                <TableCell>{subject.name}</TableCell>
                                <TableCell className="text-center">{subject.internalMarks}</TableCell>
                                <TableCell className="text-center">{subject.externalMarks}</TableCell>
                                <TableCell className="text-center font-semibold">{subject.totalMarks}</TableCell>
                                <TableCell className="text-center">
                                  <Badge className={`${getGradeColor(subject.grade)} text-white`}>
                                    {subject.grade}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className={`${getStatusColor(subject.status)} text-white`}>
                                    {subject.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {resultsData.subjects.map((subject, index) => (
                          <div key={index} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground line-clamp-1">{subject.name}</div>
                                <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">{subject.code}</div>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={`${getGradeColor(subject.grade)} text-white h-6 font-bold`}>{subject.grade}</Badge>
                                <Badge className={`${getStatusColor(subject.status)} text-white h-6 font-bold`}>{subject.status}</Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 px-2 py-2 bg-background/50 rounded-lg border border-border/50 text-center">
                              <div className="space-y-1">
                                <div className="text-[9px] uppercase tracking-tighter text-muted-foreground font-bold">Internal</div>
                                <div className="text-xs font-semibold">{subject.internalMarks}</div>
                              </div>
                              <div className="space-y-1 border-x border-border/50">
                                <div className="text-[9px] uppercase tracking-tighter text-muted-foreground font-bold">External</div>
                                <div className="text-xs font-semibold">{subject.externalMarks}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-[9px] uppercase tracking-tighter text-muted-foreground font-bold">Total</div>
                                <div className="text-xs font-bold text-primary">{subject.totalMarks}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Marksheet
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print Results
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

export default ViewResults;