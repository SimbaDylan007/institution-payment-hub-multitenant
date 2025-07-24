// src/components/Header.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function Header() {
    const { user, logout } = useAuth();

    return (
        // Default: white background, light border. Dark: dark background, dark border.
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-lg
                       dark:bg-[#1A1F2C] dark:border-gray-800 dark:shadow-xl">
            <div className="flex justify-between items-center h-full">
                <div className="flex items-center space-x-4">
                    {/* Default: dark text. Dark: white text. */}
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-wide dark:text-white">
                        School Management System
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    {user && (
                        <>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                {/* Default: purple icon. Dark: lighter purple icon. */}
                                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <span className="text-base font-medium">{user.username}</span>
                            </div>
                            <Button
                                onClick={logout}
                                // Default: purple gradient. Dark: darker purple gradient.
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-400 text-white hover:from-purple-600 hover:to-purple-500 shadow-md transition-all duration-300 transform hover:-translate-y-0.5
                           dark:from-purple-600 dark:to-purple-500 dark:hover:from-purple-700 dark:hover:to-purple-600"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}