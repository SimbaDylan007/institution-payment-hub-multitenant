
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Plus, Edit, Eye, Archive, GraduationCap, Heart, FileText, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllStudents, 
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByStatus,
  getStudentsByGrade,
  searchStudents,
  getStudentGuardians,
  addGuardian,
  getStudentMedicalRecords,
  addMedicalRecord,
  getStudentAcademicRecords,
  addAcademicRecord
} from "@/services/studentApiService";

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  enrollmentDate: string;
  enrollmentStatus: string;
  currentGrade: string;
  section?: string;
  parentContact?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  specialNeeds?: string;
}

interface Guardian {
  id: number;
  firstName: string;
  lastName: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  occupation?: string;
  address?: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
}

interface MedicalRecord {
  id: number;
  recordType: string;
  description: string;
  recordDate: string;
  doctorName?: string;
  medications?: string;
  allergies?: string;
  notes?: string;
}

interface AcademicRecord {
  id: number;
  academicYear: string;
  term: string;
  grade: string;
  gpa?: number;
  totalCredits?: number;
  status: string;
  notes?: string;
}

export default function Students() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, gradeFilter, statusFilter]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getAllStudents() as Student[];
      setStudents(data);
      toast({
        title: "Success",
        description: "Students loaded successfully",
      });
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentsByStatus = async (status: string) => {
    setIsLoading(true);
    try {
      if (status === "ALL") {
        await loadStudents();
      } else {
        const data = await getStudentsByStatus(status) as Student[];
        setStudents(data);
      }
    } catch (error) {
      console.error("Error loading students by status:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentsByGrade = async (grade: string) => {
    setIsLoading(true);
    try {
      if (grade === "ALL") {
        await loadStudents();
      } else {
        const data = await getStudentsByGrade(grade) as Student[];
        setStudents(data);
      }
    } catch (error) {
      console.error("Error loading students by grade:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setIsLoading(true);
      try {
        const data = await searchStudents(query) as Student[];
        setStudents(data);
      } catch (error) {
        console.error("Error searching students:", error);
        toast({
          title: "Error",
          description: "Failed to search students",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      loadStudents();
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

    if (gradeFilter !== "ALL") {
      filtered = filtered.filter(student => student.currentGrade === gradeFilter);
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(student => student.enrollmentStatus === statusFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const [guardiansData, medicalData, academicData] = await Promise.all([
        getStudentGuardians(student.id) as Promise<Guardian[]>,
        getStudentMedicalRecords(student.id) as Promise<MedicalRecord[]>,
        getStudentAcademicRecords(student.id) as Promise<AcademicRecord[]>
      ]);
      setGuardians(guardiansData);
      setMedicalRecords(medicalData);
      setAcademicRecords(academicData);
    } catch (error) {
      console.error("Error loading student details:", error);
      toast({
        title: "Error",
        description: "Failed to load student details",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await deleteStudent(studentId);
      setStudents(students.filter(s => s.id !== studentId));
      toast({
        title: "Success",
        description: "Student archived successfully",
      });
    } catch (error) {
      console.error("Error archiving student:", error);
      toast({
        title: "Error",
        description: "Failed to archive student",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: "bg-green-500",
      INACTIVE: "bg-yellow-500",
      GRADUATED: "bg-blue-500",
      WITHDRAWN: "bg-red-500",
      SUSPENDED: "bg-orange-500"
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-500";
  };

  const getStatusCounts = () => {
    return {
      total: students.length,
      active: students.filter(s => s.enrollmentStatus === "ACTIVE").length,
      inactive: students.filter(s => s.enrollmentStatus === "INACTIVE").length,
      graduated: students.filter(s => s.enrollmentStatus === "GRADUATED").length
    };
  };

  const statusCounts = getStatusCounts();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#121828] text-white dark:bg-gray-100 dark:text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage student records and academic information
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-green-500 text-white hover:bg-green-600">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{statusCounts.total}</div>
              <p className="text-sm text-gray-400">Total Students</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{statusCounts.active}</div>
              <p className="text-sm text-gray-400">Active Enrollment</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">{statusCounts.inactive}</div>
              <p className="text-sm text-gray-400">Inactive</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">{statusCounts.graduated}</div>
              <p className="text-sm text-gray-400">Graduated</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="directory">Student Directory</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="academic">Academic Records</TabsTrigger>
            <TabsTrigger value="guardians">Parents/Guardians</TabsTrigger>
            <TabsTrigger value="medical">Medical Records</TabsTrigger>
          </TabsList>

          <TabsContent value="directory">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Directory
                </CardTitle>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value.trim()) {
                          handleSearch(e.target.value);
                        }
                      }}
                      className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-300"
                    />
                  </div>
                  <select
                    value={gradeFilter}
                    onChange={(e) => {
                      setGradeFilter(e.target.value);
                      loadStudentsByGrade(e.target.value);
                    }}
                    className="bg-[#252e3e] dark:bg-gray-50 border border-gray-700 dark:border-gray-300 rounded px-3 py-2"
                  >
                    <option value="ALL">All Grades</option>
                    <option value="KG">Kindergarten</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      loadStudentsByStatus(e.target.value);
                    }}
                    className="bg-[#252e3e] dark:bg-gray-50 border border-gray-700 dark:border-gray-300 rounded px-3 py-2"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="GRADUATED">Graduated</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg border border-gray-700 dark:border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {student.firstName} {student.lastName}
                              </h3>
                              <Badge className={`${getStatusBadge(student.enrollmentStatus)} text-white`}>
                                {student.enrollmentStatus}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Student ID:</span>
                                <p className="font-medium">{student.studentId}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Grade:</span>
                                <p className="font-medium">{student.currentGrade}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Section:</span>
                                <p className="font-medium">{student.section || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Email:</span>
                                <p className="font-medium">{student.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewStudent(student)}
                              className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-500 text-white hover:bg-green-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrollment">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Enrollment Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">
                        Enrollment Details - {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Enrollment Date:</span>
                          <p className="font-medium">{selectedStudent.enrollmentDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Current Grade:</span>
                          <p className="font-medium">{selectedStudent.currentGrade}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <Badge className={`${getStatusBadge(selectedStudent.enrollmentStatus)} text-white`}>
                            {selectedStudent.enrollmentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p>Select a student to view enrollment details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">
                        Academic History - {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="space-y-3">
                        {academicRecords.map((record) => (
                          <div key={record.id} className="bg-[#1A1F2C] dark:bg-white p-3 rounded border border-gray-700 dark:border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Year:</span>
                                <p className="font-medium">{record.academicYear}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Term:</span>
                                <p className="font-medium">{record.term}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Grade:</span>
                                <p className="font-medium">{record.grade}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">GPA:</span>
                                <p className="font-medium">{record.gpa || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p>Select a student to view academic records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guardians">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parents/Guardians
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">
                        Guardian Information - {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="space-y-3">
                        {guardians.map((guardian) => (
                          <div key={guardian.id} className="bg-[#1A1F2C] dark:bg-white p-3 rounded border border-gray-700 dark:border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Name:</span>
                                <p className="font-medium">{guardian.firstName} {guardian.lastName}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Relationship:</span>
                                <p className="font-medium">{guardian.relationship}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Phone:</span>
                                <p className="font-medium">{guardian.primaryPhone}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Email:</span>
                                <p className="font-medium">{guardian.email || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="mt-2 flex gap-2">
                              {guardian.isPrimary && (
                                <Badge className="bg-blue-500 text-white">Primary</Badge>
                              )}
                              {guardian.isEmergencyContact && (
                                <Badge className="bg-red-500 text-white">Emergency Contact</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p>Select a student to view guardian information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">
                        Medical History - {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="space-y-3">
                        {medicalRecords.map((record) => (
                          <div key={record.id} className="bg-[#1A1F2C] dark:bg-white p-3 rounded border border-gray-700 dark:border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Type:</span>
                                <p className="font-medium">{record.recordType}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Date:</span>
                                <p className="font-medium">{record.recordDate}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Doctor:</span>
                                <p className="font-medium">{record.doctorName || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-gray-400">Description:</span>
                              <p className="font-medium">{record.description}</p>
                            </div>
                            {record.allergies && (
                              <div className="mt-2">
                                <span className="text-gray-400">Allergies:</span>
                                <p className="font-medium text-red-400">{record.allergies}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p>Select a student to view medical records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
