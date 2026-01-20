import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimetableEntry } from "@/types/TimetableEntry"; // Ensure this type is defined
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the apiFetch wrapper

interface TimetableGridProps {
  grade?: string;
  section?: string;
  onEditEntry?: (entry: TimetableEntry) => void;
  onAddEntry?: () => void;
}

export default function TimetableGrid({ grade, section, onEditEntry, onAddEntry }: TimetableGridProps) {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [selectedGrade, setSelectedGrade] = useState(grade || "1"); // Default to a value
  const [selectedSection, setSelectedSection] = useState(section || "A"); // Default to a value
  const [loading, setLoading] = useState(false);

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]; // Match backend DayOfWeek enum
  const timeSlots = [
    "08:00:00-09:00:00", "09:00:00-10:00:00", "10:00:00-11:00:00",
    "11:00:00-12:00:00", "12:00:00-13:00:00", "13:00:00-14:00:00",
    "14:00:00-15:00:00", "15:00:00-16:00:00"
  ];

  useEffect(() => {
    if (selectedGrade && selectedSection) {
      fetchTimetable();
    }
  }, [selectedGrade, selectedSection]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      // 2. Use the apiFetch wrapper for the request.
      const response = await apiFetch(`/api/timetables/grade/${selectedGrade}/section/${selectedSection}`);

      if (response.ok) {
        const data = await response.json();
        setTimetableEntries(data);
      } else {
        toast.error('Failed to fetch timetable');
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      // The apiFetch wrapper already shows a network error toast.
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      // 3. Use the apiFetch wrapper for the DELETE request.
      const response = await apiFetch(`/api/timetables/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Entry deleted successfully');
        fetchTimetable(); // Refresh the grid
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const getEntryForSlot = (day: string, timeSlot: string) => {
    const [start, end] = timeSlot.split('-');
    return timetableEntries.find(entry =>
        entry.dayOfWeek.toUpperCase() === day &&
        entry.startTime === start &&
        entry.endTime === end
    );
  };

  return (
      <Card className="bg-gradient-to-br from-red-900/50 to-white-900/50 border-red-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Class Timetable</CardTitle>
            <div className="flex gap-4">
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-32 bg-red-800 border-red-600 text-white">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent className="bg-red-800 border-red-600">
                  {Array.from({length: 12}, (_, i) => `Grade ${i + 1}`).map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-32 bg-red-800 border-red-600 text-white">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent className="bg-red-800 border-red-600">
                  {['A', 'B', 'C', 'D'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                  onClick={onAddEntry}
                  className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Period
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
              </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                  <tr className="border-b border-red-600">
                    <th className="p-3 text-left text-gray-300">Time</th>
                    {days.map(day => (
                        <th key={day} className="p-3 text-left text-gray-300 capitalize">{day.toLowerCase()}</th>
                    ))}
                  </tr>
                  </thead>
                  <tbody>
                  {timeSlots.map(timeSlot => (
                      <tr key={timeSlot} className="border-b border-red-700">
                        <td className="p-3 text-gray-300 font-medium">{timeSlot.split('-')[0]} - {timeSlot.split('-')[1]}</td>
                        {days.map(day => {
                          const entry = getEntryForSlot(day, timeSlot);
                          return (
                              <td key={`${day}-${timeSlot}`} className="p-2 align-top">
                                {entry ? (
                                    <div className="bg-red-700/50 p-2 rounded border border-red-600 group hover:bg-red-600/50 transition-colors h-24 flex flex-col justify-between">
                                      <div>
                                        <div className="text-white font-medium text-xs">{entry.subject}</div>
                                        <div className="text-gray-300 text-xs">{entry.teacher}</div>
                                        <div className="text-gray-400 text-xs">{entry.room}</div>
                                      </div>
                                      <div className="flex gap-1 self-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-6 w-6 p-0 text-white-400 hover:text-white-300" onClick={() => onEditEntry?.(entry)}><Edit className="h-3 w-3" /></Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300" onClick={() => entry.id && deleteEntry(entry.id)}><Trash2 className="h-3 w-3" /></Button>
                                      </div>
                                    </div>
                                ) : (
                                    <div className="h-24"></div>
                                )}
                              </td>
                          );
                        })}
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </CardContent>
      </Card>
  );
}