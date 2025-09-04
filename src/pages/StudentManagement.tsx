
import Header from "@/components/Header";
import StudentRegistrationForm from "@/components/StudentRegistrationForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function StudentManagement() {
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
              Add or update student registration records for payment validation
            </p>
          </div>
          <Button
              className="bg-purple-500 text-white hover:bg-purple-600"
              asChild
          >
            <Link to="/dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StudentRegistrationForm />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-[#1A1F2C] dark:bg-white p-6 border border-gray-800 dark:border-gray-200 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">Instructions</h2>
              <div className="text-gray-400 dark:text-gray-600 space-y-4">
                <p>
                  Use this form to create or update student registration records in the system.
                </p>
                <p>
                  When adding a new student, make sure you provide the correct Institution ID and Registration Number.
                </p>
                <p>
                  If a student with the same Institution ID and Registration Number already exists, their record will be updated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} Pachedu Junior School
        </div>
      </footer>
    </div>
  );
}
