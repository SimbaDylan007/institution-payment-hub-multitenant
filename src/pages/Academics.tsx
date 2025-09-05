import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Home, BookOpen, Plus, Edit, Trash2, GraduationCap, Users, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Subject {
  id: number;
  name: string;
  code: string;
  grade: string;
  credits: number;
  description: string;
}

interface Grade {
  id: number;
  studentId: string;
  subjectId: string;
  assessmentType: string;
  marksObtained: number;
  maxMarks: number;
  letterGrade: string;
  academicYear: string;
  semester: string; // --- ADDED --- Added semester to the interface
}

export default function Academics() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchGrades();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/academic/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/academic/grades');
      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const subjectData = {
      name: formData.get('name'),
      code: formData.get('code'),
      grade: formData.get('grade'),
      credits: parseInt(formData.get('credits') as string),
      description: formData.get('description')
    };

    try {
      const url = selectedSubject
          ? `http://localhost:8080/api/academic/subjects/${selectedSubject.id}`
          : 'http://localhost:8080/api/academic/subjects';

      const response = await fetch(url, {
        method: selectedSubject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectData)
      });

      if (response.ok) {
        toast.success(`Subject ${selectedSubject ? 'updated' : 'created'} successfully`);
        setIsSubjectDialogOpen(false);
        setSelectedSubject(null);
        fetchSubjects();
      } else {
        throw new Error('Failed to save subject');
      }
    } catch (error) {
      toast.error('Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const gradeData = {
      studentId: formData.get('studentId') as string,
      subjectId: formData.get('subjectId') as string,
      assessmentType: formData.get('assessmentType') as string,
      marksObtained: parseInt(formData.get('marksObtained') as string),
      maxMarks: parseInt(formData.get('maxMarks') as string),
      letterGrade: formData.get('letterGrade'),
      academicYear: formData.get('academicYear'),
      semester: formData.get('semester') as string // --- ADDED --- Sending semester to backend
    };

    try {
      const url = selectedGrade
          ? `http://localhost:8080/api/academic/grades/${selectedGrade.id}`
          : 'http://localhost:8080/api/academic/grades';

      const response = await fetch(url, {
        method: selectedGrade ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });

      if (response.ok) {
        toast.success(`Grade ${selectedGrade ? 'updated' : 'added'} successfully`);
        setIsGradeDialogOpen(false);
        setSelectedGrade(null);
        fetchGrades();
      } else {
        throw new Error('Failed to save grade');
      }
    } catch (error) {
      toast.error('Failed to save grade');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/academic/subjects/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Subject deleted successfully');
        fetchSubjects();
      }
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  const handleDeleteGrade = async (id: number) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/academic/grades/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Grade deleted successfully');
        fetchGrades();
      }
    } catch (error) {
      toast.error('Failed to delete grade');
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Academic Management</h1>
              <p className="text-gray-300">Manage curriculum, subjects, and academic records</p>
            </div>
            <Button className="bg-purple-600 text-white hover:bg-purple-700" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="subjects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-purple-900/50 border-purple-700">
              <TabsTrigger value="subjects" className="data-[state=active]:bg-purple-600">Curriculum & Subjects</TabsTrigger>
              <TabsTrigger value="grades" className="data-[state=active]:bg-purple-600">Grades & Assessment</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">Academic Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects">
              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BookOpen className="h-5 w-5" />
                      Subject Management
                    </CardTitle>
                    <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subject
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-purple-900 border-purple-700 text-white">
                        <DialogHeader>
                          <DialogTitle>{selectedSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubjectSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Subject Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={selectedSubject?.name || ''}
                                className="bg-purple-800 border-purple-600"
                                required
                            />
                          </div>
                          <div>
                            <Label htmlFor="code">Subject Code</Label>
                            <Input
                                id="code"
                                name="code"
                                defaultValue={selectedSubject?.code || ''}
                                className="bg-purple-800 border-purple-600"
                                required
                            />
                          </div>
                          <div>
                            <Label htmlFor="grade">Grade Level</Label>
                            <Select name="grade" defaultValue={selectedSubject?.grade || ''}>
                              <SelectTrigger className="bg-purple-800 border-purple-600">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent className="bg-purple-800 border-purple-600">
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                                    <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="credits">Credits</Label>
                            <Input
                                id="credits"
                                name="credits"
                                type="number"
                                defaultValue={selectedSubject?.credits || ''}
                                className="bg-purple-800 border-purple-600"
                                required
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={selectedSubject?.description || ''}
                                className="bg-purple-800 border-purple-600"
                                rows={3}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsSubjectDialogOpen(false);
                                  setSelectedSubject(null);
                                }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                              {loading ? 'Saving...' : (selectedSubject ? 'Update' : 'Add')}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects.map((subject) => (
                        <div key={subject.id} className="flex justify-between items-center p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                          <div>
                            <h3 className="font-semibold text-white">{subject.name} ({subject.code})</h3>
                            <p className="text-sm text-gray-300">Grade {subject.grade} • {subject.credits} Credits</p>
                            <p className="text-sm text-gray-400">{subject.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-600 text-white hover:bg-purple-700"
                                onClick={() => {
                                  setSelectedSubject(subject);
                                  setIsSubjectDialogOpen(true);
                                }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                onClick={() => handleDeleteSubject(subject.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades">
              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <GraduationCap className="h-5 w-5" />
                      Grade Management
                    </CardTitle>
                    <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Grade
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-purple-900 border-purple-700 text-white">
                        <DialogHeader>
                          <DialogTitle>{selectedGrade ? 'Edit Grade' : 'Add New Grade'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleGradeSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input
                                id="studentId"
                                name="studentId"
                                defaultValue={selectedGrade?.studentId || ''}
                                className="bg-purple-800 border-purple-600"
                                required
                            />
                          </div>
                          <div>
                            <Label htmlFor="subjectId">Subject Code</Label>
                            <Input
                                id="subjectId"
                                name="subjectId"
                                defaultValue={selectedGrade?.subjectId || ''}
                                className="bg-purple-800 border-purple-600"
                                required
                            />
                          </div>
                          <div>
                            <Label htmlFor="assessmentType">Assessment Type</Label>
                            <Select name="assessmentType" defaultValue={selectedGrade?.assessmentType || ''}>
                              <SelectTrigger className="bg-purple-800 border-purple-600">
                                <SelectValue placeholder="Select assessment type" />
                              </SelectTrigger>
                              <SelectContent className="bg-purple-800 border-purple-600">
                                <SelectItem value="MIDTERM">Midterm</SelectItem>
                                <SelectItem value="FINAL">Final</SelectItem>
                                <SelectItem value="QUIZ">Quiz</SelectItem>
                                <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="marksObtained">Marks Obtained</Label>
                              <Input
                                  id="marksObtained"
                                  name="marksObtained"
                                  type="number"
                                  defaultValue={selectedGrade?.marksObtained || ''}
                                  className="bg-purple-800 border-purple-600"
                                  required
                              />
                            </div>
                            <div>
                              <Label htmlFor="maxMarks">Max Marks</Label>
                              <Input
                                  id="maxMarks"
                                  name="maxMarks"
                                  type="number"
                                  defaultValue={selectedGrade?.maxMarks || ''}
                                  className="bg-purple-800 border-purple-600"
                                  required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="letterGrade">Letter Grade</Label>
                            <Input
                                id="letterGrade"
                                name="letterGrade"
                                defaultValue={selectedGrade?.letterGrade || ''}
                                className="bg-purple-800 border-purple-600"
                                required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="academicYear">Academic Year</Label>
                              <Input
                                  id="academicYear"
                                  name="academicYear"
                                  defaultValue={selectedGrade?.academicYear || '2024-2025'}
                                  className="bg-purple-800 border-purple-600"
                                  required
                              />
                            </div>
                            {/* --- ADDED --- New Select dropdown for Semester */}
                            <div>
                              <Label htmlFor="semester">Semester</Label>
                              <Select name="semester" defaultValue={selectedGrade?.semester || ''}>
                                <SelectTrigger className="bg-purple-800 border-purple-600">
                                  <SelectValue placeholder="Select semester" />
                                </SelectTrigger>
                                <SelectContent className="bg-purple-800 border-purple-600">
                                  <SelectItem value="SEMESTER_1">Semester 1</SelectItem>
                                  <SelectItem value="SEMESTER_2">Semester 2</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsGradeDialogOpen(false);
                                  setSelectedGrade(null);
                                }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                              {loading ? 'Saving...' : (selectedGrade ? 'Update' : 'Add')}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {grades.map((grade) => (
                        <div key={grade.id} className="flex justify-between items-center p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                          <div>
                            <h3 className="font-semibold text-white">Student ID: {grade.studentId} • Subject Code: {grade.subjectId}</h3>
                            <p className="text-sm text-gray-300">{grade.assessmentType} • {grade.marksObtained}/{grade.maxMarks} ({grade.letterGrade})</p>
                            <p className="text-sm text-gray-400">AY: {grade.academicYear}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-600 text-white hover:bg-purple-700"
                                onClick={() => {
                                  setSelectedGrade(grade);
                                  setIsGradeDialogOpen(true);
                                }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                onClick={() => handleDeleteGrade(grade.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ClipboardList className="h-5 w-5" />
                    Academic Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-purple-800/30 border-purple-600">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-400">{subjects.length}</div>
                        <p className="text-sm text-gray-300">Total Subjects</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-800/30 border-purple-600">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{grades.length}</div>
                        <p className="text-sm text-gray-300">Total Grades Recorded</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-800/30 border-purple-600">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-400">
                          {grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + (g.marksObtained/g.maxMarks * 100), 0) / grades.length) : 0}%
                        </div>
                        <p className="text-sm text-gray-300">Average Performance</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="bg-gradient-to-r from-purple-900 via-blue-900 to-black border-t border-purple-700 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-300">
            &copy; {new Date().getFullYear()} School Management System
          </div>
        </footer>
      </div>
  );
}