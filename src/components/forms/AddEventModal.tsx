import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the apiFetch wrapper

interface AddEventModalProps {
  onEventAdded?: () => void;
}

export default function AddEventModal({ onEventAdded }: AddEventModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "",
    targetAudience: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    isPublic: true,
    status: "PLANNED"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. Use the apiFetch wrapper for the request.
      // The wrapper automatically adds the JWT Authorization header.
      const response = await apiFetch('http://localhost:8080/api/events', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Event added successfully');
        setOpen(false);
        // Reset form state
        setFormData({
          title: "", description: "", eventType: "", targetAudience: "",
          eventDate: "", startTime: "", endTime: "", venue: "",
          isPublic: true, status: "PLANN-ED"
        });
        if (onEventAdded) onEventAdded();
      } else {
        const error = await response.json().catch(() => ({ message: "Failed to add event." }));
        toast.error(`Failed to add event: ${error.message}`);
      }
    } catch (error) {
      // The apiFetch wrapper already shows a toast for network errors.
      console.error('Error adding event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-purple-700 text-white backdrop-blur-sm max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="bg-purple-800/50 border-purple-600 text-white" />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-purple-800/50 border-purple-600 text-white" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value})}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="bg-purple-900 border-purple-700">
                    <SelectItem value="ACADEMIC">Academic</SelectItem>
                    <SelectItem value="SPORTS">Sports</SelectItem>
                    <SelectItem value="CULTURAL">Cultural</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="EXAMINATION">Examination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select value={formData.targetAudience} onValueChange={(value) => setFormData({...formData, targetAudience: value})}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white"><SelectValue placeholder="Select audience" /></SelectTrigger>
                  <SelectContent className="bg-purple-900 border-purple-700">
                    <SelectItem value="STUDENTS">Students</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="PARENTS">Parents</SelectItem>
                    <SelectItem value="ALL">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input id="eventDate" type="date" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} required className="bg-purple-800/50 border-purple-600 text-white" />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="bg-purple-800/50 border-purple-600 text-white" />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="bg-purple-800/50 border-purple-600 text-white" />
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Location</Label>
              <Input id="venue" value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} className="bg-purple-800/50 border-purple-600 text-white" />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-purple-600 text-white hover:bg-purple-700">Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                {loading ? 'Adding...' : 'Add Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}