
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Home, Plus, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Staff() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#121828] text-white dark:bg-gray-100 dark:text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Staff Management</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage teaching and administrative staff
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-green-500 text-white hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
            <Button
              className="bg-purple-500 text-white hover:bg-purple-600"
              asChild
            >
              <Link to="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Staff Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-400 dark:text-gray-600">
              <p>Staff management system will be implemented here.</p>
              <p className="mt-2">Features to include:</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• Staff profiles and qualifications</li>
                <li>• Attendance and leave management</li>
                <li>• Payroll integration</li>
                <li>• Performance tracking</li>
                <li>• Timetable assignments</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
