import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { apiFetch } from "@/utils/apiClient"; // Import the apiFetch wrapper
import { BookCopy, CalendarCheck2, Presentation } from "lucide-react";
// Updated interface to match the new DTO from the backend
interface QuickStats {
  totalClasses: number;
  totalExams: number;
  totalEvents: number;
}
export default function ScheduleQuickStats() {
  const [stats, setStats] = useState<QuickStats>({
    totalClasses: 0,
    totalExams: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchStats();
  }, []);
  const fetchStats = async () => {
    setLoading(true);
    try {
// Use the new, correct endpoint
      const response = await apiFetch('http://localhost:8080/api/schedule/stats');

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch schedule stats');
      }
    } catch (error) {
      console.error('Error fetching schedule stats:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
          <CardContent className="p-4 text-center">
            <BookCopy className="mx-auto h-6 w-6 mb-2 text-blue-400" />
            <div className="text-2xl font-bold text-blue-400">{loading ? '...' : stats.totalClasses}</div>
            <p className="text-sm text-gray-300">Total Classes Scheduled</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
          <CardContent className="p-4 text-center">
            <CalendarCheck2 className="mx-auto h-6 w-6 mb-2 text-red-400" />
            <div className="text-2xl font-bold text-red-400">{loading ? '...' : stats.totalExams}</div>
            <p className="text-sm text-gray-300">Total Exams Scheduled</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
          <CardContent className="p-4 text-center">
            <Presentation className="mx-auto h-6 w-6 mb-2 text-green-400" />
            <div className="text-2xl font-bold text-green-400">{loading ? '...' : stats.totalEvents}</div>
            <p className="text-sm text-gray-300">Total School Events</p>
          </CardContent>
        </Card>
      </div>
  );
}