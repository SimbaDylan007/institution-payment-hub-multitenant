// src/components/SchoolNavigation.tsx

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"; // For conditional class names
import { motion } from "framer-motion"; // For animations
import { useAuth } from "@/contexts/AuthContext"; // To get the user's role

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
    Banknote,
    ShieldCheck,
    User,
    FileOutput // This icon is for our new menu item
} from "lucide-react";

// Define the structure for navigation items for type safety and consistency
interface NavigationItem {
    name: string;
    href: string;
    icon: React.ElementType;
    description: string;
}

// This list defines ALL possible navigation items in your system
const navigationItems: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home, description: "Overview and key metrics" },
    { name: "Students", description: "Manage student records", icon: Users, href: "/students" },
    { name: "Staff", description: "Manage staff records", icon: UserCheck, href: "/staff" },
    { name: "Academics", href: "/academics", icon: GraduationCap, description: "Classes, grades, and curriculum" },
    { name: "Finance", href: "/financials", icon: DollarSign, description: "Fee management and payments" },
    { name: "Library", href: "/library", icon: BookOpen, description: "Library management system" },
    { name: "Schedule", href: "/schedule", icon: Calendar, description: "Timetables and scheduling" },
    { name: "Communication", href: "/communication", icon: MessageSquare, description: "Messages and announcements" },
    { name: "Reports", href: "/reports", icon: BarChart3, description: "Analytics and reporting" },
    // --- NEW MENU ITEM ADDED HERE ---
    { name: "Data Exports", href: "/main-reports", icon: FileOutput, description: "Export system data to PDF/Excel" },
    { name: "Facilities", href: "/facilities", icon: Building, description: "Infrastructure and resources" },
    { name: "Settings", href: "/settings", icon: Settings, description: "System configuration" },
    { name: "Payment Allocation", href: "/payment-allocation", icon: Banknote, description: "Reconcile bank payments" },
    { name: "Audit Trail", href: "/audit-trail", icon: ShieldCheck, description: "Track all user activities" },
    { name: "My Portal", href: "/student-portal", icon: User, description: "Access your personal information" },
];


// This is the "source of truth" for your frontend access control.
const rolePermissions: { [key: string]: string[] } = {
    "Dashboard": ["ADMIN", "IT_ADMIN", "FINANCE_ADMIN", "ADMINISTRATOR", "TEACHER", "STUDENT"],
    "Students": ["ADMIN", "IT_ADMIN"],
    "Staff": ["ADMIN", "IT_ADMIN"],
    "Academics": ["ADMIN", "ADMINISTRATOR", "TEACHER"],
    "Finance": ["ADMIN", "FINANCE_ADMIN"],
    "Library": ["ADMIN", "ADMINISTRATOR"],
    "Schedule": ["ADMIN", "ADMINISTRATOR", "TEACHER"],
    "Communication": ["ADMIN", "ADMINISTRATOR", "TEACHER"],
    "Reports": ["ADMIN", "FINANCE_ADMIN", "ADMINISTRATOR", "TEACHER"],
    // --- NEW PERMISSION ADDED HERE ---
    "Data Exports": ["ADMIN"],
    "Facilities": ["ADMIN", "ADMINISTRATOR"],
    "Settings": ["ADMIN", "IT_ADMIN"],
    "Payment Allocation": ["ADMIN", "FINANCE_ADMIN"],
    "Audit Trail": ["ADMIN"],
    "My Portal": ["STUDENT"],
};


export default function SchoolNavigation() {
    const location = useLocation();
    const { user } = useAuth(); // GET the currently logged-in user from the context

    // FILTER the full list of navigation items down to only what the current user is allowed to see.
    const accessibleNavItems = navigationItems.filter(item => {
        // If the user is not logged in or has no role, they can't see any items.
        if (!user || !user.role) {
            return false;
        }
        // Get the array of roles allowed to see this specific item.
        const allowedRoles = rolePermissions[item.name];

        // Check if the user's role is included in the array of allowed roles.
        return allowedRoles?.includes(user.role);
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* RENDER the filtered list of accessible items, not the original full list. */}
            {accessibleNavItems.map((item, index) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                    <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-lg overflow-hidden"
                    >
                        <Link
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 h-full border",
                                "transition-all duration-200 group text-center",
                                "bg-gray-100 border-gray-200 text-gray-700",
                                "hover:bg-purple-100 hover:border-purple-300 hover:text-purple-800",
                                "dark:bg-[#212738] dark:border-gray-700 dark:text-gray-300",
                                "dark:hover:bg-purple-700 dark:hover:border-purple-700 dark:hover:text-white",
                                isActive && "bg-purple-600 border-purple-600 text-white shadow-lg"
                            )}
                        >
                            <Icon className={cn(
                                "h-9 w-9 mb-3 transition-colors duration-200",
                                "text-purple-600 group-hover:text-purple-800",
                                "dark:text-purple-400 dark:group-hover:text-white",
                                isActive && "text-white"
                            )} />
                            <span className="text-base font-semibold mb-1 line-clamp-1">
                    {item.name}
                  </span>
                            <span className="text-xs line-clamp-2 transition-colors duration-200 text-gray-500 group-hover:text-purple-800 dark:text-gray-400 dark:group-hover:text-white">
                    {item.description}
                  </span>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}