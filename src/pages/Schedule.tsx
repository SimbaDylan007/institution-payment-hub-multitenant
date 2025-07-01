
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Home, Calendar, Clock, Plus, Users, Bell, MapPin, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface TimetableEntry {
  id: number;
  subject: string;
  teacher: { username: string };
  grade: string;
  section: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  academicYear: string;
}

interface Exam {
  id: number;
  title: string;
  subject: { name: string };
  examDate: string;
  startTime: string;
  endTime: string;
  grade: string;
  venue: string;
  examType: string;
  status: string;
}

interface CalendarEvent {
  id: number;
  name: string;
  date: string;
  type: string;
}

export default function Schedule() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [calendar, setCalendar] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<TimetableEntry | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isTimetableDialogOpen, setIsTimetableDialogOpen] = useState(false);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchTimetables();
    fetchExams();
    fetchCalendar();
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

  const fetchTimetables = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/timetables');
      if (response.ok) {
        const data = await response.json();
        setTimetables(data);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchCalendar = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/calendar/view');
      if (response.ok) {
        const data = await response.json();
        setCalendar(data);
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    }
  };

  const handleTimetableSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const timetableData = {
      subject: formData.get('subject'),
      teacher: formData.get('teacher'),
      grade: formData.get('grade'),
      section: formData.get('section'),
      dayOfWeek: formData.get('dayOfWeek'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      room: formData.get('room'),
      academicYear: formData.get('academicYear')
    };

    try {
      const url = selectedTimetable 
        ? `http://localhost:8080/api/timetables/${selectedTimetable.id}`
        : 'http://localhost:8080/api/timetables';
      
      const response = await fetch(url, {
        method: selectedTimetable ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timetableData)
      });

      if (response.ok) {
        toast.success(`Timetable ${selectedTimetable ? 'updated' : 'created'} successfully`);
        setIsTimetableDialogOpen(false);
        setSelectedTimetable(null);
        fetchTimetables();
      } else {
        throw new Error('Failed to save timetable');
      }
    } catch (error) {
      toast.error('Failed to save timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleExamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const examData = {
      title: formData.get('title'),
      grade: formData.get('grade'),
      examDate: formData.get('examDate'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      venue: formData.get('venue'),
      examType: formData.get('examType'),
      maxMarks: parseInt(formData.get('maxMarks') as string),
      status: 'SCHEDULED'
    };

    try {
      const url = selectedExam 
        ? `http://localhost:8080/api/exams/${selectedExam.id}`
        : 'http://localhost:8080/api/exams';
      
      const response = await fetch(url, {
        method: selectedExam ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
      });

      if (response.ok) {
        toast.success(`Exam ${selectedExam ? 'updated' : 'scheduled'} successfully`);
        setIsExamDialogOpen(false);
        setSelectedExam(null);
        fetchExams();
      } else {
        throw new Error('Failed to save exam');
      }
    } catch (error) {
      toast.error('Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimetable = async (id: number) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/timetables/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Timetable entry deleted successfully');
        fetchTimetables();
      }
    } catch (error) {
      toast.error('Failed to delete timetable entry');
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/exams/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Exam deleted successfully');
        fetchExams();
      }
    } catch (error) {
      toast.error('Failed to delete exam');
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
            <p className="text-gray-300">Manage timetables, events, and scheduling</p>
          </div>
          <Button className="bg-purple-600 text-white hover:bg-purple-700" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="timetable" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-purple-900/50 border-purple-700">
            <TabsTrigger value="timetable" className="data-[state=active]:bg-purple-600">Class Timetable</TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600">School Events</TabsTrigger>
            <TabsTrigger value="exams" className="data-[state=active]:bg-purple-600">Exam Schedule</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-600">Academic Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="timetable">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5" />
                    Class Timetable Management
                  </CardTitle>
                  <Dialog open={isTimetableDialogOpen} onOpenChange={setIsTimetableDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Timetable Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-purple-900 border-purple-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{selectedTimetable ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleTimetableSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input 
                              id="subject" 
                              name="subject" 
                              defaultValue={selectedTimetable?.subject || ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="teacher">Teacher</Label>
                            <Input 
                              id="teacher" 
                              name="teacher" 
                              defaultValue={selectedTimetable?.teacher?.username || ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="grade">Grade</Label>
                            <Select name="grade" defaultValue={selectedTimetable?.grade || ''}>
                              <SelectTrigger className="bg-purple-800 border-purple-600">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent className="bg-purple-800 border-purple-600">
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                                  <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="section">Section</Label>
                            <Select name="section" defaultValue={selectedTimetable?.section || ''}>
                              <SelectTrigger className="bg-purple-800 border-purple-600">
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent className="bg-purple-800 border-purple-600">
                                {['A','B','C','D','E'].map(section => (
                                  <SelectItem key={section} value={section}>{section}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="dayOfWeek">Day</Label>
                            <Select name="dayOfWeek" defaultValue={selectedTimetable?.dayOfWeek || ''}>
                              <SelectTrigger className="bg-purple-800 border-purple-600">
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                              <SelectContent className="bg-purple-800 border-purple-600">
                                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                                  <SelectItem key={day} value={day}>{day}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input 
                              id="startTime" 
                              name="startTime" 
                              type="time"
                              defaultValue={selectedTimetable?.startTime || ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="endTime">End Time</Label>
                            <Input 
                              id="endTime" 
                              name="endTime" 
                              type="time"
                              defaultValue={selectedTimetable?.endTime || ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="room">Room</Label>
                            <Input 
                              id="room" 
                              name="room" 
                              defaultValue={selectedTimetable?.room || ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="academicYear">Academic Year</Label>
                            <Input 
                              id="academicYear" 
                              name="academicYear" 
                              defaultValue={selectedTimetable?.academicYear || '2024-2025'}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsTimetableDialogOpen(false);
                              setSelectedTimetable(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (selectedTimetable ? 'Update' : 'Add')}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timetables.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                      <div>
                        <h3 className="font-semibold text-white">{entry.subject} - Grade {entry.grade}{entry.section}</h3>
                        <p className="text-sm text-gray-300">Teacher: {entry.teacher?.username || 'Not assigned'}</p>
                        <div className="flex gap-4 text-sm text-gray-400 mt-1">
                          <span>{entry.dayOfWeek}</span>
                          <span>{entry.startTime} - {entry.endTime}</span>
                          <span>Room: {entry.room}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-purple-600 text-white hover:bg-purple-700"
                          onClick={() => {
                            setSelectedTimetable(entry);
                            setIsTimetableDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          onClick={() => handleDeleteTimetable(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5" />
                  School Events Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-300">
                  <p className="mb-6">School events are managed through the event system.</p>
                  <p>Total Events: {events.length}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-5 w-5" />
                    Examination Scheduling
                  </CardTitle>
                  <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-purple-900 border-purple-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{selectedExam ? 'Edit Exam' : 'Schedule New Exam'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleExamSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Exam Title</Label>
                          <Input 
                            id="title" 
                            name="title" 
                            defaultValue={selectedExam?.title || ''}
                            className="bg-purple-800 border-purple-600" 
                            required 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="grade">Grade</Label>
                            <Select name="grade" defaultValue={selectedExam?.grade || ''}>
                              <SelectTrigger className="bg-purple-800 border-purple-600">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent className="bg-purple-800 border-purple-600">
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                                  <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="examType">Exam Type</Label>
                            <Select name="examType" defaultValue={selectedExam?.examType || ''}>
                              <SelectTrigger className="bg-purple-800 border-purple-600">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent className="bg-purple-800 border-purple-600">
                                <SelectItem value="MIDTERM">Midterm</SelectItem>
                                <SelectItem value="FINAL">Final</SelectItem>
                                <SelectItem value="QUIZ">Quiz</SelectItem>
                                <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="examDate">Exam Date</Label>
                            <Input 
                              id="examDate" 
                              name="examDate" 
                              type="date"
                              defaultValue={selectedExam?.examDate || ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input 
                              id="startTime" 
                              name="startTime" 
                              type="time"
                              defaultValue={selectedExam?.startTime || ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="endTime">End Time</Label>
                            <Input 
                              id="endTime" 
                              name="endTime" 
                              type="time"
                              defaultValue={selectedExam?.endTime || ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="venue">Venue</Label>
                            <Input 
                              id="venue" 
                              name="venue" 
                              defaultValue={selectedExam?.venue || ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="maxMarks">Max Marks</Label>
                            <Input 
                              id="maxMarks" 
                              name="maxMarks" 
                              type="number"
                              defaultValue={selectedExam ? '100' : ''}
                              className="bg-purple-800 border-purple-600" 
                              required 
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsExamDialogOpen(false);
                              setSelectedExam(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (selectedExam ? 'Update' : 'Schedule')}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="flex justify-between items-center p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                      <div>
                        <h3 className="font-semibold text-white">{exam.title}</h3>
                        <p className="text-sm text-gray-300">Grade {exam.grade} • {exam.examType}</p>
                        <div className="flex gap-4 text-sm text-gray-400 mt-1">
                          <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                          <span>{exam.startTime} - {exam.endTime}</span>
                          <span>Venue: {exam.venue}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            exam.status === 'SCHEDULED' ? 'bg-blue-600' : 
                            exam.status === 'ONGOING' ? 'bg-yellow-600' : 
                            exam.status === 'COMPLETED' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {exam.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-purple-600 text-white hover:bg-purple-700"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsExamDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          onClick={() => handleDeleteExam(exam.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                {calendar ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                      <h3 className="font-semibold text-white mb-2">Current Term</h3>
                      <p className="text-gray-300">{calendar.currentTerm}</p>
                      <p className="text-sm text-gray-400">
                        {calendar.termStartDate} to {calendar.termEndDate}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-4">Holidays & Events</h3>
                      <div className="space-y-2">
                        {calendar.holidays?.map((holiday: CalendarEvent, index: number) => (
                          <div key={index} className="p-3 bg-purple-700/30 rounded border border-purple-600">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium text-white">{holiday.name}</span>
                                <p className="text-sm text-gray-300">{holiday.date}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                holiday.type === 'HOLIDAY' ? 'bg-red-600' : 'bg-blue-600'
                              } text-white`}>
                                {holiday.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-300">
                    <p>Loading calendar data...</p>
                  </div>
                )}
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
