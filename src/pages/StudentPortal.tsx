// src/pages/StudentPortal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Home, User, GraduationCap, DollarSign, Library, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { apiFetch } from '@/utils/apiClient';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

// --- Interfaces ---
interface Student { id: number; studentId: string; firstName: string; lastName: string; email: string; currentGrade: string; }
interface Grade { id: number; subject: { name: string; code: string; }; letterGrade: string; marksObtained: number; maxMarks: number; }
interface Financials { ledgerEntries: any[]; currentBalance: number; }
interface BookTransaction { id: number; book: { title: string }; issueDate: string; dueDate: string; returnDate: string | null; status: string; }
interface ScheduleEvent { id: string; title: string; start: string; end?: string; }
interface Notification { id: number; subject: string; content: string; createdAt: string; }

export default function StudentPortal() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [financials, setFinancials] = useState<Financials | null>(null);
  const [library, setLibrary] = useState<BookTransaction[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      const fetchData = async () => {
        setLoading(true);
        try {
          const today = new Date();
          const scheduleParams = `?year=${today.getFullYear()}&month=${today.getMonth() + 1}`;
          const [profileRes, gradesRes, financialsRes, libraryRes, scheduleRes, notificationsRes] = await Promise.all([
            apiFetch('/api/student-portal/my-profile'),
            apiFetch('/api/student-portal/my-grades'),
            apiFetch('/api/student-portal/my-financials'),
            apiFetch('/api/student-portal/my-library-activity'),
            apiFetch(`/api/student-portal/my-schedule${scheduleParams}`),
            apiFetch('/api/student-portal/my-notifications')
          ]);
          if (profileRes.ok) setProfile(await profileRes.json());
          if (gradesRes.ok) setGrades(await gradesRes.json());
          if (financialsRes.ok) setFinancials(await financialsRes.json());
          if (libraryRes.ok) setLibrary((await libraryRes.json()).content);
          if (scheduleRes.ok) {
            const scheduleData = await scheduleRes.json();
            setSchedule(scheduleData.map((e:any) => ({id: e.id, title: e.title, start: e.startDate, end: e.endDate})));
          }
          if (notificationsRes.ok) setNotifications((await notificationsRes.json()).content);
        } catch (error) {
          console.error("Failed to fetch student data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'STUDENT') return <div>Access Denied. This portal is for students only.</div>;
  if (loading) return <div className="text-center p-8">Loading your portal...</div>;

  return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {profile?.firstName || user.name}</h1>
              <p className="text-gray-400">Your personal student dashboard</p>
            </div>
            <Button asChild><Link to="/dashboard"><Home size={16} className="mr-2"/>Dashboard</Link></Button>
          </div>

          <Tabs defaultValue="grades" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="grades">My Grades</TabsTrigger>
              <TabsTrigger value="financials">My Account</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="schedule">Timetable</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="grades"><Card className="bg-gray-800 border-gray-700"><CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap/>Academic Results</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Marks</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader><TableBody>{grades.map(g => <TableRow key={g.id}><TableCell>{g.subject.name} ({g.subject.code})</TableCell><TableCell>{g.marksObtained}/{g.maxMarks}</TableCell><TableCell><Badge>{g.letterGrade}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></TabsContent>

            <TabsContent value="financials"><Card className="bg-gray-800 border-gray-700"><CardHeader><CardTitle className="flex items-center gap-2 justify-between"><div className="flex items-center gap-2"><DollarSign/>Financial Ledger</div><Badge variant={financials && financials.currentBalance > 0 ? "destructive" : "default"}>Balance: ${financials?.currentBalance.toFixed(2)}</Badge></CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Charge</TableHead><TableHead className="text-right">Payment</TableHead></TableRow></TableHeader><TableBody>{financials?.ledgerEntries.map(l => <TableRow key={l.id}><TableCell>{format(new Date(l.transactionDate), 'yyyy-MM-dd')}</TableCell><TableCell>{l.description}</TableCell><TableCell className="text-right text-red-400">{l.transactionType === 'DEBIT' ? `$${l.amount.toFixed(2)}` : ''}</TableCell><TableCell className="text-right text-green-400">{l.transactionType === 'CREDIT' ? `$${l.amount.toFixed(2)}` : ''}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></TabsContent>

            <TabsContent value="library"><Card className="bg-gray-800 border-gray-700"><CardHeader><CardTitle className="flex items-center gap-2"><Library/>My Library Activity</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Book Title</TableHead><TableHead>Issue Date</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{library.map(l => <TableRow key={l.id}><TableCell>{l.book.title}</TableCell><TableCell>{format(new Date(l.issueDate), 'yyyy-MM-dd')}</TableCell><TableCell>{format(new Date(l.dueDate), 'yyyy-MM-dd')}</TableCell><TableCell><Badge variant={l.status === 'ISSUED' ? 'destructive' : 'default'}>{l.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></TabsContent>

            <TabsContent value="schedule"><Card className="bg-gray-800 border-gray-700"><CardHeader><CardTitle className="flex items-center gap-2"><Calendar/>My Timetable</CardTitle></CardHeader><CardContent><FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={schedule}/></CardContent></Card></TabsContent>

            <TabsContent value="messages"><Card className="bg-gray-800 border-gray-700"><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare/>Announcements & Messages</CardTitle></CardHeader><CardContent className="space-y-3">{notifications.map(n => <div key={n.id} className="p-3 border border-gray-600 rounded-md"><h4 className="font-bold">{n.subject}</h4><p className="text-sm text-gray-300">{n.content}</p><p className="text-xs text-gray-500 mt-1">{format(new Date(n.createdAt), 'PPP p')}</p></div>)}</CardContent></Card></TabsContent>

            <TabsContent value="profile"><Card className="bg-gray-800 border-gray-700"><CardHeader><CardTitle className="flex items-center gap-2"><User/>My Profile</CardTitle></CardHeader><CardContent className="space-y-2"><div><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</div><div><strong>Student ID:</strong> {profile?.studentId}</div><div><strong>Email:</strong> {profile?.email}</div><div><strong>Current Grade:</strong> {profile?.currentGrade}</div></CardContent></Card></TabsContent>
          </Tabs>
        </main>
      </div>
  );
}