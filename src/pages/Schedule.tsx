import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Calendar, Clock, Plus, Users, Bell, MapPin } from "lucide-react";
import AddEventModal from "@/components/forms/AddEventModal";
import TimetableGrid from "@/components/TimetableGrid";
import AddTimetableEntryModal from "@/components/forms/AddTimetableEntryModal";
import TimetableQuickStats from "@/components/TimetableQuickStats";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Schedule() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/events/${eventId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Event deleted successfully');
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleExamAction = async (action: string) => {
    try {
      let endpoint = '';
      let method = 'POST';
      let body = {};

      switch (action) {
        case 'schedule':
          endpoint = '/api/exams';
          body = {
            title: 'New Exam',
            grade: '10',
            examDate: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '12:00',
            venue: 'Main Hall',
            examType: 'MIDTERM',
            maxMarks: 100
          };
          break;
        case 'hall-tickets':
          endpoint = '/api/exams/generate-hall-tickets';
          body = { examIds: [], generateAll: true };
          break;
        case 'seating':
          endpoint = '/api/exams/seating-arrangements';
          body = { examId: 1, hallId: 1 };
          break;
      }

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(`${action.replace('-', ' ')} completed successfully`);
      } else {
        throw new Error('Failed to complete action');
      }
    } catch (error) {
      console.error(`Error with ${action}:`, error);
      toast.error(`Failed to ${action.replace('-', ' ')}`);
    }
  };

  const handleCalendarAction = async (action: string) => {
    try {
      let endpoint = '';
      let method = 'GET';
      let body = {};

      switch (action) {
        case 'view':
          endpoint = '/api/calendar/view';
          break;
        case 'holiday':
          endpoint = '/api/calendar/holidays';
          method = 'POST';
          body = {
            name: 'New Holiday',
            date: new Date().toISOString().split('T')[0],
            type: 'HOLIDAY'
          };
          break;
        case 'term-dates':
          endpoint = '/api/calendar/term-dates';
          method = 'POST';
          body = {
            termName: 'New Term',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
          break;
      }

      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`http://localhost:8080${endpoint}`, options);

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || `${action} completed successfully`);
        if (action === 'view') {
          console.log('Calendar data:', result);
        }
      } else {
        throw new Error('Failed to complete action');
      }
    } catch (error) {
      console.error(`Error with ${action}:`, error);
      toast.error(`Failed to ${action}`);
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
            <h1 className="text-2xl font-bold">Schedule Management</h1>
            <p className="text-gray-300">
              Manage timetables, events, and scheduling
            </p>
          </div>
          <div className="flex gap-2">
            <AddEventModal />
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

        <Tabs defaultValue="timetable" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-purple-900/50 border-purple-700">
            <TabsTrigger value="timetable" className="data-[state=active]:bg-purple-600">Class Timetable</TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600">School Events</TabsTrigger>
            <TabsTrigger value="exams" className="data-[state=active]:bg-purple-600">Exam Schedule</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-600">Academic Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="timetable">
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5" />
                    Class Timetable Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimetableQuickStats />
                  <TimetableGrid 
                    onAddEntry={() => {}} 
                    onEditEntry={() => {}}
                  />
                  <div className="mt-4">
                    <AddTimetableEntryModal onEntryAdded={() => {}} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5" />
                  School Events Management
                </CardTitle>
                <div className="flex gap-2">
                  <AddEventModal />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-400">{events.length}</div>
                      <p className="text-sm text-gray-300">Total Events</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-400">
                        {events.filter((e: any) => new Date(e.eventDate) >= new Date()).length}
                      </div>
                      <p className="text-sm text-gray-300">Upcoming Events</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-400">
                        {events.filter((e: any) => new Date(e.eventDate).getMonth() === new Date().getMonth()).length}
                      </div>
                      <p className="text-sm text-gray-300">This Month</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-purple-800/30 p-4 rounded-lg border border-purple-600">
                  <h3 className="font-semibold mb-3 text-white">Upcoming Events</h3>
                  <div className="space-y-2">
                    {events.slice(0, 5).map((event: any) => (
                      <div key={event.id} className="flex justify-between items-center p-3 bg-purple-700/30 rounded border border-purple-600">
                        <div>
                          <span className="font-medium text-white">{event.title}</span>
                          <p className="text-sm text-gray-300">{new Date(event.eventDate).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-400">{event.venue}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-purple-600 text-white hover:bg-purple-700">
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5" />
                  Examination Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-300">
                  <p className="mb-6">Examination scheduling system with automated hall ticket generation.</p>
                  <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleExamAction('schedule')}
                    >
                      Schedule New Exam
                    </Button>
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => handleExamAction('hall-tickets')}
                    >
                      Generate Hall Tickets
                    </Button>
                    <Button 
                      className="w-full bg-purple-500 hover:bg-purple-600"
                      onClick={() => handleExamAction('seating')}
                    >
                      Seating Arrangements
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white">Academic Calendar Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-300">
                  <p className="mb-6">Comprehensive academic calendar with term dates, holidays, and important deadlines.</p>
                  <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleCalendarAction('view')}
                    >
                      View Calendar
                    </Button>
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => handleCalendarAction('holiday')}
                    >
                      Add Holiday
                    </Button>
                    <Button 
                      className="w-full bg-purple-500 hover:bg-purple-600"
                      onClick={() => handleCalendarAction('term-dates')}
                    >
                      Set Term Dates
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
