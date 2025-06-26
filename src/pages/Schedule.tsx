import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Calendar, Clock, Plus, Users, Bell, MapPin } from "lucide-react";
import AddEventModal from "@/components/forms/AddEventModal";

export default function Schedule() {
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
            <h1 className="text-2xl font-bold">Schedule Management</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage timetables, events, and scheduling
            </p>
          </div>
          <div className="flex gap-2">
            <AddEventModal />
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

        <Tabs defaultValue="timetable" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timetable">Class Timetable</TabsTrigger>
            <TabsTrigger value="events">School Events</TabsTrigger>
            <TabsTrigger value="exams">Exam Schedule</TabsTrigger>
            <TabsTrigger value="calendar">Academic Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="timetable">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Class Timetable Management
                </CardTitle>
                <div className="flex gap-2">
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    View Timetable
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Period
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Weekly timetable grid</li>
                        <li>• Subject and teacher assignments</li>
                        <li>• Room allocation</li>
                        <li>• Conflict detection</li>
                        <li>• Substitution management</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Quick Stats</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Classes:</span>
                          <span className="font-bold text-blue-400">42</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Periods:</span>
                          <span className="font-bold text-green-400">336</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conflicts:</span>
                          <span className="font-bold text-red-400">2</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Weekly Timetable Grid</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-600 dark:border-gray-300">
                          <th className="p-2 text-left">Time</th>
                          <th className="p-2 text-left">Monday</th>
                          <th className="p-2 text-left">Tuesday</th>
                          <th className="p-2 text-left">Wednesday</th>
                          <th className="p-2 text-left">Thursday</th>
                          <th className="p-2 text-left">Friday</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-700 dark:border-gray-200">
                          <td className="p-2">8:00-9:00</td>
                          <td className="p-2">Math - Room 101</td>
                          <td className="p-2">Science - Lab A</td>
                          <td className="p-2">English - Room 205</td>
                          <td className="p-2">History - Room 301</td>
                          <td className="p-2">PE - Gym</td>
                        </tr>
                        <tr className="border-b border-gray-700 dark:border-gray-200">
                          <td className="p-2">9:00-10:00</td>
                          <td className="p-2">Science - Lab B</td>
                          <td className="p-2">Math - Room 102</td>
                          <td className="p-2">Art - Studio</td>
                          <td className="p-2">English - Room 206</td>
                          <td className="p-2">Music - Hall</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  School Events Management
                </CardTitle>
                <div className="flex gap-2">
                  <AddEventModal />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-400">24</div>
                      <p className="text-sm text-gray-400">Upcoming Events</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-400">8</div>
                      <p className="text-sm text-gray-400">This Month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-400">156</div>
                      <p className="text-sm text-gray-400">Total This Year</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Upcoming Events</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <div>
                        <span className="font-medium">Science Fair</span>
                        <p className="text-sm text-gray-400">March 15, 2024</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm text-blue-400">Auditorium</span>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-[#1A1F2C] dark:bg-white rounded">
                      <div>
                        <span className="font-medium">Parent-Teacher Conference</span>
                        <p className="text-sm text-gray-400">March 20, 2024</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm text-green-400">Classrooms</span>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Examination Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Examination scheduling system with automated hall ticket generation.</p>
                  <div className="mt-4 space-y-2">
                    <Button className="w-full max-w-xs bg-blue-500 hover:bg-blue-600">
                      Schedule New Exam
                    </Button>
                    <Button className="w-full max-w-xs bg-green-500 hover:bg-green-600">
                      Generate Hall Tickets
                    </Button>
                    <Button className="w-full max-w-xs bg-purple-500 hover:bg-purple-600">
                      Seating Arrangements
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle>Academic Calendar Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Comprehensive academic calendar with term dates, holidays, and important deadlines.</p>
                  <div className="mt-4 space-y-2">
                    <Button className="w-full max-w-xs bg-blue-500 hover:bg-blue-600">
                      View Calendar
                    </Button>
                    <Button className="w-full max-w-xs bg-green-500 hover:bg-green-600">
                      Add Holiday
                    </Button>
                    <Button className="w-full max-w-xs bg-purple-500 hover:bg-purple-600">
                      Set Term Dates
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
