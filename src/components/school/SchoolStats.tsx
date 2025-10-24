// src/components/school/SchoolStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  UserCheck,
  DollarSign,
  BookOpen,
  Calendar,
  ClipboardList,
  type LucideIcon // ✅ Correct way to import the icon type
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ Use the correct type for React icon components
const iconMap: { [key: string]: LucideIcon } = {
  Users,
  GraduationCap,
  UserCheck,
  DollarSign,
  BookOpen,
  Calendar,
  ClipboardList
};

// Interface for a single stat card's data from the API
interface StatCardData {
  title: string;
  value: string;
  change: string;
  icon: string; // The name of the icon (e.g., "Users")
  color: string;
}

// Interface for the component's props
interface SchoolStatsProps {
  stats: StatCardData[];
  loading: boolean;
}

export default function SchoolStats({ stats, loading }: SchoolStatsProps) {
  if (loading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 6 }).map((_, index) => (
              <Card
                  key={index}
                  className="bg-gradient-to-br from-red-900/50 to-white-900/50 border-red-700 animate-pulse"
              >
                <CardContent className="p-6">
                  <div className="h-4 w-2/3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 w-1/2 bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 w-1/3 bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
          ))}
        </div>
    );
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {stats.map((stat) => {
          const IconComponent = iconMap[stat.icon] || Users; // Fallback to Users
          return (
              <Card
                  key={stat.title}
                  className="bg-gradient-to-br from-red-900/50 to-white-900/50 border-gray-700 hover:border-red-500 transition-colors"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full bg-gray-800/50`}>
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  {stat.change && <p className="text-xs text-green-400">{stat.change}</p>}
                </CardContent>
              </Card>
          );
        })}
      </div>
  );
}
