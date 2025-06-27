
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StaffAttendanceModalProps {
  staffId: number;
  onAttendanceMarked?: () => void;
}

export default function StaffAttendanceModal({ staffId, onAttendanceMarked }: StaffAttendanceModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    attendanceDate: new Date().toISOString().split('T')[0],
    timeIn: "",
    timeOut: "",
    status: "",
    notes: "",
    hoursWorked: "",
    overtimeHours: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/staff/${staffId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attendance marked successfully!",
        });
        setFormData({
          attendanceDate: new Date().toISOString().split('T')[0],
          timeIn: "",
          timeOut: "",
          status: "",
          notes: "",
          hoursWorked: "",
          overtimeHours: ""
        });
        setOpen(false);
        onAttendanceMarked?.();
      } else {
        throw new Error("Failed to mark attendance");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Clock className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
        <DialogHeader>
          <DialogTitle>Mark Staff Attendance</DialogTitle>
          <DialogDescription>
            Record attendance for staff member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="attendanceDate">Date</Label>
            <Input
              id="attendanceDate"
              type="date"
              value={formData.attendanceDate}
              onChange={(e) => handleInputChange("attendanceDate", e.target.value)}
              className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeIn">Time In</Label>
              <Input
                id="timeIn"
                type="time"
                value={formData.timeIn}
                onChange={(e) => handleInputChange("timeIn", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="timeOut">Time Out</Label>
              <Input
                id="timeOut"
                type="time"
                value={formData.timeOut}
                onChange={(e) => handleInputChange("timeOut", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="HALF_DAY">Half Day</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hoursWorked">Hours Worked</Label>
              <Input
                id="hoursWorked"
                type="number"
                step="0.5"
                value={formData.hoursWorked}
                onChange={(e) => handleInputChange("hoursWorked", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="overtimeHours">Overtime Hours</Label>
              <Input
                id="overtimeHours"
                type="number"
                step="0.5"
                value={formData.overtimeHours}
                onChange={(e) => handleInputChange("overtimeHours", e.target.value)}
                className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-200"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-700 dark:border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark Attendance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
