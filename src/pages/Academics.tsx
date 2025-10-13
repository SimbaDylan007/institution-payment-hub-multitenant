import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Home, BookOpen, Plus, Edit, Trash2, GraduationCap, UploadCloud, Download } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PaginationControls } from "@/components/PaginationControls";
import { apiFetch } from "@/utils/apiClient";

// --- Interfaces ---
interface Subject { id: number; name: string; code: string; grade: string; credits: number; description: string; }
interface Grade { id: number; student: { studentId: string }; subject: { code: string }; assessmentType: string; marksObtained: number; maxMarks: number; letterGrade: string; academicYear: string; semester: string; }
interface Page<T> { content: T[]; totalPages: number; number: number; }

// --- Reusable Import Dialog ---
const ImportDialog = ({ isOpen, onOpenChange, onImport, onDownloadTemplate, setImportFile, loading, title }: any) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 text-white border-gray-700">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-400">Upload a CSV file. The first row must be headers matching the template.</p>
          <Button variant="outline" onClick={onDownloadTemplate} className="w-full gap-2"><Download size={16}/>Download CSV Template</Button>
          <div><Label htmlFor="importFile">Upload File</Label><Input id="importFile" type="file" onChange={(e) => setImportFile(e.target.files?.[0] || null)} accept=".csv" className="bg-gray-800 border-gray-600 file:text-white" /></div>
          <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={onImport} disabled={loading}>{loading ? "Importing..." : "Start Import"}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
);

