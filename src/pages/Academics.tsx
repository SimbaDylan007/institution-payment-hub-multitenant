
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, GraduationCap, BookOpen, Calendar, FileText, Plus } from "lucide-react";

export default function Academics() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#121828] text-white dark:bg-gray-100 dark:text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Academic Management</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage curriculum, classes, and academic records
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-green-500 text-white hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
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
              <div className="text-2xl font-bold text-blue-400">42</div>
              <p className="text-sm text-gray-400">Active Classes</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">18</div>
              <p className="text-sm text-gray-400">Subjects</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">89</div>
              <p className="text-sm text-gray-400">Teachers</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-400">156</div>
              <p className="text-sm text-gray-400">Assignments</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="curriculum" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
            <TabsTrigger value="reports">Report Cards</TabsTrigger>
            <TabsTrigger value="exams">Examinations</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Curriculum & Course Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Mathematics</h3>
                      <p className="text-sm text-gray-400">Grades 1-12</p>
                      <p className="text-xs text-gray-500">8 classes, 45 students</p>
                      <Button size="sm" className="mt-2 w-full">Manage</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Science</h3>
                      <p className="text-sm text-gray-400">Grades 1-12</p>
                      <p className="text-xs text-gray-500">6 classes, 36 students</p>
                      <Button size="sm" className="mt-2 w-full">Manage</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">English</h3>
                      <p className="text-sm text-gray-400">Grades 1-12</p>
                      <p className="text-xs text-gray-500">10 classes, 62 students</p>
                      <Button size="sm" className="mt-2 w-full">Manage</Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center py-4 text-gray-400 dark:text-gray-600">
                  <p>Complete curriculum management will be implemented here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Class Scheduling & Timetables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Grade 12-A</h3>
                      <p className="text-sm text-gray-400">Homeroom: Ms. Johnson</p>
                      <p className="text-xs text-gray-500">32 students</p>
                      <div className="mt-2 text-xs space-y-1">
                        <p>📅 Mon-Fri, 8:00 AM - 3:00 PM</p>
                        <p>🏫 Room 201</p>
                      </div>
                      <Button size="sm" className="mt-2 w-full">View Timetable</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">Grade 11-B</h3>
                      <p className="text-sm text-gray-400">Homeroom: Mr. Chen</p>
                      <p className="text-xs text-gray-500">28 students</p>
                      <div className="mt-2 text-xs space-y-1">
                        <p>📅 Mon-Fri, 8:00 AM - 3:00 PM</p>
                        <p>🏫 Room 105</p>
                      </div>
                      <Button size="sm" className="mt-2 w-full">View Timetable</Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center py-4 text-gray-400 dark:text-gray-600">
                  <p>Advanced timetabling system will be implemented here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gradebook">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Gradebook & Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Digital gradebook system will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Assignment and test score entry</li>
                    <li>• Grade calculations and weighting</li>
                    <li>• Progress tracking</li>
                    <li>• Parent/student grade access</li>
                    <li>• Grade export and reporting</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Card Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Report card generation system will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Customizable report templates</li>
                    <li>• Automated grade compilation</li>
                    <li>• Progress comments</li>
                    <li>• Digital signature support</li>
                    <li>• Bulk report generation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Examination Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Examination management system will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Exam scheduling and calendar</li>
                    <li>• Hall ticket generation</li>
                    <li>• Seating arrangements</li>
                    <li>• Invigilation assignments</li>
                    <li>• Result processing and publishing</li>
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
