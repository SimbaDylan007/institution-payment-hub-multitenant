
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-[#1A1F2C] border-b border-gray-800 sticky top-0 z-10 dark:bg-white dark:border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" x2="16" y1="21" y2="21"></line>
              <line x1="12" x2="12" y1="17" y2="21"></line>
            </svg>
          </div>
          <div className="font-bold text-lg md:text-xl text-white dark:text-gray-900">
            <span>Institution Payment Hub</span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="hidden md:inline text-sm text-gray-300 dark:text-gray-700">
              Welcome, {user.name || 'User'}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-600 text-white">
                      {user.name 
                        ? user.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1A1F2C] border-gray-800 dark:bg-white dark:border-gray-200">
                <DropdownMenuItem 
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-[#252e3e] dark:text-red-600 dark:focus:bg-gray-100"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
