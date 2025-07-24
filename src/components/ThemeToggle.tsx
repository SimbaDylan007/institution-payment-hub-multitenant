// src/components/ThemeToggle.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* The button for triggering the dropdown.
            It uses 'ghost' variant which adapts well.
            The icons handle the rotation/scaling based on 'dark' class on HTML. */}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        {/* Dropdown content:
          Default (Light): bg-white, border-gray-200
          Dark: bg-[#1A1F2C], border-gray-800
          This is exactly what we want for consistent card/panel styling. */}
        <DropdownMenuContent align="end" className="w-36 bg-white border-gray-200 dark:bg-[#1A1F2C] dark:border-gray-800">
          <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={`cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700 ${theme === "light" ? "bg-accent dark:bg-gray-600" : ""}`} // Added hover/active states for consistency
          >
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={`cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700 ${theme === "dark" ? "bg-accent dark:bg-gray-600" : ""}`}
          >
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
              onClick={() => setTheme("system")}
              className={`cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700 ${theme === "system" ? "bg-accent dark:bg-gray-600" : ""}`}
          >
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}