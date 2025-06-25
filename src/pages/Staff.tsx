
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Plus, UserCheck, Search, Filter, Calendar, DollarSign } from "lucide-react";

export default function Staff() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const mockStaff = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      position: "Mathematics Teacher",
      department: "Science",
      email: "sarah.johnson@school.edu",
      phone: "+1 234-567-8901",
      status: "Active"
    },
    {
      id: "2", 
      name: "Prof. Michael Chen",
      position: "Physics Teacher",
      department: "Science",
      email: "michael.chen@school.edu",
      phone: "+1 234-567-8902",
      status: "Active"
    },
    {
      id: "3",
      name: "Ms. Emily Davis",
      position: "English Teacher", 
      department: "Languages",
      email: "emily.davis@school.edu",
      phone: "+1 234-567-8903",
      status: "On Leave"
    }
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">89</div>
              <p className="text-sm text-gray-400">Total Staff</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">76</div>
              <p className="text-sm text-gray-400">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">8</div>
              <p className="text-sm text-gray-400">On Leave</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">5</div>
              <p className="text-sm text-gray-400">New This Month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="directory">Staff Directory</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leave">Leave Management</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="directory">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Staff Directory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockStaff.map((staff) => (
                        <div key={staff.id} className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded border-gray-700 dark:border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{staff.name}</h3>
                              <p className="text-gray-400 dark:text-gray-600">{staff.position}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">{staff.department}</p>
                              <div className="mt-2 space-y-1 text-sm">
                                <p>📧 {staff.email}</p>
                                <p>📞 {staff.phone}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded text-xs ${
                                staff.status === 'Active' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-yellow-500 text-white'
                              }`}>
                                {staff.status}
                              </span>
                              <div className="mt-2 space-x-2">
                                <Button size="sm" variant="outline">Edit</Button>
                                <Button size="sm" variant="outline">View</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      All Staff
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Teaching Staff
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Administrative
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      By Department
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      On Leave
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Staff Attendance Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Staff attendance tracking system will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Daily attendance marking</li>
                    <li>• Attendance reports</li>
                    <li>• Late arrival tracking</li>
                    <li>• Overtime calculation</li>
                    <li>• Monthly summaries</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Leave management system will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Leave application submission</li>
                    <li>• Approval workflow</li>
                    <li>• Leave balance tracking</li>
                    <li>• Calendar integration</li>
                    <li>• Substitute teacher assignment</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payroll Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Payroll integration system will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Salary structure management</li>
                    <li>• Payslip generation</li>
                    <li>• Tax calculations</li>
                    <li>• Bonus and deduction tracking</li>
                    <li>• Bank integration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle>Performance Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <p>Performance tracking system will be implemented here.</p>
                  <p className="mt-2">Features to include:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>• Goal setting and tracking</li>
                    <li>• Performance reviews</li>
                    <li>• Training records</li>
                    <li>• Certification tracking</li>
                    <li>• Professional development</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
