
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, UserCheck, DollarSign, BookOpen, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface StatsData {
  totalStudents: number;
  teachingStaff: number;
  totalClasses: number;
  feeCollection: number;
  libraryBooks: number;
  eventsThisMonth: number;
}

export default function SchoolStats() {
  const [stats, setStats] = useState<StatsData>({
    totalStudents: 0,
    teachingStaff: 0,
    totalClasses: 0,
    feeCollection: 0,
    libraryBooks: 0,
    eventsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, staffRes, classesRes, feesRes, booksRes, eventsRes] = await Promise.all([
        fetch('http://localhost:8080/api/students/count'),
        fetch('http://localhost:8080/api/staff/count'),
        fetch('http://localhost:8080/api/timetables/classes/count'),
        fetch('http://localhost:8080/api/fees/total-collected'),
        fetch('http://localhost:8080/api/library/books/count'),
        fetch('http://localhost:8080/api/events/current-month/count')
      ]);

      const statsData = {
        totalStudents: studentsRes.ok ? await studentsRes.json() : 1247,
        teachingStaff: staffRes.ok ? await staffRes.json() : 89,
        totalClasses: classesRes.ok ? await classesRes.json() : 42,
        feeCollection: feesRes.ok ? await feesRes.json() : 85420,
        libraryBooks: booksRes.ok ? await booksRes.json() : 3567,
        eventsThisMonth: eventsRes.ok ? await eventsRes.json() : 8
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      title: "Teaching Staff",
      value: stats.teachingStaff.toString(),
      change: "+3%",
      icon: UserCheck,
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    {
      title: "Classes",
      value: stats.totalClasses.toString(),
      change: "0%",
      icon: GraduationCap,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    {
      title: "Fee Collection",
      value: `$${stats.feeCollection.toLocaleString()}`,
      change: "+18%",
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20"
    },
    {
      title: "Library Books",
      value: stats.libraryBooks.toLocaleString(),
      change: "+45",
      icon: BookOpen,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20"
    },
    {
      title: "Events This Month",
      value: stats.eventsThisMonth.toString(),
      change: "+2",
      icon: Calendar,
      color: "text-rose-400",
      bgColor: "bg-rose-500/20"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-purple-700 rounded mb-2"></div>
              <div className="h-8 bg-purple-700 rounded mb-2"></div>
              <div className="h-3 bg-purple-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700 hover:border-purple-500 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-green-400">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
