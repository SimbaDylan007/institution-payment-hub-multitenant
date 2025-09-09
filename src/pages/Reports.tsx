// src/pages/Reports.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Home, FileText, Download, GraduationCap, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CSVLink } from "react-csv";
import { apiFetch } from "@/utils/apiClient";
import { academicYears, semesters, currentAcademicYear, currentSemester } from '@/config/academicConfig';
import {Label} from "recharts";

// --- Interfaces ---
interface Student { id: number; studentId: string; firstName: string; lastName: string; }
interface ReportCard { studentName: string; studentId: string; gradeLevel: string; academicYear: string; semester: string; subjectGrades: any[]; overallAverage: number; overallGrade: string; }
interface FinancialSummary { studentName: string; studentId: string; gradeLevel: string; totalCharges: number; totalPayments: number; periodBalance: number; outstandingBalance: number; }

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<string[]>([]);

  const [reportType, setReportType] = useState('STUDENT_REPORT_CARD');
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);
  const [semester, setSemester] = useState(currentSemester);
  const [selectedStudent, setSelectedStudent] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  const [generatedData, setGeneratedData] = useState<any[] | null>(null);

  useEffect(() => {
    // --- THIS IS THE ROBUST FIX ---
    apiFetch('/api/students?size=1000')
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch student list for filters.");
          return res.json();
        })
        .then(data => {
          // Safely access the content property only if data exists
          const studentList = data?.content || [];
          setStudents(studentList);
          const uniqueGrades = [...new Set(studentList.map((s: any) => s.currentGrade).filter(Boolean))].sort();
          setGrades(uniqueGrades as string[]);
        })
        .catch(error => {
          toast.error(error.message);
          // Set to empty arrays to prevent crashes
          setStudents([]);
          setGrades([]);
        });
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setGeneratedData(null);
    const requestBody = {
      reportType, academicYear, semester,
      studentId: selectedStudent === 'ALL' ? null : selectedStudent,
      gradeLevel: selectedGrade === 'ALL' ? null : selectedGrade,
    };
    try {
      const response = await apiFetch('/api/reports/generate', { method: 'POST', body: JSON.stringify(requestBody) });
      if (response.ok) {
        const data = await response.json();
        setGeneratedData(data);
        toast.success(`${data.length} record(s) generated successfully.`);
      } else { throw new Error("Failed to generate report."); }
    } catch (error) { toast.error((error as Error).message); }
    finally { setLoading(false); }
  };


  const csvReportCardData = generatedData?.flatMap(rc => (Array.isArray(rc.subjectGrades) ? rc.subjectGrades.map((sg:any) => ({ studentId: rc.studentId, studentName: rc.studentName, subjectCode: sg.subjectCode, subjectName: sg.subjectName, finalScore: sg.finalScore, letterGrade: sg.letterGrade, overallAverage: rc.overallAverage.toFixed(2) })) : [])) || [];
  const csvFinancialData = generatedData?.map(fs => ({ studentId: fs.studentId, studentName: fs.studentName, gradeLevel: fs.gradeLevel, totalCharges: (fs.totalCharges||0).toFixed(2), totalPayments: (fs.totalPayments||0).toFixed(2), periodBalance: (fs.periodBalance||0).toFixed(2), outstandingBalance: (fs.outstandingBalance||0).toFixed(2) })) || [];



  if (!user) return <Navigate to="/" replace />;

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div><h1 className="text-2xl font-bold">Report Generator</h1><p className="text-gray-300">Create and export dynamic system reports.</p></div>
            <Button asChild><Link to="/dashboard" className="flex items-center gap-2"><Home size={16}/>Dashboard</Link></Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-gray-900/50 border-gray-700">
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText/>Report Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Report Type</Label><Select value={reportType} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT_REPORT_CARD">Student Report Card</SelectItem>
                  </SelectContent>
                </Select></div>

                {/* --- THIS IS THE CORRECTED DYNAMIC SECTION --- */}
                <div>
                  <Label>Academic Year</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {academicYears.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Term / Semester</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {semesters.map(term => (
                          <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {reportType === 'FINANCIAL_SUMMARY' && <div><Label>Filter by Grade</Label><Select value={selectedGrade} onValueChange={setSelectedGrade}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="ALL">All Grades</SelectItem>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>}
                <div><Label>Filter by Student</Label><Select value={selectedStudent} onValueChange={setSelectedStudent}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="ALL">All Students</SelectItem>{students.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.firstName} {s.lastName} ({s.studentId})</SelectItem>)}</SelectContent></Select></div>

                <Button onClick={handleGenerateReport} disabled={loading} className="w-full">{loading ? 'Generating...' : 'Generate Report'}</Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-gray-900/50 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">Generated Report Preview</CardTitle>
                  {generatedData && generatedData.length > 0 && (
                      <Button variant="outline" asChild>
                        <CSVLink data={reportType === 'STUDENT_REPORT_CARD' ? csvReportCardData : csvFinancialData} filename={`${reportType.toLowerCase()}_export.csv`} className="flex items-center gap-2"><Download size={16}/>Export as CSV</CSVLink>
                      </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading && <div className="text-center p-8">Generating report data...</div>}
                {!loading && !generatedData && <div className="text-center p-8 text-gray-400">Configure and generate a report to see a preview here.</div>}
                {generatedData && generatedData.length === 0 && <div className="text-center p-8 text-gray-400">No data found for the selected criteria.</div>}

                {/* The logic now only needs to check for STUDENT_REPORT_CARD */}
                {generatedData && generatedData.length > 0 && <ReportCardPreview data={generatedData} />}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  );
}

// --- Preview Components ---
const ReportCardPreview = ({ data }: { data: ReportCard[] }) => (
    <div className="space-y-4 p-4 border border-gray-600 rounded-md">
      <h3 className="text-xl font-bold">{data[0].studentName} ({data[0].studentId})</h3>
      <div className="flex justify-between text-sm text-gray-300"><span>Grade: {data[0].gradeLevel}</span><span>{data[0].academicYear} - {data[0].semester.replace('_', ' ')}</span></div>
      <Table><TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Final Score</TableHead><TableHead>Grade</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
        <TableBody>{(data[0].subjectGrades || []).map((sg:any) => (<TableRow key={sg.subjectCode}><TableCell>{sg.subjectName}</TableCell><TableCell>{sg.finalScore}</TableCell><TableCell>{sg.letterGrade}</TableCell><TableCell>{sg.remarks}</TableCell></TableRow>))}</TableBody>
      </Table>
      <div className="text-right font-bold">Overall Average: {data[0].overallAverage.toFixed(2)}% ({data[0].overallGrade})</div>
      {data.length > 1 && <div className="text-center text-sm text-gray-400 italic pt-4">Showing preview for the first student. Full data for {data.length} students is available for export.</div>}
    </div>
);

const FinancialSummaryPreview = ({ data }: { data: FinancialSummary[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader><TableRow><TableHead>Student Name</TableHead><TableHead>Grade</TableHead><TableHead>Charges (Term)</TableHead><TableHead>Payments (Term)</TableHead><TableHead>Balance (Term)</TableHead><TableHead>Total Outstanding</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map(fs => (
              <TableRow key={fs.studentId}>
                <TableCell>{fs.studentName} ({fs.studentId})</TableCell>
                <TableCell>{fs.gradeLevel}</TableCell>
                {/* --- THIS IS THE FIX --- */}
                {/* We add '|| 0' as a fallback in case the value is null or undefined */}
                <TableCell className="text-yellow-400">${(fs.totalCharges || 0).toFixed(2)}</TableCell>
                <TableCell className="text-green-400">${(fs.totalPayments || 0).toFixed(2)}</TableCell>
                <TableCell className={`font-bold ${(fs.periodBalance || 0) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>${(fs.periodBalance || 0).toFixed(2)}</TableCell>
                <TableCell className={`font-bold ${(fs.outstandingBalance || 0) > 0 ? 'text-red-500' : 'text-green-400'}`}>${(fs.outstandingBalance || 0).toFixed(2)}</TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
);