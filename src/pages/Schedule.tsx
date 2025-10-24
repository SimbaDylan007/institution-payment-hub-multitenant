import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Plus, UploadCloud, Download, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { apiFetch } from "@/utils/apiClient"; // 1. Import the secure apiFetch wrapper

// --- Interfaces ---
type EventType = 'CLASS' | 'EXAM' | 'EVENT' | 'HOLIDAY';
interface ScheduleEvent {
  id?: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  extendedProps: {
    eventType: EventType;
    grade?: string;
    section?: string;
    room?: string;
    teacherName?: string;
    description?: string;
    subjectCode?: string;
  };
}

export default function Schedule() {
  const { user } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduleEvent>>({});

  const fetchEvents = useCallback(async () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    setLoading(true);
    const currentDate = calendarApi.getDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    try {
      // 2. Use apiFetch
      const response = await apiFetch(`http://194.163.141.113:8082/api/schedule/events?year=${year}&month=${month}`);
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map((event: any) => ({
          id: event.id.toString(),
          title: event.title,
          start: event.startTime ? `${event.startDate}T${event.startTime}` : event.startDate,
          end: event.endTime ? `${event.startDate}T${event.endTime}` : (event.endDate ? event.endDate : null),
          allDay: !event.startTime,
          extendedProps: { eventType: event.eventType, grade: event.grade, description: event.description, teacherName: event.teacherName, room: event.room, section: event.section, subjectCode: event.subjectCode },
          backgroundColor: getEventColor(event.eventType),
          borderColor: getEventColor(event.eventType)
        }));
        setEvents(formattedEvents);
      } else {
        toast.error("Failed to load schedule.");
      }
    } catch (error) {
      // apiFetch handles network error toasts
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load is now handled by the `datesSet` prop on the FullCalendar component.
  }, []);

  const getEventColor = (type: string) => {
    switch(type) {
      case 'CLASS': return '#3b82f6'; case 'EXAM': return '#ef4444';
      case 'EVENT': return '#10b981'; case 'HOLIDAY': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event as any);
    setFormData({ id: clickInfo.event.id, title: clickInfo.event.title, start: clickInfo.event.startStr, end: clickInfo.event.endStr || "", allDay: clickInfo.event.allDay, extendedProps: clickInfo.event.extendedProps as any });
    setIsFormOpen(true);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent(null);
    setFormData({ title: "", start: selectInfo.startStr, end: selectInfo.endStr, allDay: selectInfo.allDay, extendedProps: { eventType: 'EVENT' } });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const apiEvent = { id: selectedEvent ? parseInt(selectedEvent.id!) : null, title: formData.title, startDate: formData.start?.split('T')[0], endDate: formData.end?.split('T')[0] || formData.start?.split('T')[0], startTime: formData.allDay ? null : formData.start?.split('T')[1]?.substring(0, 8), endTime: formData.allDay ? null : formData.end?.split('T')[1]?.substring(0, 8), eventType: formData.extendedProps?.eventType, grade: formData.extendedProps?.grade, teacherName: formData.extendedProps?.teacherName, description: formData.extendedProps?.description, room: formData.extendedProps?.room, section: formData.extendedProps?.section, subjectCode: formData.extendedProps?.subjectCode, };
    try {
      const response = await apiFetch('http://194.163.141.113:8082/api/schedule/events', { method: 'POST', body: JSON.stringify(apiEvent) });
      if (response.ok) {
        toast.success("Event saved successfully!");
        setIsFormOpen(false);
        fetchEvents();
      } else { const error = await response.json().catch(() => ({ message: "Failed to save event."})); throw new Error(error.message); }
    } catch (error) { toast.error((error as Error).message); }
    finally { setLoading(false); }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!window.confirm(`Are you sure you want to delete the event '${selectedEvent.title}'?`)) return;
    setLoading(true);
    try {
      const response = await apiFetch(`http://194.163.141.113:8082/api/schedule/events/${selectedEvent.id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success("Event deleted successfully!");
        setIsFormOpen(false);
        fetchEvents();
      } else { throw new Error("Failed to delete event."); }
    } catch (error) { toast.error((error as Error).message); }
    finally { setLoading(false); }
  };

  const handleImport = async () => {
    if (!importFile) { toast.warning("Please select a file."); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("academicYear", "2024-2025");
    try {
      const response = await apiFetch('http://194.163.141.113:8082/api/schedule/timetables/bulk-upload', { method: 'POST', body: formData });
      if (response.ok) {
        toast.success("Timetable imported successfully!");
        setIsImportOpen(false); setImportFile(null); fetchEvents();
      } else { throw new Error(await response.text()); }
    } catch (error) { toast.error((error as Error).message); }
    finally { setLoading(false); }
  };

  const handleDownloadTemplate = () => {
    const headers = "grade,section,dayOfWeek,startTime(HH:mm:ss),endTime(HH:mm:ss),subjectCode,teacherName,room\n";
    const example = "10,A,MONDAY,09:00:00,10:00:00,MTH-101,Mr. Smith,Room 101\n";
    const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "timetable_import_template.csv");
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!user) { return <Navigate to="/" replace />; }

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-white-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-8">
          <div className="mb-6 flex justify-between items-center"><h1 className="text-2xl font-bold">School Calendar & Schedule</h1><Button asChild className="bg-red-600 hover:bg-red-700"><Link to="/dashboard" className="flex items-center gap-2"><Home className="h-4 w-4 mr-2"/>Dashboard</Link></Button></div>
          <Card className="bg-gradient-to-br from-red-900/50 to-white-900/50 border-red-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><CalendarIcon />Calendar</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => setIsImportOpen(true)} className="bg-white-600 hover:bg-white-700"><UploadCloud size={16} className="mr-2"/> Import Timetable</Button>
                  <Button onClick={() => { setSelectedEvent(null); setFormData({ start: new Date().toISOString().split('T')[0], allDay: true, extendedProps: { eventType: 'EVENT' } }); setIsFormOpen(true); }} className="bg-green-600 hover:bg-green-700"><Plus size={16} className="mr-2"/> Add Event</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-gray-900/50 rounded-b-md text-white">
              <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                  events={events}
                  datesSet={fetchEvents}
                  editable={true}
                  selectable={true}
                  eventClick={handleEventClick}
                  select={handleDateSelect}
                  dayHeaderClassNames="text-white bg-red-900/50"
                  viewClassNames="text-white"
              />
            </CardContent>
          </Card>
        </main>

        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="bg-gray-900 text-white border-gray-700">
            <DialogHeader><DialogTitle>Bulk Import Timetable</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4"><p className="text-sm text-gray-400">Upload a CSV file with class schedules.</p><Button variant="outline" onClick={handleDownloadTemplate} className="w-full gap-2"><Download size={16}/>Download CSV Template</Button><div><Label htmlFor="importFile">Upload File</Label><Input id="importFile" type="file" onChange={(e) => setImportFile(e.target.files?.[0] || null)} accept=".csv" className="bg-gray-800 border-gray-600 file:text-white" /></div><div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button><Button onClick={handleImport} disabled={loading}>{loading ? "Importing..." : "Start Import"}</Button></div></div>
          </DialogContent>
        </Dialog>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="bg-gray-900 text-white border-gray-700">
            <DialogHeader><DialogTitle>{selectedEvent ? 'Edit Event' : 'Create Event'}</DialogTitle></DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
              <div><Label htmlFor="title">Event Title</Label><Input id="title" value={formData.title || ''} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} required className="bg-gray-800 border-gray-600"/></div>
              <div><Label htmlFor="eventType">Event Type</Label><Select value={formData.extendedProps?.eventType} onValueChange={(v: EventType) => setFormData(f => ({ ...f, extendedProps: { ...f.extendedProps, eventType: v } }))}><SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue/></SelectTrigger><SelectContent className="bg-gray-800 border-gray-600"><SelectItem value="CLASS">Class</SelectItem><SelectItem value="EXAM">Exam</SelectItem><SelectItem value="EVENT">School Event</SelectItem><SelectItem value="HOLIDAY">Holiday</SelectItem></SelectContent></Select></div>
              {formData.extendedProps?.eventType === 'CLASS' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="grade">Grade</Label><Input id="grade" value={formData.extendedProps?.grade || ''} onChange={e => setFormData(f => ({ ...f, extendedProps: { ...f.extendedProps, grade: e.target.value } }))} className="bg-gray-800 border-gray-600"/></div>
                    <div><Label htmlFor="teacherName">Teacher</Label><Input id="teacherName" value={formData.extendedProps?.teacherName || ''} onChange={e => setFormData(f => ({ ...f, extendedProps: { ...f.extendedProps, teacherName: e.target.value } }))} className="bg-gray-800 border-gray-600"/></div>
                  </div>
              )}
              <div className="flex justify-between items-center gap-2 pt-4">
                <div>{selectedEvent && <Button type="button" variant="destructive" onClick={handleDeleteEvent} disabled={loading}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>}</div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Event'}</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
  );
}