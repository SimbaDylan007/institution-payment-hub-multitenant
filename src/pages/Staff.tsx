
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Home, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAllStaff, deleteStaff } from "@/services/staffApiService";
import StaffForm from "@/components/forms/StaffForm";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  employmentStatus: string;
  salary?: number;
}

export default function Staff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, departmentFilter, statusFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await getAllStaff();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staff;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(member => member.employmentStatus === statusFilter);
    }

    setFilteredStaff(filtered);
  };

  const handleDelete = async (staffId: number) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(staffId);
        toast.success('Staff member deleted successfully');
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.error('Failed to delete staff member');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedStaff(null);
    fetchStaff();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'terminated': return 'bg-red-500';
      case 'on_leave': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const departments = Array.from(new Set(staff.map(s => s.department).filter(Boolean)));

  return (
    <div className="min-h-screen bg-[#121828] text-white dark:bg-gray-100 dark:text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Staff Management</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Manage staff records and information
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{staff.length}</div>
              <p className="text-sm text-gray-400">Total Staff</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {staff.filter(s => s.employmentStatus === 'ACTIVE').length}
              </div>
              <p className="text-sm text-gray-400">Active Staff</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {staff.filter(s => s.employmentStatus === 'ON_LEAVE').length}
              </div>
              <p className="text-sm text-gray-400">On Leave</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">{departments.length}</div>
              <p className="text-sm text-gray-400">Departments</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200 mb-6">
          <CardHeader>
            <CardTitle>Filter Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200">
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStaff.map((member) => (
                  <div key={member.id} className="bg-[#252e3e] dark:bg-gray-50 p-4 rounded-lg border border-gray-700 dark:border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{member.firstName} {member.lastName}</h3>
                          <Badge className={`${getStatusBadgeColor(member.employmentStatus)} text-white`}>
                            {member.employmentStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-400">
                          <div><span className="font-medium">ID:</span> {member.employeeId}</div>
                          <div><span className="font-medium">Department:</span> {member.department || 'N/A'}</div>
                          <div><span className="font-medium">Position:</span> {member.position || 'N/A'}</div>
                          <div><span className="font-medium">Email:</span> {member.email}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStaff(member);
                            setShowViewDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStaff(member);
                            setShowEditForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(member.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredStaff.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-400">
                    No staff members found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Staff Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <StaffForm onSuccess={handleFormSuccess} onCancel={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <StaffForm 
              staff={selectedStaff} 
              onSuccess={handleFormSuccess} 
              onCancel={() => setShowEditForm(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Staff Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name:</label>
                  <p className="text-gray-600">{selectedStaff.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name:</label>
                  <p className="text-gray-600">{selectedStaff.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Employee ID:</label>
                  <p className="text-gray-600">{selectedStaff.employeeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email:</label>
                  <p className="text-gray-600">{selectedStaff.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone:</label>
                  <p className="text-gray-600">{selectedStaff.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Department:</label>
                  <p className="text-gray-600">{selectedStaff.department || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Position:</label>
                  <p className="text-gray-600">{selectedStaff.position || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <Badge className={`${getStatusBadgeColor(selectedStaff.employmentStatus)} text-white mt-1`}>
                    {selectedStaff.employmentStatus.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Salary:</label>
                  <p className="text-gray-600">${selectedStaff.salary?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
