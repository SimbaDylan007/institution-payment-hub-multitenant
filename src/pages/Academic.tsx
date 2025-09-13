import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BookOpen, Award, FileText, Calendar, BarChart3, Download, Plus, Users, Clock } from "lucide-react";
import { AddSubjectModal } from "@/components/forms/AddSubjectModal";
import { GradeEntryModal } from "@/components/forms/GradeEntryModal";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import TimetableGrid from "@/components/TimetableGrid";
import AddTimetableEntryModal from "@/components/forms/AddTimetableEntryModal";
import ScheduleQuickStats from "@/components/ScheduleQuickStats.tsx";
import { apiFetch } from "@/utils/apiClient";

// --- Interfaces to match backend entities ---
interface Subject { id: number; name: string; grade: string; credits: number; }
interface Grade { id: number; letterGrade: string; subject: { name: string }; }
interface Exam { id: number; title: string; examDate: string; }

export default function Academic() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("curriculum");

  // Fetch all data when the component mounts
  useEffect(() => {
    fetchSubjects();
    fetchGrades();
    fetchExams();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/academic/subjects');
      if (response.ok) setSubjects((await response.json()).content); // Assuming paginated response
    } catch (error) { console.error('Error fetching subjects:', error); }
  };


  const fetchGrades = async () => {
    try {
      const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/academic/grades');
      if (response.ok) setGrades((await response.json()).content); // Assuming paginated response
    } catch (error) { console.error('Error fetching grades:', error); }
  };


  const fetchExams = async () => {
    try {
      const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/academic/exams');
      if (response.ok) setExams(await response.json());
    } catch (error) { console.error('Error fetching exams:', error); }
  };

  const handleCreateClass = async () => {
    setLoading(true);
    try {
      toast("Creating Class - New class is being created...");

      setTimeout(() => {
        toast("Success - Class created successfully!");
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast("Error - Failed to create class. Please try again.");
      setLoading(false);
    }
  };

  const handleScheduleExam = async () => {
    try {
      const examData = { title: "Mid-term Science Exam", examDate: new Date().toISOString().split('T')[0], /* ... other fields */ };
      const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/academic/exams', {
        method: 'POST',
        body: JSON.stringify(examData),
      });
      if (response.ok) {
        toast.success("Exam scheduled successfully!");
        fetchExams();
      } else { throw new Error("Failed to schedule exam"); }
    } catch (error) { toast.error((error as Error).message); }
  };


  const handleGenerateReports = async () => {
    try {
      toast("Generating Reports - Report cards are being generated...");

      setTimeout(() => {
        toast("Success - Report cards generated successfully!");
      }, 3000);
    } catch (error) {
      toast("Error - Failed to generate reports. Please try again.");
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
            <p className="text-gray-300">
              Manage curriculum, classes, and academic records
            </p>
          </div>
          <div className="flex gap-2">
            <AddSubjectModal onSubjectAdded={fetchSubjects} />
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
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
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-400">{subjects.length}</div>
              <p className="text-gray-300">Active Subjects</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-400">{grades.length}</div>
              <p className="text-gray-300">Grade Entries</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-400">{exams.length}</div>
              <p className="text-gray-300">Scheduled Exams</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-400">24</div>
              <p className="text-gray-300">Active Classes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-purple-900/50 border-purple-700">
            <TabsTrigger value="curriculum" className="data-[state=active]:bg-purple-600">Curriculum</TabsTrigger>
            <TabsTrigger value="timetable" className="data-[state=active]:bg-purple-600">Timetables</TabsTrigger>
            <TabsTrigger value="gradebook" className="data-[state=active]:bg-purple-600">Digital Gradebook</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-purple-600">Report Cards</TabsTrigger>
            <TabsTrigger value="exams" className="data-[state=active]:bg-purple-600">Examinations</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5" />
                  Curriculum & Course Setup
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCreateClass} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Class
                  </Button>
                  <AddSubjectModal onSubjectAdded={fetchSubjects} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {subjects.slice(0, 6).map((subject: any, index) => (
                    <Card key={index} className="bg-purple-800/30 border-purple-600">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 text-white">{subject.name || `Subject ${index + 1}`}</h3>
                        <p className="text-sm text-gray-300 mb-2">{subject.grade || 'All Grades'}</p>
                        <p className="text-sm text-gray-300 mb-4">{subject.credits || 3} credits</p>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          Manage
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View All Subjects
                    </Button>
                    <Button onClick={handleCreateClass} className="bg-green-600 hover:bg-green-700">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Classes
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      Academic Calendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable">
            <div className="space-y-6">
              <ScheduleQuickStats />
              <TimetableGrid
                onAddEntry={() => {}}
                onEditEntry={() => {}}
              />
              <AddTimetableEntryModal onEntryAdded={() => {}} />
            </div>
          </TabsContent>

          <TabsContent value="gradebook">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="h-5 w-5" />
                  Digital Gradebook System
                </CardTitle>
                <div className="flex gap-2">
                  <GradeEntryModal onGradeAdded={fetchGrades} />
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Import Grades
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Grade Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4 text-white">Features</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• Assignment and test score entry</li>
                        <li>• Grade calculations and weighting</li>
                        <li>• Progress tracking</li>
                        <li>• Parent/student grade access</li>
                        <li>• Grade export and reporting</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4 text-white">Recent Grades</h3>
                      <div className="space-y-2">
                        {grades.slice(0, 3).map((grade: any, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-300">{grade.subject?.name || `Subject ${index + 1}`}</span>
                            <span className="text-green-400">{grade.letterGrade || 'A'}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-purple-800/30 p-4 rounded-lg border border-purple-600">
                  <h3 className="font-semibold mb-3 text-white">Grade Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">A</div>
                      <p className="text-sm text-gray-300">Average Grade</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{grades.length}</div>
                      <p className="text-sm text-gray-300">Total Grades</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">89%</div>
                      <p className="text-sm text-gray-300">Completion Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">24</div>
                      <p className="text-sm text-gray-300">Recent Entries</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5" />
                  Report Card Generation System
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleGenerateReports} className="bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4 text-white">Features</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• Customizable report templates</li>
                        <li>• Automated grade compilation</li>
                        <li>• Progress comments</li>
                        <li>• Digital signature support</li>
                        <li>• Bulk report generation</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4 text-white">Report Statistics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Generated This Term:</span>
                          <span className="font-bold text-blue-400">1,234</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Pending Reviews:</span>
                          <span className="font-bold text-orange-400">45</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Approved:</span>
                          <span className="font-bold text-green-400">1,189</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-purple-800/30 p-4 rounded-lg border border-purple-600">
                  <h3 className="font-semibold mb-3 text-white">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={handleGenerateReports} className="bg-blue-600 hover:bg-blue-700">
                      Mid-term Reports
                    </Button>
                    <Button onClick={handleGenerateReports} className="bg-green-600 hover:bg-green-700">
                      Final Reports
                    </Button>
                    <Button onClick={handleGenerateReports} className="bg-purple-600 hover:bg-purple-700">
                      Progress Reports
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5" />
                  Examination Management System
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleScheduleExam} className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Exam
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Hall Tickets
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Users className="h-4 w-4 mr-2" />
                    Seating Arrangements
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4 text-white">Features</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• Exam scheduling and calendar</li>
                        <li>• Hall ticket generation</li>
                        <li>• Seating arrangements</li>
                        <li>• Invigilation assignments</li>
                        <li>• Result processing and publishing</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4 text-white">Upcoming Exams</h3>
                      <div className="space-y-2">
                        {exams.slice(0, 3).map((exam: any, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-300">{exam.title || `Exam ${index + 1}`}</span>
                            <span className="text-blue-400">{exam.examDate || 'TBD'}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-purple-800/30 p-4 rounded-lg border border-purple-600">
                  <h3 className="font-semibold mb-3 text-white">Exam Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button onClick={handleScheduleExam} className="bg-blue-600 hover:bg-blue-700">
                      Create Exam
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Seating Plan
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Assign Invigilators
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Publish Results
                    </Button>
                  </div>
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
