import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Home, Plus, Search, Edit, Trash2, Users, UserCheck, UserX, UploadCloud, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import StudentForm from "@/components/forms/StudentForm";
import { apiFetch } from "@/utils/apiClient"; // --- 1. IMPORT APIFETCH ---

// --- Interfaces ---
interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentGrade: string;
  section: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  enrollmentDate: string;
  enrollmentStatus: string;
  parentName?: string;
  parentPhone?: string;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  number: number;
  totalElements: number;
}

export default function Students() {
  const { user } = useAuth();
  const [studentPage, setStudentPage] = useState<Page<Student> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // --- 2. REFACTOR fetchStudents ---
  const fetchStudents = useCallback((page = 0, search = "") => {
    setLoading(true);
    const url = `http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/students?page=${page}&size=10&sort=firstName,asc&searchTerm=${encodeURIComponent(search)}`;
    apiFetch(url)
        .then(res => {
          if (res.ok) return res.json();
          // Let the centralized error handler in apiFetch show the toast for network/auth errors
          // But still throw an error to be caught here for component-specific logic
          throw new Error("Failed to fetch students");
        })
        .then(data => setStudentPage(data))
        .catch(() => toast.error('Could not retrieve student data.')) // Specific error for this action
        .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(currentPage, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, fetchStudents]);

  const handleStudentSaved = () => {
    setIsFormDialogOpen(false);
    setSelectedStudent(null);
    toast.success(`Student ${selectedStudent ? 'updated' : 'added'} successfully`);
    fetchStudents(currentPage, searchTerm);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsFormDialogOpen(true);
  };

  // --- 3. REFACTOR handleDeleteStudent ---
  const handleDeleteStudent = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await apiFetch(`http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/students/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Student deleted successfully');
          fetchStudents(currentPage, searchTerm);
        } else {
          // Handle specific API errors, e.g., student has related records
          const error = await response.json();
          toast.error(error.message || 'Failed to delete student');
        }
      } catch (error) {
        // Network errors are already handled by apiFetch's toast
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImportFile(event.target.files[0]);
    }
  };

  // --- 4. REFACTOR handleImportSubmit ---
  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.warning("Please select a file to upload.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/students/bulk-upload', {
        method: 'POST',
        body: formData,
        // No Content-Type needed; browser sets it for FormData
      });

      if (response.ok) {
        const newStudents = await response.json();
        toast.success(`${newStudents.length} students imported successfully!`);
        setIsImportDialogOpen(false);
        setImportFile(null);
        fetchStudents(); // Refresh to page 0
      } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to import students.");
      }
    } catch (error) {
      // Show specific error from server or the generic one from apiFetch
      toast.error((error as Error).message);
    }
    finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "firstName,lastName,email,phone,dateOfBirth(yyyy-MM-dd),gender,address,currentGrade,section\n";
    const example = "John,Doe,john.doe@example.com,1234567890,2005-08-15,Male,123 Main St,Grade 10,A\n";
    const blob = new Blob([headers, example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
  };

  if (!user) { return <Navigate to="/" replace />; }

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div><h1 className="text-2xl font-bold">Student Management</h1><p className="text-gray-300">Manage student information and records</p></div>
            <div className="flex gap-2">
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild><Button className="bg-blue-600 text-white hover:bg-blue-700"><UploadCloud className="h-4 w-4 mr-2" />Import Students</Button></DialogTrigger>
                <DialogContent className="bg-gray-900 text-white border-gray-700">
                  <DialogHeader><DialogTitle>Bulk Import Students</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-400">Upload a CSV or Excel file. The first row must be headers matching the template.</p>
                    <Button variant="outline" onClick={handleDownloadTemplate} className="w-full gap-2 bg-gray-800 hover:bg-gray-700"><Download size={16}/>Download CSV Template</Button>
                    <div><Label htmlFor="studentFile">Upload File</Label><Input id="studentFile" type="file" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="bg-gray-800 border-gray-600 file:text-white" /></div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleImportSubmit} disabled={loading || !importFile}>{loading ? 'Importing...' : 'Start Import'}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setSelectedStudent(null); setIsFormDialogOpen(isOpen); }}>
                <DialogTrigger asChild><Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => setSelectedStudent(null)}><Plus className="h-4 w-4 mr-2" />Add Student</Button></DialogTrigger>
                <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700"><DialogHeader><DialogTitle>{selectedStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle></DialogHeader><StudentForm student={selectedStudent} onSave={handleStudentSaved} onCancel={() => { setIsFormDialogOpen(false); setSelectedStudent(null); }} /></DialogContent>
              </Dialog>
              <Button asChild className="bg-purple-600 text-white hover:bg-purple-700"><Link to="/dashboard" className="flex items-center gap-2"><Home className="h-4 w-4" />Dashboard</Link></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-white"><Users className="h-5 w-5" />Total Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-400">{studentPage?.totalElements || 0}</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-white"><UserCheck className="h-5 w-5" />Active Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-400">{/* For accurate count, a separate API is needed */}</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-white"><UserX className="h-5 w-5" />Inactive Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-400">{/* For accurate count, a separate API is needed */}</div></CardContent></Card>
          </div>

          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700 mb-6"><CardContent className="p-6"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search by name, ID, or email..." className="pl-10 bg-gray-800 border-gray-600 text-white" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} /></div></CardContent></Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader><CardTitle className="text-white">Students List</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table><TableHeader><TableRow className="border-gray-700"><TableHead className="text-gray-300">Name</TableHead><TableHead className="text-gray-300">Student ID</TableHead><TableHead className="text-gray-300">Grade</TableHead><TableHead className="text-gray-300">Email</TableHead><TableHead className="text-gray-300">Phone</TableHead><TableHead className="text-gray-300">Status</TableHead><TableHead className="text-gray-300">Actions</TableHead></TableRow></TableHeader><TableBody>
                  {loading && (<tr><td colSpan={7} className="text-center py-8 text-gray-300">Loading...</td></tr>)}
                  {!loading && studentPage?.content.map((student) => (
                      <TableRow key={student.id} className="border-gray-700">
                        <TableCell className="text-white">{student.firstName} {student.lastName}</TableCell>
                        <TableCell className="text-gray-300">{student.studentId}</TableCell>
                        <TableCell className="text-gray-300">{student.currentGrade}</TableCell>
                        <TableCell className="text-gray-300">{student.email}</TableCell>
                        <TableCell className="text-gray-300">{student.phone}</TableCell>
                        <TableCell><Badge variant={student.enrollmentStatus.toLowerCase() === 'active' ? 'default' : 'secondary'}>{student.enrollmentStatus}</Badge></TableCell>
                        <TableCell><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => handleEditStudent(student)} className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"><Edit className="h-4 w-4" /></Button><Button size="sm" variant="outline" onClick={() => handleDeleteStudent(student.id)} className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                      </TableRow>
                  ))}
                </TableBody></Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <span className="text-sm text-gray-400">Page {studentPage ? studentPage.number + 1 : 0} of {studentPage?.totalPages || 0}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={!studentPage || currentPage >= studentPage.totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(studentPage!.totalPages - 1)} disabled={!studentPage || currentPage >= studentPage.totalPages - 1}><ChevronsRight className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <footer className="bg-gradient-to-r from-purple-900 via-blue-900 to-black border-t border-purple-700 py-4"><div className="container mx-auto px-4 text-center text-sm text-gray-300">© {new Date().getFullYear()} School Management System</div></footer>
      </div>
  );
}