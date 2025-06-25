
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Calendar, BookOpen, GraduationCap, MessageSquare, FileText } from "lucide-react";

export default function StudentPortal() {
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
            <h1 className="text-2xl font-bold">Student Portal</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Access your academic information and resources
            </p>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-xl font-bold text-blue-400">Grade 12-A</div>
              <p className="text-sm text-gray-400">Current Class</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-xl font-bold text-green-400">95.6%</div>
              <p className="text-sm text-gray-400">Attendance</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-xl font-bold text-purple-400">3.8</div>
              <p className="text-sm text-gray-400">GPA</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="timetable" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="exams">Exam Schedule</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="communication">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="timetable">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Class Timetable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  <div className="font-semibold text-center py-2">Time</div>
                  <div className="font-semibold text-center py-2">Monday</div>
                  <div className="font-semibold text-center py-2">Tuesday</div>
                  <div className="font-semibold text-center py-2">Wednesday</div>
                  <div className="font-semibold text-center py-2">Thursday</div>
                  <div className="font-semibold text-center py-2">Friday</div>
                  <div className="font-semibold text-center py-2">Saturday</div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  <div className="text-center py-2 text-sm">8:00-9:00</div>
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-2 rounded text-sm text-center">Mathematics</div>
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-2 rounded text-sm text-center">Physics</div>
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-2 rounded text-sm text-center">Chemistry</div>
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-2 rounded text-sm text-center">Biology</div>
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-2 rounded text-sm text-center">English</div>
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-2 rounded text-sm text-center">Computer</div>
                </div>
                
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Complete timetable interface will be implemented here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upcoming Examinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded border-gray-700 dark:border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Mathematics Final Exam</h3>
                        <p className="text-sm text-gray-400">Date: March 15, 2024</p>
                        <p className="text-sm text-gray-400">Time: 9:00 AM - 12:00 PM</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-yellow-400">In 5 days</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded border-gray-700 dark:border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Physics Practical Exam</h3>
                        <p className="text-sm text-gray-400">Date: March 18, 2024</p>
                        <p className="text-sm text-gray-400">Time: 2:00 PM - 5:00 PM</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-yellow-400">In 8 days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold mb-2">Mid-Term Examination - 2024</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>Mathematics: <span className="font-semibold text-green-400">92%</span></div>
                      <div>Physics: <span className="font-semibold text-green-400">88%</span></div>
                      <div>Chemistry: <span className="font-semibold text-green-400">85%</span></div>
                      <div>Biology: <span className="font-semibold text-green-400">90%</span></div>
                      <div>English: <span className="font-semibold text-green-400">87%</span></div>
                      <div>Computer: <span className="font-semibold text-green-400">95%</span></div>
                    </div>
                    <div className="mt-2 text-sm">
                      Overall: <span className="font-semibold text-green-400">89.5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Library Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold mb-2">Currently Issued Books</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Advanced Mathematics - Vol 2</span>
                        <span className="text-yellow-400">Due: Mar 20</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Physics Fundamentals</span>
                        <span className="text-yellow-400">Due: Mar 25</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-4 text-gray-400 dark:text-gray-600">
                    <p>Digital library access and book search will be implemented here.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages & Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Parent-Teacher Meeting</h3>
                        <p className="text-sm text-gray-400">From: Principal Office</p>
                        <p className="text-sm mt-2">Reminder: Parent-Teacher meeting scheduled for March 22, 2024.</p>
                      </div>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Assignment Submission</h3>
                        <p className="text-sm text-gray-400">From: Mathematics Teacher</p>
                        <p className="text-sm mt-2">Please submit your calculus assignment by March 15, 2024.</p>
                      </div>
                      <span className="text-xs text-gray-500">1 week ago</span>
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
