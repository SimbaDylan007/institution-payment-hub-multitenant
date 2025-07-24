import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"; // For conditional class names
import { motion } from "framer-motion"; // For animations

// Import all necessary Lucide icons
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

// Define the structure for navigation items for type safety and consistency
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and key metrics"
  },
  {
    name: "Students",
    description: "Manage student records",
    icon: Users,
    href: "/students",
  },
  {
    name: "Staff",
    description: "Manage staff records",
    icon: UserCheck,
    href: "/staff",
  },
  {
    name: "Academics",
    href: "/academics",
    icon: GraduationCap,
    description: "Classes, grades, and curriculum"
  },
  {
    name: "Finance",
    href: "/finance",
    icon: DollarSign,
    description: "Fee management and payments"
  },
  {
    name: "Library",
    href: "/library",
    icon: BookOpen,
    description: "Library management system"
  },
  {
    name: "Schedule",
    href: "/schedule",
    icon: Calendar,
    description: "Timetables and scheduling"
  },
  {
    name: "Communication",
    href: "/communication",
    icon: MessageSquare,
    description: "Messages and announcements"
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Analytics and reporting"
  },
  {
    name: "Facilities",
    href: "/facilities",
    icon: Building,
    description: "Infrastructure and resources"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration"
  },
];

export default function SchoolNavigation() {
  const location = useLocation();

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
              <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }} // Initial state for animation
                  animate={{ opacity: 1, y: 0 }}   // Animate to this state
                  transition={{ duration: 0.3, delay: index * 0.05 }} // Staggered animation
                  // Apply shadow that is dark on light background, but still visible on dark background
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }} // More subtle shadow for light mode
                  whileTap={{ scale: 0.98 }} // Slight press effect on click
                  className="rounded-lg overflow-hidden" // Ensures shadow/scale behaves correctly
              >
                <Link
                    to={item.href}
                    className={cn(
                        "flex flex-col items-center justify-center p-4 h-full border", // Base styles
                        "transition-all duration-200 group text-center", // Transition & Group for hover effects

                        // Default (Light Mode) styles
                        "bg-gray-100 border-gray-200 text-gray-700",
                        "hover:bg-purple-100 hover:border-purple-300 hover:text-purple-800",

                        // Dark Mode styles (overrides default when 'dark' class is present)
                        "dark:bg-[#212738] dark:border-gray-700 dark:text-gray-300",
                        "dark:hover:bg-purple-700 dark:hover:border-purple-700 dark:hover:text-white",

                        // Active state styles (apply on top of previous, regardless of theme for consistent purple active)
                        isActive && "bg-purple-600 border-purple-600 text-white shadow-lg"
                    )}
                >
                  <Icon className={cn(
                      "h-9 w-9 mb-3 transition-colors duration-200", // Base icon styles
                      // Default (Light Mode) icon color
                      "text-purple-600 group-hover:text-purple-800",
                      // Dark Mode icon color
                      "dark:text-purple-400 dark:group-hover:text-white",
                      // Active state icon color override
                      isActive && "text-white" // Active icon is white in both themes
                  )} />
                  <span className="text-base font-semibold mb-1 line-clamp-1">
                    {item.name}
                  </span>
                  <span className="text-xs line-clamp-2 transition-colors duration-200
                               // Default (Light Mode) description text
                               text-gray-500 group-hover:text-purple-800
                               // Dark Mode description text
                               dark:text-gray-400 dark:group-hover:text-white">
                    {item.description}
                  </span>
                </Link>
              </motion.div>
          );
        })}
      </div>
  );
}