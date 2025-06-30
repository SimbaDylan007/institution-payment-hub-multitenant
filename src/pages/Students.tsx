
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Home, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAllStudents, deleteStudent } from "@/services/studentApiService";
import StudentForm from "@/components/forms/StudentForm";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  phone?: string;
  currentGrade?: string;
  section?: string;
  enrollmentStatus: string;
}

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, gradeFilter, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (gradeFilter !== "all") {
      filtered = filtered.filter(student => student.currentGrade === gradeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(student => student.enrollmentStatus === statusFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleDelete = async (studentId: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(studentId);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedStudent(null);
    fetchStudents();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'graduated': return 'bg-blue-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#121828] text-white dark:bg-gray-100 dark:text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage student records and information
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
            <Button
              className="bg-purple-500 text-white hover:bg-purple-600"
              asChild
            >
              <Link to="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{students.length}</div>
              <p className="text-sm text-gray-400">Total Students</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {students.filter(s => s.enrollmentStatus === 'ACTIVE').length}
              </div>
              <p className="text-sm text-gray-400">Active Students</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {students.filter(s => s.enrollmentStatus === 'INACTIVE').length}
              </div>
              <p className="text-sm text-gray-400">Inactive Students</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">
                {students.filter(s => s.enrollmentStatus === 'GRADUATED').length}
              </div>
              <p className="text-sm text-gray-400">Graduated</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200 mb-6">
          <CardHeader>
            <CardTitle>Filter Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {Array.from({length: 12}, (_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>Grade {i+1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="GRADUATED">Graduated</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg border border-gray-700 dark:border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{student.firstName} {student.lastName}</h3>
                          <Badge className={`${getStatusBadgeColor(student.enrollmentStatus)} text-white`}>
                            {student.enrollmentStatus}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-400">
                          <div><span className="font-medium">ID:</span> {student.studentId}</div>
                          <div><span className="font-medium">Grade:</span> {student.currentGrade || 'N/A'}</div>
                          <div><span className="font-medium">Section:</span> {student.section || 'N/A'}</div>
                          <div><span className="font-medium">Email:</span> {student.email}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowViewDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowEditForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(student.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-400">
                    No students found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Student Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <StudentForm onSuccess={handleFormSuccess} onCancel={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <StudentForm 
              student={selectedStudent} 
              onSuccess={handleFormSuccess} 
              onCancel={() => setShowEditForm(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name:</label>
                  <p className="text-gray-600">{selectedStudent.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name:</label>
                  <p className="text-gray-600">{selectedStudent.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Student ID:</label>
                  <p className="text-gray-600">{selectedStudent.studentId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email:</label>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone:</label>
                  <p className="text-gray-600">{selectedStudent.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Grade:</label>
                  <p className="text-gray-600">{selectedStudent.currentGrade || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Section:</label>
                  <p className="text-gray-600">{selectedStudent.section || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <Badge className={`${getStatusBadgeColor(selectedStudent.enrollmentStatus)} text-white`}>
                    {selectedStudent.enrollmentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
