
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimetableEntry } from "@/types/TimetableEntry";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface TimetableGridProps {
  grade?: string;
  section?: string;
  onEditEntry?: (entry: TimetableEntry) => void;
  onAddEntry?: () => void;
}

export default function TimetableGrid({ grade, section, onEditEntry, onAddEntry }: TimetableGridProps) {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [selectedGrade, setSelectedGrade] = useState(grade || "");
  const [selectedSection, setSelectedSection] = useState(section || "");
  const [loading, setLoading] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "08:00-09:00",
    "09:00-10:00", 
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00"
  ];

  useEffect(() => {
    if (selectedGrade && selectedSection) {
      fetchTimetable();
    }
  }, [selectedGrade, selectedSection]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/timetables/grade/${selectedGrade}/section/${selectedSection}`);
      if (response.ok) {
        const data = await response.json();
        setTimetableEntries(data);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/timetables/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Entry deleted successfully');
        fetchTimetable();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const getEntryForSlot = (day: string, timeSlot: string) => {
    return timetableEntries.find(entry => 
      entry.dayOfWeek === day && 
      `${entry.startTime}-${entry.endTime}` === timeSlot
    );
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Class Timetable</CardTitle>
          <Button 
            onClick={onAddEntry}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Period
          </Button>
        </div>
        <div className="flex gap-4">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-32 bg-purple-800 border-purple-600 text-white">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent className="bg-purple-800 border-purple-600">
              {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-32 bg-purple-800 border-purple-600 text-white">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent className="bg-purple-800 border-purple-600">
              {['A', 'B', 'C', 'D'].map(section => (
                <SelectItem key={section} value={section}>{section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-600">
                  <th className="p-3 text-left text-gray-300">Time</th>
                  {days.map(day => (
                    <th key={day} className="p-3 text-left text-gray-300">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot} className="border-b border-purple-700">
                    <td className="p-3 text-gray-300 font-medium">{timeSlot}</td>
                    {days.map(day => {
                      const entry = getEntryForSlot(day, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="p-3">
                          {entry ? (
                            <div className="bg-purple-700/50 p-2 rounded border border-purple-600 group hover:bg-purple-600/50 transition-colors">
                              <div className="text-white font-medium text-xs">{entry.subject}</div>
                              <div className="text-gray-300 text-xs">{entry.teacher}</div>
                              <div className="text-gray-400 text-xs">{entry.room}</div>
                              <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
                                  onClick={() => onEditEntry?.(entry)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                  onClick={() => entry.id && deleteEntry(entry.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 border border-dashed border-purple-600 rounded opacity-50"></div>
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
