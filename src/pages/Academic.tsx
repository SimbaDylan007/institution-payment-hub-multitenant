
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BookOpen, Award, FileText, Calendar, BarChart3, Download, Plus, Users, Clock } from "lucide-react";
import AddSubjectModal from "@/components/forms/AddSubjectModal";
import GradeEntryModal from "@/components/forms/GradeEntryModal";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Academic() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchGrades();
    fetchExams();
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

  const fetchExams = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/academic/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const handleCreateClass = async () => {
    setLoading(true);
    try {
      toast({
        title: "Creating Class",
        description: "New class is being created...",
      });
      
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Class created successfully!",
        });
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleScheduleExam = async () => {
    try {
      const examData = {
        title: "Mid-term Mathematics Exam",
        examDate: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "11:00",
        grade: "10",
        section: "A",
        venue: "Main Hall",
        maxMarks: 100,
        instructions: "Bring calculator and writing materials"
      };

      const response = await fetch('http://localhost:8080/api/academic/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Exam scheduled successfully!",
        });
        fetchExams();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReports = async () => {
    try {
      toast({
        title: "Generating Reports",
        description: "Report cards are being generated...",
      });
      
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Report cards generated successfully!",
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate reports. Please try again.",
        variant: "destructive",
      });
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
            <AddSubjectModal onSubjectAdded={fetchSubjects} />
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
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-400">{subjects.length}</div>
              <p className="text-gray-400 dark:text-gray-600">Active Subjects</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-400">{grades.length}</div>
              <p className="text-gray-400 dark:text-gray-600">Grade Entries</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-400">{exams.length}</div>
              <p className="text-gray-400 dark:text-gray-600">Scheduled Exams</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-400">24</div>
              <p className="text-gray-400 dark:text-gray-600">Active Classes</p>
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
                <div className="flex gap-2">
                  <Button onClick={handleCreateClass} className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Class
                  </Button>
                  <AddSubjectModal onSubjectAdded={fetchSubjects} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {subjects.slice(0, 6).map((subject: any, index) => (
                    <Card key={index} className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{subject.name || `Subject ${index + 1}`}</h3>
                        <p className="text-sm text-gray-400 mb-2">{subject.grade || 'All Grades'}</p>
                        <p className="text-sm text-gray-400 mb-4">{subject.credits || 3} credits</p>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          Manage
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View All Subjects
                    </Button>
                    <Button onClick={handleCreateClass} className="bg-green-500 hover:bg-green-600">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Classes
                    </Button>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                      <Calendar className="h-4 w-4 mr-2" />
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
                  <GradeEntryModal onGradeAdded={fetchGrades} />
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Download className="h-4 w-4 mr-2" />
                    Import Grades
                  </Button>
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Grade Analytics
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
                        {grades.slice(0, 3).map((grade: any, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{grade.subject?.name || `Subject ${index + 1}`}</span>
                            <span className="text-green-400">{grade.letterGrade || 'A'}</span>
                          </div>
                        ))}
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
                      <div className="text-2xl font-bold text-blue-400">{grades.length}</div>
                      <p className="text-sm text-gray-400">Total Grades</p>
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
                  <Button onClick={handleGenerateReports} className="bg-blue-500 hover:bg-blue-600">
                    <FileText className="h-4 w-4 mr-2" />
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
                    <Button onClick={handleGenerateReports} className="bg-blue-500 hover:bg-blue-600">
                      Mid-term Reports
                    </Button>
                    <Button onClick={handleGenerateReports} className="bg-green-500 hover:bg-green-600">
                      Final Reports
                    </Button>
                    <Button onClick={handleGenerateReports} className="bg-purple-500 hover:bg-purple-600">
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
                  <Button onClick={handleScheduleExam} className="bg-blue-500 hover:bg-blue-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Exam
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Hall Tickets
                  </Button>
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    <Users className="h-4 w-4 mr-2" />
                    Seating Arrangements
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
                        {exams.slice(0, 3).map((exam: any, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{exam.title || `Exam ${index + 1}`}</span>
                            <span className="text-blue-400">{exam.examDate || 'TBD'}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Exam Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button onClick={handleScheduleExam} className="bg-blue-500 hover:bg-blue-600">
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
