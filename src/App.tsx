import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StudentManagement from "./pages/StudentManagement";
import Students from "@/pages/Students";
import Staff from "@/pages/Staff";
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
import Financials from "@/pages/Financials.tsx";
import PaymentAllocation from './pages/PaymentAllocation';
import AuditTrail from './pages/AuditTrail';
import MainReports from "./pages/MainReports";
import ProtectedRoute from "./components/ProtectedRoute";
import AccessDeniedPage from "./pages/AccessDeniedPage"

const queryClient = new QueryClient();

function AppContent() {
    return (
        <Router>
            <Routes>
                {/* --- Public Routes --- */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />
                <Route path="*" element={<NotFound />} />

                {/* --- Generic Authenticated User Route --- */}
                {/* Any logged-in user can see the dashboard */}
                <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_IT_ADMIN", "ROLE_FINANCE_ADMIN", "ROLE_ADMINISTRATOR", "ROLE_TEACHER", "ROLE_STUDENT", "ROLE_SUPER_ADMIN"]} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/student-portal" element={<StudentPortal />} />
                </Route>

                {/* --- Super Admin & Admin Only Routes --- */}
                <Route element={<ProtectedRoute allowedRoles={["ROLE_SUPER_ADMIN", "ROLE_ADMIN"]} />}>
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/audit-trail" element={<AuditTrail />} />
                    <Route path="/main-reports" element={<MainReports />} />
                    <Route path="/facilities" element={<Facilities />} />
                </Route>

                {/* --- Admin & IT Admin Routes --- */}
                <Route element={<ProtectedRoute allowedRoles={["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_IT_ADMIN"]} />}>
                    <Route path="/student-management" element={<StudentManagement />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/staff" element={<Staff />} />
                </Route>

                {/* --- Admin & Finance Admin Routes --- */}
                <Route element={<ProtectedRoute allowedRoles={["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_FINANCE_ADMIN"]} />}>
                    <Route path="/financials" element={<Financials />} />
                    <Route path="/payment-allocation" element={<PaymentAllocation />} />
                </Route>

                {/* --- Routes for Academics Staff --- */}
                <Route element={<ProtectedRoute allowedRoles={["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_ADMINISTRATOR", "ROLE_TEACHER"]} />}>
                    <Route path="/academics" element={<Academics />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/communication" element={<Communication />} />
                    <Route path="/reports" element={<Reports />} />
                </Route>

            </Routes>
        </Router>
    );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
