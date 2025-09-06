import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Inbox, MailOpen, Trash2, Home } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { apiFetch } from "@/utils/apiClient"; // 1. Import the apiFetch wrapper

// --- Interfaces ---
interface Notification { id: number; subject: string; content: string; createdAt: string; readAt: string | null; type: string; }
interface Page<T> { content: T[]; totalPages: number; number: number; }

export default function Communication() {
  const { user } = useAuth();
  const [notificationsPage, setNotificationsPage] = useState<Page<Notification> | null>(null);
  const [loading, setLoading] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // CORRECTED: This function now uses the apiFetch wrapper
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await apiFetch('http://localhost:8080/api/notifications?page=0&size=20');
      if (response.ok) {
        const data: Page<Notification> = await response.json();
        setNotificationsPage(data);
      } else {
        // The wrapper will have already shown a 403 toast, but we can add a fallback.
        toast.error("Failed to load notifications.");
      }
    } catch (error) {
      // The wrapper handles network error toasts.
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // CORRECTED: This function now uses the apiFetch wrapper
  const handleSendAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const announcementData = { subject: formData.get('subject'), content: formData.get('content'), targetAudience: formData.get('targetAudience'), };
    try {
      const res = await apiFetch('http://localhost:8080/api/notifications/announcements', {
        method: 'POST',
        body: JSON.stringify(announcementData)
      });
      if (res.ok) {
        toast.success("Announcement sent successfully!");
        setIsComposeOpen(false);
      } else {
        const errorData = await res.json().catch(() => ({ message: "Failed to send announcement."}));
        throw new Error(errorData.message);
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // CORRECTED: This function now uses the apiFetch wrapper
  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await apiFetch(`http://localhost:8080/api/notifications/${id}/read`, { method: 'POST' });
      if(response.ok) {
        setNotificationsPage(prev => {
          if (!prev) return null;
          const updatedContent = prev.content.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n);
          return { ...prev, content: updatedContent };
        });
      }
    } catch (e) { /* Fails silently for better UX */ }
  };

  if (!user) return <Navigate to="/" replace />;

  const notifications = notificationsPage?.content || [];

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Communication Center</h1>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link to="/dashboard" className="flex items-center gap-2"><Home className="h-4 w-4"/>Dashboard</Link>
            </Button>
          </div>
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><Inbox />Notification Feed</CardTitle>
                {user.role === 'ADMIN' && (
                    <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                      <DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700 gap-2"><Send size={16}/>New Announcement</Button></DialogTrigger>
                      <DialogContent className="bg-gray-900 text-white border-gray-700">
                        <DialogHeader><DialogTitle>Compose Announcement</DialogTitle></DialogHeader>
                        <form onSubmit={handleSendAnnouncement} className="space-y-4">
                          <div><Label>Subject</Label><Input name="subject" required className="bg-gray-800 border-gray-600"/></div>
                          <div><Label>Content</Label><Textarea name="content" rows={6} required className="bg-gray-800 border-gray-600"/></div>
                          <div>
                            <Label>Target Audience</Label>
                            <Select name="targetAudience" defaultValue="ALL">
                              <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue/></SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectGroup><SelectLabel>General Groups</SelectLabel><SelectItem value="ALL">All Users</SelectItem><SelectItem value="ALL_STAFF">All Staff</SelectItem><SelectItem value="ALL_STUDENTS">All Students</SelectItem></SelectGroup>
                                <SelectGroup><SelectLabel>Parents by Grade</SelectLabel>{Array.from({ length: 12 }, (_, i) => (<SelectItem key={i+1} value={`PARENTS_GRADE_${i+1}`}>Parents of Grade {i+1}</SelectItem>))}</SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end"><Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Announcement"}</Button></div>
                        </form>
                      </DialogContent>
                    </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {loading && notifications.length === 0 && <p className="text-center p-8">Loading notifications...</p>}
                {!loading && notifications.length === 0 && <p className="text-center p-8 text-gray-400">Your notification inbox is empty.</p>}
                {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 rounded-lg border flex items-start gap-4 transition-colors ${notif.readAt ? 'bg-purple-800/20 border-purple-900' : 'bg-purple-700/40 border-purple-600'}`}>
                      <div className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${!notif.readAt ? 'bg-blue-400 animate-pulse' : 'bg-transparent'}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-bold">{notif.subject}</p>
                          <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(notif.createdAt))} ago</p>
                        </div>
                        <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{notif.content}</p>
                      </div>
                      {!notif.readAt && <Button size="sm" variant="ghost" className="self-center" onClick={() => handleMarkAsRead(notif.id)}><MailOpen size={16} className="mr-2"/> Mark as Read</Button>}
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  );
}