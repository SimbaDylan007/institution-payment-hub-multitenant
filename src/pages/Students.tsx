import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Search, Plus, Edit, Eye, Archive, UserPlus, FileText, Heart, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as studentApi from "@/services/studentApiService";

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
  enrollmentStatus: string;
  enrollmentDate: string;
  currentGrade?: string;
  section?: string;
}

interface Guardian {
  id: number;
  firstName: string;
  lastName: string;
  relationship: string;
  primaryPhone: string;
  email: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
}

interface MedicalRecord {
  id: number;
  recordType: string;
  title: string;
  description: string;
  recordDate: string;
  doctorName?: string;
}

interface AcademicRecord {
  id: number;
  academicYear: string;
  semester: string;
  subject: string;
  grade: number;
  letterGrade: string;
  attendancePercentage: number;
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
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockStudents: Student[] = [
    {
      id: 1,
      studentId: "STU001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "+1234567890",
      dateOfBirth: "2005-03-15",
      gender: "Male",
      address: "123 Main St, City",
      enrollmentStatus: "ACTIVE",
      enrollmentDate: "2020-09-01",
      currentGrade: "Grade 12",
      section: "A"
    },
    {
      id: 2,
      studentId: "STU002",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@email.com",
      phone: "+1234567891",
      dateOfBirth: "2004-07-22",
      gender: "Female",
      address: "456 Oak Ave, City",
      enrollmentStatus: "ACTIVE",
      enrollmentDate: "2019-09-01",
      currentGrade: "Grade 11",
      section: "B"
    },
    {
      id: 3,
      studentId: "STU003",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@email.com",
      phone: "+1234567892",
      dateOfBirth: "2006-01-10",
      gender: "Male",
      address: "789 Pine St, City",
      enrollmentStatus: "GRADUATED",
      enrollmentDate: "2021-09-01",
      currentGrade: "Grade 10",
      section: "A"
    }
  ];

  const mockGuardians: Guardian[] = [
    {
      id: 1,
      firstName: "Robert",
      lastName: "Doe",
      relationship: "FATHER",
      primaryPhone: "+1234567800",
      email: "robert.doe@email.com",
      isPrimary: true,
      isEmergencyContact: true
    },
    {
      id: 2,
      firstName: "Sarah",
      lastName: "Doe",
      relationship: "MOTHER",
      primaryPhone: "+1234567801",
      email: "sarah.doe@email.com",
      isPrimary: false,
      isEmergencyContact: true
    }
  ];

  const mockMedicalRecords: MedicalRecord[] = [
    {
      id: 1,
      recordType: "VACCINATION",
      title: "COVID-19 Vaccination",
      description: "Completed COVID-19 vaccination series",
      recordDate: "2023-01-15",
      doctorName: "Dr. Smith"
    },
    {
      id: 2,
      recordType: "ALLERGY",
      title: "Peanut Allergy",
      description: "Severe peanut allergy - EpiPen required",
      recordDate: "2023-02-10",
      doctorName: "Dr. Johnson"
    }
  ];

