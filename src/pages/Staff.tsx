
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Plus, Edit, Eye, Archive, Calendar, FileText, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Staff {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  hireDate: string;
  department: string;
  position: string;
  employmentStatus: string;
  salary?: number;
  qualifications?: string;
  specializations?: string;
}

interface StaffAttendance {
  id: number;
  attendanceDate: string;
  timeIn?: string;
  timeOut?: string;
  status: string;
  hoursWorked?: number;
  overtimeHours?: number;
}

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  applicationDate: string;
}

export default function Staff() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [attendance, setAttendance] = useState<StaffAttendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockStaff: Staff[] = [
    {
      id: 1,
      employeeId: "EMP001",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@school.edu",
      phone: "+1234567890",
      dateOfBirth: "1985-03-15",
      gender: "Female",
      address: "123 Teacher Lane, City",
      hireDate: "2020-08-15",
      department: "Mathematics",
      position: "Senior Teacher",
      employmentStatus: "ACTIVE",
      salary: 65000,
      qualifications: "M.Ed Mathematics, B.Sc Mathematics",
      specializations: "Calculus, Statistics"
    },
    {
      id: 2,
      employeeId: "EMP002",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@school.edu",
      phone: "+1234567891",
      dateOfBirth: "1982-07-22",
      gender: "Male",
      address: "456 Science Ave, City",
      hireDate: "2019-09-01",
      department: "Science",
      position: "Department Head",
      employmentStatus: "ACTIVE",
      salary: 75000,
      qualifications: "Ph.D Physics, M.Sc Physics",
      specializations: "Quantum Physics, Laboratory Management"
    },
    {
      id: 3,
      employeeId: "EMP003",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@school.edu",
      phone: "+1234567892",
      dateOfBirth: "1990-01-10",
      gender: "Female",
      address: "789 Literature St, City",
      hireDate: "2021-01-15",
      department: "English",
      position: "Teacher",
      employmentStatus: "ON_LEAVE",
      salary: 55000,
      qualifications: "M.A English Literature, B.A English",
      specializations: "Creative Writing, Literature Analysis"
    }
  ];

  const mockAttendance: StaffAttendance[] = [
    {
      id: 1,
      attendanceDate: "2024-03-10",
      timeIn: "08:00",
      timeOut: "16:30",
      status: "PRESENT",
      hoursWorked: 8.5,
      overtimeHours: 0.5
    },
    {
      id: 2,
      attendanceDate: "2024-03-09",
      timeIn: "08:15",
      timeOut: "16:00",
      status: "LATE",
      hoursWorked: 7.75,
      overtimeHours: 0
    }
  ];

  const mockLeaveRequests: LeaveRequest[] = [
    {
      id: 1,
      leaveType: "SICK",
      startDate: "2024-03-15",
      endDate: "2024-03-17",
      totalDays: 3,
      reason: "Medical appointment and recovery",
      status: "APPROVED",
      applicationDate: "2024-03-10"
    },
    {
      id: 2,
      leaveType: "ANNUAL",
      startDate: "2024-04-01",
      endDate: "2024-04-05",
      totalDays: 5,
      reason: "Family vacation",
      status: "PENDING",
      applicationDate: "2024-03-08"
    }
  ];

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staffMembers, searchTerm, departmentFilter, statusFilter]);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      setStaffMembers(mockStaff);
      toast({
        title: "Success",
        description: "Staff members loaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staffMembers;

    if (searchTerm) {
      filtered = filtered.filter(staff =>
        staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== "ALL") {
      filtered = filtered.filter(staff => staff.department === departmentFilter);
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(staff => staff.employmentStatus === statusFilter);
    }

    setFilteredStaff(filtered);
  };

  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setAttendance(mockAttendance);
    setLeaveRequests(mockLeaveRequests);
  };

  const handleDeleteStaff = async (staffId: number) => {
    try {
      setStaffMembers(staffMembers.filter(s => s.id !== staffId));
      toast({
        title: "Success",
        description: "Staff member archived successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive staff member",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: "bg-green-500",
      INACTIVE: "bg-yellow-500",
      TERMINATED: "bg-red-500",
      ON_LEAVE: "bg-blue-500"
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-500";
  };

  const getStatusCounts = () => {
    return {
      total: staffMembers.length,
      active: staffMembers.filter(s => s.employmentStatus === "ACTIVE").length,
      onLeave: staffMembers.filter(s => s.employmentStatus === "ON_LEAVE").length,
      inactive: staffMembers.filter(s => s.employmentStatus === "INACTIVE").length
    };
  };

  const statusCounts = getStatusCounts();

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{statusCounts.total}</div>
              <p className="text-sm text-gray-400">Total Staff</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{statusCounts.active}</div>
              <p className="text-sm text-gray-400">Active Staff</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">{statusCounts.onLeave}</div>
              <p className="text-sm text-gray-400">On Leave</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">{statusCounts.inactive}</div>
              <p className="text-sm text-gray-400">Inactive</p>
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
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Directory
                </CardTitle>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#252e3e] dark:bg-gray-50 border-gray-700 dark:border-gray-300"
                    />
                  </div>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="bg-[#252e3e] dark:bg-gray-50 border border-gray-700 dark:border-gray-300 rounded px-3 py-2"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Administration">Administration</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#252e3e] dark:bg-gray-50 border border-gray-700 dark:border-gray-300 rounded px-3 py-2"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStaff.map((staff) => (
                      <div key={staff.id} className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg border border-gray-700 dark:border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {staff.firstName} {staff.lastName}
                              </h3>
                              <Badge className={`${getStatusBadge(staff.employmentStatus)} text-white`}>
                                {staff.employmentStatus}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Employee ID:</span>
                                <p className="font-medium">{staff.employeeId}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Department:</span>
                                <p className="font-medium">{staff.department}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Position:</span>
                                <p className="font-medium">{staff.position}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Email:</span>
                                <p className="font-medium">{staff.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewStaff(staff)}
                              className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-500 text-white hover:bg-green-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteStaff(staff.id)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                {selectedStaff ? (
                  <div className="space-y-6">
                    <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">
                        Attendance Records - {selectedStaff.firstName} {selectedStaff.lastName}
                      </h3>
                      <div className="space-y-3">
                        {attendance.map((record) => (
                          <div key={record.id} className="bg-[#1A1F2C] dark:bg-white p-3 rounded border border-gray-700 dark:border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Date:</span>
                                <p className="font-medium">{record.attendanceDate}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Time In:</span>
                                <p className="font-medium">{record.timeIn}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Time Out:</span>
                                <p className="font-medium">{record.timeOut}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Status:</span>
                                <Badge className={`${record.status === 'PRESENT' ? 'bg-green-500' : record.status === 'LATE' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                  {record.status}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-gray-400">Hours:</span>
                                <p className="font-medium">{record.hoursWorked}h</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p>Select a staff member to view their attendance records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Leave Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStaff ? (
                  <div className="space-y-6">
                    <div className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">
                        Leave Requests - {selectedStaff.firstName} {selectedStaff.lastName}
                      </h3>
                      <div className="space-y-3">
                        {leaveRequests.map((request) => (
                          <div key={request.id} className="bg-[#1A1F2C] dark:bg-white p-3 rounded border border-gray-700 dark:border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Type:</span>
                                <p className="font-medium">{request.leaveType}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Duration:</span>
                                <p className="font-medium">{request.startDate} to {request.endDate}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Days:</span>
                                <p className="font-medium">{request.totalDays} days</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Status:</span>
                                <Badge className={`${request.status === 'APPROVED' ? 'bg-green-500' : request.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                  {request.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-gray-400">Reason:</span>
                              <p className="font-medium">{request.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p>Select a staff member to view their leave requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payroll Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Salary Management</h3>
                    <div className="space-y-2">
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Total Monthly Payroll</span>
                          <span className="font-bold text-green-400">$195,000</span>
                        </div>
                      </div>
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Average Salary</span>
                          <span className="font-bold text-blue-400">$65,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Payroll Processing</h3>
                    <div className="space-y-2">
                      <Button className="w-full bg-green-500 hover:bg-green-600">
                        Generate Payslips
                      </Button>
                      <Button className="w-full bg-blue-500 hover:bg-blue-600">
                        Process Payments
                      </Button>
                      <Button className="w-full bg-purple-500 hover:bg-purple-600">
                        Tax Calculations
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Performance Reviews</h3>
                    <div className="space-y-2">
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Completed Reviews</span>
                          <Badge className="bg-green-500 text-white">45</Badge>
                        </div>
                      </div>
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Pending Reviews</span>
                          <Badge className="bg-yellow-500 text-white">12</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Professional Development</h3>
                    <div className="space-y-2">
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Training Programs</span>
                          <Badge className="bg-blue-500 text-white">8</Badge>
                        </div>
                      </div>
                      <div className="bg-[#252e3e] dark:bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span>Certifications</span>
                          <Badge className="bg-purple-500 text-white">23</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
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
