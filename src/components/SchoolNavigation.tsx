
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  MessageSquare,
  Settings,
  BarChart3,
  Home,
  UserCheck,
  Building,
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and key metrics"
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
    description: "Student information and management"
  },
  {
    title: "Staff",
    href: "/staff",
    icon: UserCheck,
    description: "Staff and HR management"
  },
  {
    title: "Academics",
    href: "/academics",
    icon: GraduationCap,
    description: "Classes, grades, and curriculum"
  },
  {
    title: "Finance",
    href: "/finance",
    icon: DollarSign,
    description: "Fee management and payments"
  },
  {
    title: "Library",
    href: "/library",
    icon: BookOpen,
    description: "Library management system"
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: Calendar,
    description: "Timetables and scheduling"
  },
  {
    title: "Communication",
    href: "/communication",
    icon: MessageSquare,
    description: "Messages and announcements"
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Analytics and reporting"
  },
  {
    title: "Facilities",
    href: "/facilities",
    icon: Building,
    description: "Infrastructure and resources"
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration"
  },
];

export default function SchoolNavigation() {
  const location = useLocation();

  return (
    <nav className="bg-[#1A1F2C] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-white dark:text-gray-900">
        School Management
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg transition-colors group",
                isActive
                  ? "bg-purple-600 text-white"
                  : "bg-[#252e3e] dark:bg-gray-50 text-gray-300 dark:text-gray-600 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white"
              )}
            >
              <Icon className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium text-center">
                {item.title}
              </span>
              <span className="text-xs text-center opacity-75 mt-1">
                {item.description}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
