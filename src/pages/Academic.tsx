
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Home, BookOpen, Calendar, FileText, Plus, Users, GraduationCap, ClipboardCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllSubjects,
  getSubjectsByGrade,
  createSubject,
  getTimetableByClass,
  createTimetableEntry,
  getStudentGrades,
  addGrade,
  getExamsByClass,
  getUpcomingExams,
  scheduleExam
} from "@/services/academicApiService";

export default function Academic() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAcademicData();
  }, []);

  const loadAcademicData = async () => {
    setIsLoading(true);
    try {
      const [subjectsData, upcomingExamsData] = await Promise.all([
        getAllSubjects(),
        getUpcomingExams()
      ]);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setExams(Array.isArray(upcomingExamsData) ? upcomingExamsData : []);
    } catch (error) {
      console.error("Error loading academic data:", error);
      toast({
        title: "Error",
        description: "Failed to load academic data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              Manage curriculum, assessments, and academic records
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

        <Tabs defaultValue="gradebook" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gradebook">Digital Gradebook</TabsTrigger>
            <TabsTrigger value="reports">Report Cards</TabsTrigger>
            <TabsTrigger value="exams">Examinations</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          </TabsList>

          <TabsContent value="gradebook">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Digital Gradebook System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Assignment and test score entry
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Grade calculations and weighting
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Progress tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Parent/student grade access
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Grade export and reporting
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          Enter Grades
                        </Button>
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          View Progress Reports
                        </Button>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          Export Grades
                        </Button>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          Grade Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Recent Grade Entries</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <span>Mathematics - Grade 10 - Unit Test</span>
                      <Badge className="bg-green-500 text-white">85 avg</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <span>Science - Grade 9 - Lab Report</span>
                      <Badge className="bg-blue-500 text-white">92 avg</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <span>English - Grade 11 - Essay</span>
                      <Badge className="bg-purple-500 text-white">78 avg</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Card Generation System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Customizable report templates
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Automated grade compilation
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Progress comments
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Digital signature support
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Bulk report generation
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Report Actions</h3>
                      <div className="space-y-2">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          Generate Reports
                        </Button>
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          Preview Templates
                        </Button>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          Bulk Generation
                        </Button>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          Distribution List
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Examination Management System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Exam scheduling and calendar
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Hall ticket generation
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Seating arrangements
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Invigilation assignments
                        </li>
                        <li className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-green-400" />
                          Result processing and publishing
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Exam Management</h3>
                      <div className="space-y-2">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          Schedule Exam
                        </Button>
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          Generate Hall Tickets
                        </Button>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          Seating Plan
                        </Button>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          Publish Results
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Upcoming Examinations</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <span>Mid-term Mathematics - Grade 10</span>
                      <Badge className="bg-blue-500 text-white">March 15</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <span>Science Practical - Grade 11</span>
                      <Badge className="bg-green-500 text-white">March 18</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <span>English Literature - Grade 12</span>
                      <Badge className="bg-purple-500 text-white">March 20</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Curriculum Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-400">42</div>
                      <p className="text-sm text-gray-400">Total Subjects</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-400">12</div>
                      <p className="text-sm text-gray-400">Grade Levels</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-400">156</div>
                      <p className="text-sm text-gray-400">Learning Units</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Subject Management</h3>
                    <Button className="bg-green-500 hover:bg-green-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subject
                    </Button>
                  </div>
                  
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                        <span>Mathematics - All Grades</span>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-500 text-white">Core</Badge>
                          <Button size="sm" variant="outline">Manage</Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                        <span>Science - Grades 6-12</span>
                        <div className="flex gap-2">
                          <Badge className="bg-green-500 text-white">Core</Badge>
                          <Button size="sm" variant="outline">Manage</Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                        <span>Physical Education - All Grades</span>
                        <div className="flex gap-2">
                          <Badge className="bg-orange-500 text-white">Elective</Badge>
                          <Button size="sm" variant="outline">Manage</Button>
                        </div>
                      </div>
                    </div>
                  </div>
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
