
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface QuickStats {
  totalClasses: number;
  activePeriods: number;
  conflicts: number;
  freeSlots: number;
}

export default function TimetableQuickStats() {
  const [stats, setStats] = useState<QuickStats>({
    totalClasses: 0,
    activePeriods: 0,
    conflicts: 0,
    freeSlots: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/timetables/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching timetable stats:', error);
      // Use fallback stats
      setStats({
        totalClasses: 42,
        activePeriods: 336,
        conflicts: 2,
        freeSlots: 24
      });
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.totalClasses}</div>
          <p className="text-sm text-gray-300">Total Classes</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.activePeriods}</div>
          <p className="text-sm text-gray-300">Active Periods</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.conflicts}</div>
          <p className="text-sm text-gray-300">Conflicts</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.freeSlots}</div>
          <p className="text-sm text-gray-300">Free Slots</p>
        </CardContent>
      </Card>
    </div>
  );
}
