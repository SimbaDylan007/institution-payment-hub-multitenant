
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Home, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Students() {
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
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage student information, enrollment, and records
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              asChild
            >
              <Link to="/student-management" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Student
              </Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Student Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Student directory and search functionality will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Student profiles and demographics</li>
                    <li>• Enrollment status tracking</li>
                    <li>• Academic history</li>
                    <li>• Parent/guardian information</li>
                    <li>• Medical records</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Quick Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  All Students
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Active Enrollment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  By Grade Level
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Recent Admissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
