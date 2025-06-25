
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StudentManagement from "./pages/StudentManagement";
import Students from "./pages/Students";
import Staff from "./pages/Staff";
import Academics from "./pages/Academics";
import Finance from "./pages/Finance";
import Library from "./pages/Library";
import Schedule from "./pages/Schedule";
import Communication from "./pages/Communication";
import Reports from "./pages/Reports";
import Facilities from "./pages/Facilities";
import Settings from "./pages/Settings";
import StudentPortal from "./pages/StudentPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/student-management" element={<StudentManagement />} />
              <Route path="/students" element={<Students />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/library" element={<Library />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/communication" element={<Communication />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/student-portal" element={<StudentPortal />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