  const mockAcademicRecords: AcademicRecord[] = [
    {
      id: 1,
      academicYear: "2023-2024",
      semester: "Fall",
      subject: "Mathematics",
      grade: 92,
      letterGrade: "A",
      attendancePercentage: 95
    },
    {
      id: 2,
      academicYear: "2023-2024",
      semester: "Fall",
      subject: "Physics",
      grade: 88,
      letterGrade: "B+",
      attendancePercentage: 93
    }
  ];

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter, gradeFilter]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await studentApi.getAllStudents();
      setStudents(data);
      toast({
        title: "Success",
        description: "Students loaded successfully",
      });
    } catch (error) {
      console.error("Failed to load students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = async () => {
    let filtered = students;

    if (searchTerm) {
      try {
        filtered = await studentApi.searchStudents(searchTerm);
      } catch (error) {
        // Fallback to local filtering if search API fails
        filtered = students.filter(student =>
          student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    if (statusFilter !== "ALL") {
      try {
        const statusFiltered = await studentApi.getStudentsByStatus(statusFilter);
        filtered = searchTerm ? filtered.filter(s => statusFiltered.some(sf => sf.id === s.id)) : statusFiltered;
      } catch (error) {
        filtered = filtered.filter(student => student.enrollmentStatus === statusFilter);
      }
    }

    if (gradeFilter !== "ALL") {
      try {
        const gradeFiltered = await studentApi.getStudentsByGrade(gradeFilter);
        filtered = filtered.filter(s => gradeFiltered.some(gf => gf.id === s.id));
      } catch (error) {
        filtered = filtered.filter(student => student.currentGrade === gradeFilter);
      }
    }

    setFilteredStudents(filtered);
  };

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const [guardianData, medicalData, academicData] = await Promise.all([
        studentApi.getStudentGuardians(student.id),
        studentApi.getStudentMedicalRecords(student.id),
        studentApi.getStudentAcademicRecords(student.id)
      ]);
      setGuardians(guardianData);
      setMedicalRecords(medicalData);
      setAcademicRecords(academicData);
    } catch (error) {
      console.error("Failed to load student details:", error);
      toast({
        title: "Error",
        description: "Failed to load student details",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await studentApi.deleteStudent(studentId);
      setStudents(students.filter(s => s.id !== studentId));
      toast({
        title: "Success",
        description: "Student archived successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive student",
        variant: "destructive",
      });
    }
  };

  const handleCreateStudent = async () => {
    // This would open a form modal in a real implementation
    toast({
      title: "Info",
      description: "Student creation form will be implemented",
    });
  };

  const handleEditStudent = async (student: Student) => {
    // This would open an edit form modal in a real implementation
    toast({
      title: "Info",
      description: "Student edit form will be implemented",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: "bg-green-500",
      INACTIVE: "bg-yellow-500",
      GRADUATED: "bg-blue-500",
      SUSPENDED: "bg-red-500"
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
              Manage student records and enrollment
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={handleCreateStudent}
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

        {/* Stats Cards - now clickable */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200 cursor-pointer hover:bg-[#252e3e] dark:hover:bg-gray-50 transition-colors">
            <CardContent className="p-4" onClick={() => setStatusFilter("ALL")}>
              <div className="text-2xl font-bold text-blue-400">{statusCounts.total}</div>
              <p className="text-sm text-gray-400">Total Students</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200 cursor-pointer hover:bg-[#252e3e] dark:hover:bg-gray-50 transition-colors">
            <CardContent className="p-4" onClick={() => setStatusFilter("ACTIVE")}>
              <div className="text-2xl font-bold text-green-400">{statusCounts.active}</div>
              <p className="text-sm text-gray-400">Active Enrollment</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200 cursor-pointer hover:bg-[#252e3e] dark:hover:bg-gray-50 transition-colors">
            <CardContent className="p-4" onClick={() => setStatusFilter("INACTIVE")}>
              <div className="text-2xl font-bold text-yellow-400">{statusCounts.inactive}</div>
              <p className="text-sm text-gray-400">Inactive</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200 cursor-pointer hover:bg-[#252e3e] dark:hover:bg-gray-50 transition-colors">
            <CardContent className="p-4" onClick={() => setStatusFilter("GRADUATED")}>
              <div className="text-2xl font-bold text-purple-400">{statusCounts.graduated}</div>
              <p className="text-sm text-gray-400">Graduated</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="directory">Student Directory</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment Tracking</TabsTrigger>
            <TabsTrigger value="academic">Academic History</TabsTrigger>
            <TabsTrigger value="guardians">Parent/Guardian</TabsTrigger>
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
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-300"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#252e3e] dark:bg-gray-50 border border-gray-700 dark:border-gray-300 rounded px-3 py-2"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="GRADUATED">Graduated</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="bg-[#252e3e] dark:bg-gray-50 border border-gray-700 dark:border-gray-300 rounded px-3 py-2"
                  >
                    <option value="ALL">All Grades</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
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
                                <p className="font-medium">{student.currentGrade} - {student.section}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Email:</span>
                                <p className="font-medium">{student.email}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Phone:</span>
                                <p className="font-medium">{student.phone}</p>
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
                              onClick={() => handleEditStudent(student)}
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
                  <UserPlus className="h-5 w-5" />
                  Enrollment Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Admission Applications</h3>
                    <div className="space-y-2">
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>New Applications</span>
                          <Badge className="bg-blue-500 text-white">15</Badge>
                        </div>
                      </div>
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Under Review</span>
                          <Badge className="bg-yellow-500 text-white">8</Badge>
                        </div>
                      </div>
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Approved</span>
                          <Badge className="bg-green-500 text-white">23</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Document Verification</h3>
                    <div className="space-y-2">
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Pending Verification</span>
                          <Badge className="bg-orange-500 text-white">12</Badge>
                        </div>
                      </div>
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Verified</span>
                          <Badge className="bg-green-500 text-white">34</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">
                        Academic Records - {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="space-y-3">
                        {academicRecords.map((record) => (
                          <div key={record.id} className="bg-[#1A1F2C] dark:bg-white p-3 rounded border border-gray-700 dark:border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Subject:</span>
                                <p className="font-medium">{record.subject}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Grade:</span>
                                <p className="font-medium">{record.grade}% ({record.letterGrade})</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Attendance:</span>
                                <p className="font-medium">{record.attendancePercentage}%</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Year:</span>
                                <p className="font-medium">{record.academicYear}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Semester:</span>
                                <p className="font-medium">{record.semester}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p>Select a student to view their academic history</p>
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
                  Parent/Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">
                        Guardians - {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="space-y-3">
                        {guardians.map((guardian) => (
                          <div key={guardian.id} className="bg-[#1A1F2C] dark:bg-white p-3 rounded border border-gray-700 dark:border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-1">
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
                                  <p className="font-medium">{guardian.email}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {guardian.isPrimary && (
                                  <Badge className="bg-blue-500 text-white">Primary</Badge>
                                )}
                                {guardian.isEmergencyContact && (
                                  <Badge className="bg-red-500 text-white">Emergency</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p>Select a student to view their guardian information</p>
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
                        Medical Records - {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="space-y-3">
                        {medicalRecords.map((record) => (
                          <div key={record.id} className="bg-[#1A1F2C] dark:bg-white p-3 rounded border border-gray-700 dark:border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Type:</span>
                                <p className="font-medium">{record.recordType}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Title:</span>
                                <p className="font-medium">{record.title}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Date:</span>
                                <p className="font-medium">{record.recordDate}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-gray-400">Description:</span>
                              <p className="font-medium">{record.description}</p>
                            </div>
                            {record.doctorName && (
                              <div className="mt-2">
                                <span className="text-gray-400">Doctor:</span>
                                <p className="font-medium">{record.doctorName}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p>Select a student to view their medical records</p>
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
