
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TimetableEntry, CreateTimetableEntryRequest } from "@/types/TimetableEntry";

interface AddTimetableEntryModalProps {
  onEntryAdded?: () => void;
  editEntry?: TimetableEntry;
  onEntryUpdated?: () => void;
}

export default function AddTimetableEntryModal({ onEntryAdded, editEntry, onEntryUpdated }: AddTimetableEntryModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTimetableEntryRequest>({
    subject: editEntry?.subject || "",
    teacher: editEntry?.teacher || "",
    grade: editEntry?.grade || "",
    section: editEntry?.section || "",
    dayOfWeek: editEntry?.dayOfWeek || "",
    startTime: editEntry?.startTime || "",
    endTime: editEntry?.endTime || "",
    room: editEntry?.room || "",
    academicYear: editEntry?.academicYear || "2024-2025"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editEntry 
        ? `http://localhost:8080/api/timetables/${editEntry.id}`
        : 'http://localhost:8080/api/timetables';
      
      const method = editEntry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editEntry ? 'Entry updated successfully!' : 'Entry added successfully!');
        setOpen(false);
        if (editEntry) {
          onEntryUpdated?.();
        } else {
          onEntryAdded?.();
        }
        if (!editEntry) {
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
        }
      } else {
        toast.error('Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {editEntry ? 'Edit Period' : 'Add Period'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-700 text-white">
        <DialogHeader>
          <DialogTitle>{editEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="bg-purple-800 border-purple-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="teacher">Teacher</Label>
              <Input
                id="teacher"
                value={formData.teacher}
                onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                className="bg-purple-800 border-purple-600 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}>
                <SelectTrigger className="bg-purple-800 border-purple-600 text-white">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={formData.section} onValueChange={(value) => setFormData({...formData, section: value})}>
                <SelectTrigger className="bg-purple-800 border-purple-600 text-white">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  {['A', 'B', 'C', 'D'].map(section => (
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
                <SelectTrigger className="bg-purple-800 border-purple-600 text-white">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-600">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
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
                className="bg-purple-800 border-purple-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="bg-purple-800 border-purple-600 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="room">Room</Label>
            <Input
              id="room"
              value={formData.room}
              onChange={(e) => setFormData({...formData, room: e.target.value})}
              className="bg-purple-800 border-purple-600 text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-purple-600 text-white hover:bg-purple-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Saving...' : (editEntry ? 'Update' : 'Add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
