import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateTimetableEntryRequest } from "@/types/TimetableEntry";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

interface AddTimetableEntryModalProps {
  onEntryAdded: () => void;
}

export default function AddTimetableEntryModal({ onEntryAdded }: AddTimetableEntryModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTimetableEntryRequest>({
    subject: "",
    teacher: "",
    grade: "",
    section: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    room: "",
    academicYear: "2024-2025"
  });

  // 2. Refactor the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Replace `fetch` with `apiFetch` and remove the manual headers.
      // `apiFetch` will automatically add the 'Authorization' and 'Content-Type' headers.
      const response = await apiFetch('http://localhost:8080/api/timetables', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Timetable entry added successfully');
        setOpen(false);
        // Reset form on success
        setFormData({
          subject: "",
          teacher: "",
          grade: "",
          section: "",
          dayOfWeek: "",
          startTime: "",
          endTime: "",
          room: "",
          academicYear: "2024-2025"
        });
        onEntryAdded(); // Callback to refresh parent component data
      } else {
        // Try to get a more specific error message from the server response
        const error = await response.json();
        throw new Error(error.message || 'Failed to add timetable entry.');
      }
    } catch (error) {
      // apiFetch will handle generic network/auth errors with its own toast.
      // This catch block will display more specific error messages from the server.
      console.error('Error adding timetable entry:', error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // The JSX for the component remains unchanged
  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Timetable Entry
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-purple-700 text-white backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Add Timetable Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    className="bg-purple-800/50 border-purple-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="teacher">Teacher</Label>
                <Input
                    id="teacher"
                    value={formData.teacher}
                    onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                    required
                    className="bg-purple-800/50 border-purple-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-900 border-purple-700">
                    {Array.from({length: 12}, (_, i) => (
                        <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={formData.section} onValueChange={(value) => setFormData({...formData, section: value})}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-900 border-purple-700">
                    {['A', 'B', 'C', 'D'].map((section) => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dayOfWeek">Day</Label>
                <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({...formData, dayOfWeek: value})}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-900 border-purple-700">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                    className="bg-purple-800/50 border-purple-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                    className="bg-purple-800/50 border-purple-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="room">Room</Label>
              <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  required
                  className="bg-purple-800/50 border-purple-600 text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-purple-600 text-white hover:bg-purple-700"
              >
                Cancel
              </Button>
              <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}