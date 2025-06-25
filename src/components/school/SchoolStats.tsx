
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, UserCheck, DollarSign, BookOpen, Calendar } from "lucide-react";

export default function SchoolStats() {
  // Mock data - in real implementation, this would come from API
  const stats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12%",
      changeType: "increase" as const,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-50"
    },
    {
      title: "Teaching Staff",
      value: "89",
      change: "+3%",
      changeType: "increase" as const,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-50"
    },
    {
      title: "Classes",
      value: "42",
      change: "0%",
      changeType: "neutral" as const,
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-50"
    },
    {
      title: "Fee Collection",
      value: "$85,420",
      change: "+18%",
      changeType: "increase" as const,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-50"
    },
    {
      title: "Library Books",
      value: "3,567",
      change: "+45",
      changeType: "increase" as const,
      icon: BookOpen,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-50"
    },
    {
      title: "Events This Month",
      value: "8",
      change: "+2",
      changeType: "increase" as const,
      icon: Calendar,
      color: "text-rose-600",
      bgColor: "bg-rose-100 dark:bg-rose-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 dark:text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white dark:text-gray-900">
                {stat.value}
              </div>
              <p className={`text-xs ${
                stat.changeType === 'increase' 
                  ? 'text-green-400 dark:text-green-600' 
                  : stat.changeType === 'decrease' 
                  ? 'text-red-400 dark:text-red-600' 
                  : 'text-gray-400 dark:text-gray-600'
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
