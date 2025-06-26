
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BookOpen, Award, FileText, Calendar, BarChart3, Download } from "lucide-react";
import AddSubjectModal from "@/components/forms/AddSubjectModal";
import GradeEntryModal from "@/components/forms/GradeEntryModal";
import { useState, useEffect } from "react";

export default function Academic() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchSubjects();
    fetchGrades();
    fetchExams();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/academic/subjects');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setSubjects(data);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/academic/grades');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setGrades(data);
        }
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/academic/exams');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setExams(data);
        }
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
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
              Manage curriculum, classes, and academic records
            </p>
          </div>
          <div className="flex gap-2">
            <AddSubjectModal />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-400">{subjects.length}</div>
              <p className="text-gray-400 dark:text-gray-600">Active Classes</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-400">{subjects.filter((s: any) => s.isActive).length}</div>
              <p className="text-gray-400 dark:text-gray-600">Subjects</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="curriculum" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="gradebook">Digital Gradebook</TabsTrigger>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Mathematics</h3>
                      <p className="text-sm text-gray-400 mb-2">Grades 1-12</p>
                      <p className="text-sm text-gray-400 mb-4">8 classes, 45 students</p>
                      <Button className="w-full bg-purple-500 hover:bg-purple-600">
                        Manage
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Science</h3>
                      <p className="text-sm text-gray-400 mb-2">Grades 1-12</p>
                      <p className="text-sm text-gray-400 mb-4">6 classes, 35 students</p>
                      <Button className="w-full bg-purple-500 hover:bg-purple-600">
                        Manage
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center mt-6">
                  <p className="text-gray-400 dark:text-gray-600 mb-4">Complete curriculum management system</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      View All Subjects
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600">
                      Manage Classes
                    </Button>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                      Academic Calendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gradebook">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Digital Gradebook System
                </CardTitle>
                <div className="flex gap-2">
                  <GradeEntryModal />
                  <Button className="bg-green-500 hover:bg-green-600">
                    Import Grades
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Assignment and test score entry</li>
                        <li>• Grade calculations and weighting</li>
                        <li>• Progress tracking</li>
                        <li>• Parent/student grade access</li>
                        <li>• Grade export and reporting</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Recent Grades</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Math Test - Grade 10</span>
                          <span className="text-green-400">85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Science Quiz - Grade 9</span>
                          <span className="text-blue-400">92%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>English Essay - Grade 11</span>
                          <span className="text-purple-400">78%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Grade Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">A</div>
                      <p className="text-sm text-gray-400">Average Grade</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">156</div>
                      <p className="text-sm text-gray-400">Assignments</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">89%</div>
                      <p className="text-sm text-gray-400">Completion Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">24</div>
                      <p className="text-sm text-gray-400">Recent Entries</p>
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
                <div className="flex gap-2">
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    Generate Reports
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Customizable report templates</li>
                        <li>• Automated grade compilation</li>
                        <li>• Progress comments</li>
                        <li>• Digital signature support</li>
                        <li>• Bulk report generation</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Report Statistics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Generated This Term:</span>
                          <span className="font-bold text-blue-400">1,234</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending Reviews:</span>
                          <span className="font-bold text-orange-400">45</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Approved:</span>
                          <span className="font-bold text-green-400">1,189</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      Mid-term Reports
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600">
                      Final Reports
                    </Button>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                      Progress Reports
                    </Button>
                  </div>
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
                <div className="flex gap-2">
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    Schedule Exam
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600">
                    Generate Hall Tickets
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Exam scheduling and calendar</li>
                        <li>• Hall ticket generation</li>
                        <li>• Seating arrangements</li>
                        <li>• Invigilation assignments</li>
                        <li>• Result processing and publishing</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Upcoming Exams</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Mid-term Math</span>
                          <span className="text-blue-400">Mar 15</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Science Test</span>
                          <span className="text-green-400">Mar 18</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Final English</span>
                          <span className="text-purple-400">Mar 22</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Exam Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      Create Exam
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600">
                      Seating Plan
                    </Button>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                      Assign Invigilators
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      Publish Results
                    </Button>
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
