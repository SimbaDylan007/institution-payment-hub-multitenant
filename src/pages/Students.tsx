import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Home, Plus, Search, Edit, Trash2, Users, UserCheck, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import StudentForm from "@/components/forms/StudentForm";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  grade: string;
  section: string;
  rollNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
  enrollmentStatus: string;
}

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  // CORRECTED CODE BLOCK
  useEffect(() => {
    if (!students) return;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = students.filter(student =>
        (student.firstName || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (student.lastName || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (student.email || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (student.rollNumber || '').toLowerCase().includes(lowercasedSearchTerm) ||
        (student.grade || '').toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      } else {
        toast.error('Failed to fetch students');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error fetching students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSaved = (studentData: any) => {
    // Ensure all required fields are present
    const completeStudentData = {
      ...studentData,
      dateOfBirth: studentData.dateOfBirth || '',
      gender: studentData.gender || '',
      enrollmentDate: studentData.enrollmentDate || new Date().toISOString().split('T')[0]
    };

    if (selectedStudent) {
      // Update existing student
      setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, ...completeStudentData } : s));
      toast.success('Student updated successfully');
    } else {
      // Add new student
      const newStudent = { ...completeStudentData, id: Date.now() };
      setStudents([...students, newStudent]);
      toast.success('Student added successfully');
    }
    setIsDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleDeleteStudent = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/students/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setStudents(students.filter(s => s.id !== id));
          toast.success('Student deleted successfully');
        } else {
          toast.error('Failed to delete student');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Error deleting student');
      }
    }
  };

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.enrollmentStatus === 'active').length;
  const inactiveStudents = students.filter(s => s.enrollmentStatus === 'inactive').length;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Student Management</h1>
              <p className="text-gray-300">Manage student information and records</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => setSelectedStudent(null)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedStudent ? 'Edit Student' : 'Add New Student'}
                    </DialogTitle>
                  </DialogHeader>
                  <StudentForm
                      student={selectedStudent}
                      onSave={handleStudentSaved}
                      onCancel={() => {
                        setIsDialogOpen(false);
                        setSelectedStudent(null);
                      }}
                  />
                </DialogContent>
              </Dialog>
              <Button className="bg-purple-600 text-white hover:bg-purple-700" asChild>
                <Link to="/dashboard" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{totalStudents}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <UserCheck className="h-5 w-5" />
                  Active Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{activeStudents}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <UserX className="h-5 w-5" />
                  Inactive Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{inactiveStudents}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700 mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                      placeholder="Search students by name, email, roll number, or grade..."
                      className="pl-10 bg-gray-800 border-gray-600 text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white">Students</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-300">Loading students...</div>
                  </div>
              ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-300">No students found</div>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Name</TableHead>
                          <TableHead className="text-gray-300">Roll Number</TableHead>
                          <TableHead className="text-gray-300">Grade</TableHead>
                          <TableHead className="text-gray-300">Section</TableHead>
                          <TableHead className="text-gray-300">Email</TableHead>
                          <TableHead className="text-gray-300">Phone</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                            <TableRow key={student.id} className="border-gray-700">
                              <TableCell className="text-white">
                                {student.firstName} {student.lastName}
                              </TableCell>
                              <TableCell className="text-gray-300">{student.rollNumber}</TableCell>
                              <TableCell className="text-gray-300">{student.grade}</TableCell>
                              <TableCell className="text-gray-300">{student.section}</TableCell>
                              <TableCell className="text-gray-300">{student.email}</TableCell>
                              <TableCell className="text-gray-300">{student.phone}</TableCell>
                              <TableCell>
                                <Badge variant={student.enrollmentStatus === 'active' ? 'default' : 'secondary'}>
                                  {student.enrollmentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditStudent(student)}
                                      className="border-blue-600 text-blue-400 hover:bg-blue-600"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteStudent(student.id)}
                                      className="border-red-600 text-red-400 hover:bg-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
              )}
            </CardContent>
          </Card>
        </main>

        <footer className="bg-gradient-to-r from-purple-900 via-blue-900 to-black border-t border-purple-700 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-300">
            © {new Date().getFullYear()} School Management System
          </div>
        </footer>
      </div>
  );
}