export default function Academics() {
    const { user, isSuperAdmin, selectedInstitution } = useAuth();
  const [subjectPage, setSubjectPage] = useState<Page<Subject> | null>(null);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectGradeFilter, setSubjectGradeFilter] = useState("All");
  const [subjectPageNum, setSubjectPageNum] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isSubjectImportOpen, setIsSubjectImportOpen] = useState(false);

  const [gradePage, setGradePage] = useState<Page<Grade> | null>(null);
  const [gradeSearch, setGradeSearch] = useState("");
  const [gradeYearFilter, setGradeYearFilter] = useState("All");
  const [gradeSemesterFilter, setGradeSemesterFilter] = useState("All");
  const [gradePageNum, setGradePageNum] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isGradeImportOpen, setIsGradeImportOpen] = useState(false);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

    const fetchSubjects = useCallback((page = 0, grade = "All", search = "") => {
        setLoading(true);
        const params = new URLSearchParams({ page: page.toString(), size: '10', sort: 'name,asc', grade, searchTerm: search });

        // --- TENANCY LOGIC ---
        if (isSuperAdmin && selectedInstitution && selectedInstitution !== 'all') {
            params.append('institutionId', selectedInstitution.id.toString());
        }

        const url = `http://localhost:8082/api/academic/subjects?${params.toString()}`;
        apiFetch(url).then(res => res.json()).then(setSubjectPage).catch(() => toast.error("Failed to fetch subjects")).finally(() => setLoading(false));
    }, [isSuperAdmin, selectedInstitution]); // <-- Add dependencies

    const fetchGrades = useCallback((page = 0, year = "All", semester = "All", search = "") => {
        setLoading(true);
        const params = new URLSearchParams({ page: page.toString(), size: '10', sort: 'recordedDate,desc', year, semester, searchTerm: search });

        // --- TENANCY LOGIC ---
        if (isSuperAdmin && selectedInstitution && selectedInstitution !== 'all') {
            params.append('institutionId', selectedInstitution.id.toString());
        }

        const url = `http://localhost:8082/api/academic/grades?${params.toString()}`;
        apiFetch(url).then(res => res.json()).then(setGradePage).catch(() => toast.error("Failed to fetch grades")).finally(() => setLoading(false));
    }, [isSuperAdmin, selectedInstitution]); // <-- Add dependencies

    useEffect(() => {
        const timer = setTimeout(() => fetchSubjects(subjectPageNum, subjectGradeFilter, subjectSearch), 300);
        return () => clearTimeout(timer);
    }, [subjectPageNum, subjectGradeFilter, subjectSearch, fetchSubjects]);

    useEffect(() => {
        const timer = setTimeout(() => fetchGrades(gradePageNum, gradeYearFilter, gradeSemesterFilter, gradeSearch), 300);
        return () => clearTimeout(timer);
    }, [gradePageNum, gradeYearFilter, gradeSemesterFilter, gradeSearch, fetchGrades]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSubjects(subjectPageNum, subjectGradeFilter, subjectSearch), 300);
    return () => clearTimeout(timer);
  }, [subjectPageNum, subjectGradeFilter, subjectSearch, fetchSubjects]);

  useEffect(() => {
    const timer = setTimeout(() => fetchGrades(gradePageNum, gradeYearFilter, gradeSemesterFilter, gradeSearch), 300);
    return () => clearTimeout(timer);
  }, [gradePageNum, gradeYearFilter, gradeSemesterFilter, gradeSearch, fetchGrades]);

  const handleSubjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true);
    const formData = new FormData(e.currentTarget);
    const subjectData = { name: formData.get('name'), code: formData.get('code'), grade: formData.get('grade'), credits: parseInt(formData.get('credits') as string), description: formData.get('description') };
    const url = selectedSubject ? `http://localhost:8082/api/academic/subjects/${selectedSubject.id}` : 'http://localhost:8082/api/academic/subjects';
    const method = selectedSubject ? 'PUT' : 'POST';
    try {
      const response = await apiFetch(url, { method, body: JSON.stringify(subjectData) });
      if (response.ok) {
        toast.success(`Subject ${selectedSubject ? 'updated' : 'created'} successfully`);
        setIsSubjectDialogOpen(false); setSelectedSubject(null);
        fetchSubjects(subjectPageNum, subjectGradeFilter, subjectSearch);
      } else { throw new Error('Failed to save subject'); }
    } catch (error) { toast.error('Failed to save subject'); }
    finally { setLoading(false); }
  };

  const handleGradeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true);
    const formData = new FormData(e.currentTarget);
    const gradeData = { studentId: formData.get('studentId') as string, subjectId: formData.get('subjectId') as string, assessmentType: formData.get('assessmentType') as string, marksObtained: parseInt(formData.get('marksObtained') as string), maxMarks: parseInt(formData.get('maxMarks') as string), letterGrade: formData.get('letterGrade'), academicYear: formData.get('academicYear'), semester: formData.get('semester') as string };
    const url = selectedGrade ? `http://localhost:8082/api/academic/grades/${selectedGrade.id}` : 'http://localhost:8082/api/academic/grades';
    const method = selectedGrade ? 'PUT' : 'POST';
    try {
      const response = await apiFetch(url, { method, body: JSON.stringify(gradeData) });
      if (response.ok) {
        toast.success(`Grade ${selectedGrade ? 'updated' : 'added'} successfully`);
        setIsGradeDialogOpen(false); setSelectedGrade(null);
        fetchGrades(gradePageNum, gradeYearFilter, gradeSemesterFilter, gradeSearch);
      } else { throw new Error('Failed to save grade'); }
    } catch (error) { toast.error('Failed to save grade'); }
    finally { setLoading(false); }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      const response = await apiFetch(`http://localhost:8082/api/academic/subjects/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Subject deleted successfully');
        fetchSubjects(subjectPageNum, subjectGradeFilter, subjectSearch);
      } else { throw new Error(await response.text()); }
    } catch (error) { toast.error((error as Error).message); }
  };

  const handleDeleteGrade = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this grade?')) return;
    try {
      const response = await apiFetch(`http://localhost:8082/api/academic/grades/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Grade deleted successfully');
        fetchGrades(gradePageNum, gradeYearFilter, gradeSemesterFilter, gradeSearch);
      } else { throw new Error(await response.text()); }
    } catch (error) { toast.error((error as Error).message); }
  };

  const handleImport = async (type: 'subjects' | 'grades') => {
    if (!importFile) return toast.warning("Please select a file.");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", importFile);
    const url = `http://localhost:8082/api/academic/${type}/bulk-upload`;
    try {
      const response = await apiFetch(url, { method: 'POST', body: formData }); // Use apiFetch for multipart
      if (response.ok) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} imported successfully!`);
        if (type === 'subjects') { setIsSubjectImportOpen(false); fetchSubjects(); }
        if (type === 'grades') { setIsGradeImportOpen(false); fetchGrades(); }
      } else { throw new Error(await response.text()); }
    } catch (error) { toast.error((error as Error).message); }
    finally { setLoading(false); setImportFile(null); }
  };

  const downloadTemplate = (type: 'subjects' | 'grades') => {
    let headers, example, filename;
    if (type === 'subjects') {
      headers = "code,name,grade,credits,description\n";
      example = "MTH-101,Algebra I,9,5,Introductory algebra course\n";
      filename = "subjects_template.csv";
    } else {
      headers = "studentId,subjectCode,assessmentType,marksObtained,maxMarks,letterGrade,academicYear,semester\n";
      example = "P2522029,MTH-101,FINAL,88,100,A,2024-2025,SEMESTER_1\n";
      filename = "grades_template.csv";
    }
    const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!user) { return <Navigate to="/" replace />; }

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center"><h1 className="text-2xl font-bold">Academic Management</h1><Button asChild className="bg-purple-600"><Link to="/dashboard" className="flex items-center gap-2"><Home className="h-4 w-4 mr-2"/>Dashboard</Link></Button></div>
          <Tabs defaultValue="subjects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-purple-900/50 border-purple-700">
              <TabsTrigger value="subjects">Curriculum & Subjects</TabsTrigger>
              <TabsTrigger value="grades">Grades & Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects">
              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><BookOpen/>Subject Management</CardTitle><div className="flex gap-2"><Button onClick={() => setIsSubjectImportOpen(true)} className="bg-blue-600 hover:bg-blue-700"><UploadCloud className="h-4 w-4 mr-2"/>Import Subjects</Button><Button onClick={() => { setSelectedSubject(null); setIsSubjectDialogOpen(true); }} className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2"/>Add Subject</Button></div></div>
                  <div className="flex gap-4 pt-4"><Input placeholder="Search by name or code..." value={subjectSearch} onChange={e => {setSubjectSearch(e.target.value); setSubjectPageNum(0);}} className="bg-purple-800 border-purple-600" /><Select value={subjectGradeFilter} onValueChange={v => {setSubjectGradeFilter(v); setSubjectPageNum(0);}}><SelectTrigger className="w-[180px] bg-purple-800 border-purple-600"><SelectValue/></SelectTrigger><SelectContent className="bg-purple-800"><SelectItem value="All">All Grades</SelectItem>{[...Array(12)].map((_,i) => <SelectItem key={i} value={`${i+1}`}>{`Grade ${i+1}`}</SelectItem>)}</SelectContent></Select></div>
                </CardHeader>
                <CardContent><div className="space-y-4">{loading && !subjectPage?.content ? <p className="text-center p-4">Loading subjects...</p> : subjectPage?.content.map((subject) => (<div key={subject.id} className="flex justify-between items-center p-4 bg-purple-800/30 rounded-lg border border-purple-600"><div><h3 className="font-semibold">{subject.name} ({subject.code})</h3><p className="text-sm text-gray-300">Grade {subject.grade} • {subject.credits} Credits</p></div><div className="flex gap-2"><Button size="sm" variant="outline" className="hover:bg-purple-700" onClick={() => { setSelectedSubject(subject); setIsSubjectDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="outline" className="text-red-400 hover:bg-red-600 hover:text-white" onClick={() => handleDeleteSubject(subject.id)}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div><PaginationControls page={subjectPage} onPageChange={setSubjectPageNum} /></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades">
              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><GraduationCap/>Grade Management</CardTitle><div className="flex gap-2"><Button onClick={() => setIsGradeImportOpen(true)} className="bg-blue-600 hover:bg-blue-700"><UploadCloud className="h-4 w-4 mr-2"/>Import Grades</Button><Button onClick={() => { setSelectedGrade(null); setIsGradeDialogOpen(true); }} className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2"/>Add Grade</Button></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                    <Input placeholder="Search Student ID or Subject Code..." value={gradeSearch} onChange={e => {setGradeSearch(e.target.value); setGradePageNum(0);}} className="bg-purple-800 border-purple-600 md:col-span-2" />
                    <Select value={gradeYearFilter} onValueChange={v => {setGradeYearFilter(v); setGradePageNum(0);}}><SelectTrigger className="bg-purple-800"><SelectValue placeholder="All Years"/></SelectTrigger><SelectContent className="bg-purple-800"><SelectItem value="All">All Years</SelectItem><SelectItem value="2024-2025">2024-2025</SelectItem><SelectItem value="2023-2024">2023-2024</SelectItem></SelectContent></Select>
                    <Select value={gradeSemesterFilter} onValueChange={v => {setGradeSemesterFilter(v); setGradePageNum(0);}}><SelectTrigger className="bg-purple-800"><SelectValue placeholder="All Semesters"/></SelectTrigger><SelectContent className="bg-purple-800"><SelectItem value="All">All Semesters</SelectItem><SelectItem value="SEMESTER_1">Semester 1</SelectItem><SelectItem value="SEMESTER_2">Semester 2</SelectItem></SelectContent></Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-purple-600"><th className="p-2">Student ID</th><th className="p-2">Subject</th><th className="p-2">Marks</th><th className="p-2">Grade</th><th className="p-2 text-center">Actions</th></tr></thead><tbody>
                  {loading && !gradePage?.content ? (<tr><td colSpan={5} className="text-center p-4">Loading grades...</td></tr>) :
                      gradePage?.content.map(grade => (<tr key={grade.id} className="border-b border-purple-800">
                        <td className="p-2">{grade.student.studentId}</td><td className="p-2">{grade.subject.code}</td>
                        <td className="p-2">{`${grade.marksObtained} / ${grade.maxMarks}`}</td><td className="p-2">{grade.letterGrade}</td>
                        <td className="p-2 text-center"><div className="flex justify-center gap-2"><Button size="sm" onClick={() => {setSelectedGrade(grade); setIsGradeDialogOpen(true);}}><Edit size={16}/></Button><Button size="sm" variant="destructive" onClick={() => handleDeleteGrade(grade.id)}><Trash2 size={16}/></Button></div></td>
                      </tr>))}
                  </tbody></table></div>
                  <PaginationControls page={gradePage} onPageChange={setGradePageNum} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <ImportDialog isOpen={isSubjectImportOpen} onOpenChange={setIsSubjectImportOpen} onImport={() => handleImport('subjects')} onDownloadTemplate={() => downloadTemplate('subjects')} setImportFile={setImportFile} loading={loading} title="Bulk Import Subjects" />
        <ImportDialog isOpen={isGradeImportOpen} onOpenChange={setIsGradeImportOpen} onImport={() => handleImport('grades')} onDownloadTemplate={() => downloadTemplate('grades')} setImportFile={setImportFile} loading={loading} title="Bulk Import Grades"/>

        <Dialog open={isSubjectDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setSelectedSubject(null); setIsSubjectDialogOpen(isOpen); }}><DialogContent className="bg-purple-900 border-purple-700 text-white"><DialogHeader><DialogTitle>{selectedSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle></DialogHeader><form onSubmit={handleSubjectSubmit} className="space-y-4"><div><Label htmlFor="name">Subject Name</Label><Input id="name" name="name" defaultValue={selectedSubject?.name} required className="bg-purple-800"/></div><div><Label htmlFor="code">Subject Code</Label><Input id="code" name="code" defaultValue={selectedSubject?.code} required className="bg-purple-800"/></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="grade">Grade Level</Label><Select name="grade" defaultValue={selectedSubject?.grade}><SelectTrigger className="bg-purple-800"><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent className="bg-purple-800">{[...Array(12)].map((_,i) => <SelectItem key={i} value={`${i+1}`}>{`Grade ${i+1}`}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="credits">Credits</Label><Input id="credits" name="credits" type="number" defaultValue={selectedSubject?.credits} required className="bg-purple-800"/></div></div><div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={selectedSubject?.description} className="bg-purple-800"/></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div></form></DialogContent></Dialog>
        <Dialog open={isGradeDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setSelectedGrade(null); setIsGradeDialogOpen(isOpen); }}><DialogContent className="bg-purple-900 border-purple-700 text-white"><DialogHeader><DialogTitle>{selectedGrade ? 'Edit Grade' : 'Add New Grade'}</DialogTitle></DialogHeader><form onSubmit={handleGradeSubmit} className="space-y-4"><div><Label htmlFor="studentId">Student ID</Label><Input id="studentId" name="studentId" defaultValue={selectedGrade?.student?.studentId} required className="bg-purple-800"/></div><div><Label htmlFor="subjectId">Subject Code</Label><Input id="subjectId" name="subjectId" defaultValue={selectedGrade?.subject?.code} required className="bg-purple-800"/></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="assessmentType">Assessment Type</Label><Select name="assessmentType" defaultValue={selectedGrade?.assessmentType}><SelectTrigger className="bg-purple-800"><SelectValue/></SelectTrigger><SelectContent className="bg-purple-800"><SelectItem value="MIDTERM">Midterm</SelectItem><SelectItem value="FINAL">Final</SelectItem></SelectContent></Select></div><div><Label htmlFor="letterGrade">Letter Grade</Label><Input id="letterGrade" name="letterGrade" defaultValue={selectedGrade?.letterGrade} required className="bg-purple-800"/></div></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="marksObtained">Marks Obtained</Label><Input id="marksObtained" name="marksObtained" type="number" defaultValue={selectedGrade?.marksObtained} required className="bg-purple-800"/></div><div><Label htmlFor="maxMarks">Max Marks</Label><Input id="maxMarks" name="maxMarks" type="number" defaultValue={selectedGrade?.maxMarks} required className="bg-purple-800"/></div></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="academicYear">Academic Year</Label><Input id="academicYear" name="academicYear" defaultValue={selectedGrade?.academicYear} required className="bg-purple-800"/></div><div><Label htmlFor="semester">Semester</Label><Select name="semester" defaultValue={selectedGrade?.semester}><SelectTrigger className="bg-purple-800"><SelectValue/></SelectTrigger><SelectContent className="bg-purple-800"><SelectItem value="SEMESTER_1">Semester 1</SelectItem><SelectItem value="SEMESTER_2">Semester 2</SelectItem></SelectContent></Select></div></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsGradeDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div></form></DialogContent></Dialog>
      </div>
  );
}