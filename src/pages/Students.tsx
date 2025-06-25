
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Plus, Search, Filter, Users, GraduationCap, Heart } from "lucide-react";

export default function Students() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const mockStudents = [
    {
      id: "R000258G",
      name: "John Smith",
      class: "Grade 12-A",
      rollNumber: "2024001",
      email: "john.smith@student.school.edu",
      phone: "+1 234-567-8901",
      status: "Active",
      parentName: "Robert Smith",
      parentPhone: "+1 234-567-8900"
    },
    {
      id: "R000259G", 
      name: "Emma Johnson",
      class: "Grade 11-B",
      rollNumber: "2024002",
      email: "emma.johnson@student.school.edu",
      phone: "+1 234-567-8902",
      status: "Active",
      parentName: "Mary Johnson",
      parentPhone: "+1 234-567-8903"
    },
    {
      id: "R000260G",
      name: "Michael Brown",
      class: "Grade 10-A",
      rollNumber: "2024003",
      email: "michael.brown@student.school.edu",
      phone: "+1 234-567-8904",
      status: "Active", 
      parentName: "David Brown",
      parentPhone: "+1 234-567-8905"
    }
  ];

  return (
    <div className="min-h-screen bg-[#121828] text-white dark:bg-gray-100 dark:text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage student information, enrollment, and records
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              asChild
            >
              <Link to="/student-management" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Student
              </Link>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">1,247</div>
              <p className="text-sm text-gray-400">Total Students</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">1,198</div>
              <p className="text-sm text-gray-400">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">34</div>
              <p className="text-sm text-gray-400">New Admissions</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">15</div>
              <p className="text-sm text-gray-400">Graduated</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="directory">Student Directory</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="academic">Academic Records</TabsTrigger>
            <TabsTrigger value="parents">Parent Info</TabsTrigger>
            <TabsTrigger value="medical">Medical Records</TabsTrigger>
          </TabsList>

          <TabsContent value="directory">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Student Directory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockStudents.map((student) => (
                        <div key={student.id} className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded border-gray-700 dark:border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{student.name}</h3>
                              <p className="text-gray-400 dark:text-gray-600">{student.class}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">Roll: {student.rollNumber} | ID: {student.id}</p>
                              <div className="mt-2 space-y-1 text-sm">
                                <p>📧 {student.email}</p>
                                <p>📞 {student.phone}</p>
                                <p>👨‍👩‍👧‍👦 {student.parentName} ({student.parentPhone})</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-1 rounded text-xs bg-green-500 text-white">
                                {student.status}
                              </span>
                              <div className="mt-2 space-x-2">
                                <Button size="sm" variant="outline">Edit</Button>
                                <Button size="sm" variant="outline">View</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Quick Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      All Students
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Active Enrollment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      By Grade Level
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Recent Admissions
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Graduated
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="enrollment">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Enrollment Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Enrollment tracking system will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Admission applications</li>
                    <li>• Enrollment status tracking</li>
                    <li>• Document verification</li>
                    <li>• Fee payment status</li>
                    <li>• Class assignment</li>
                  </ul>
                </div>
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
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Academic history tracking will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Grade history</li>
                    <li>• Exam results</li>
                    <li>• Attendance records</li>
                    <li>• Assignment submissions</li>
                    <li>• Progress reports</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parents">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parent/Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Parent/Guardian management will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Contact information</li>
                    <li>• Emergency contacts</li>
                    <li>• Communication preferences</li>
                    <li>• Meeting schedules</li>
                    <li>• Authorization records</li>
                  </ul>
                </div>
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
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Medical records management will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Health information</li>
                    <li>• Vaccination records</li>
                    <li>• Allergies and medications</li>
                    <li>• Emergency medical info</li>
                    <li>• Health checkup reports</li>
                  </ul>
                </div>
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
