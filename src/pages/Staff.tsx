
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Home, Plus, Search, Edit, Trash2, Users, UserCheck, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import StaffForm from "@/components/forms/StaffForm";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status: string;
}

export default function Staff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const filtered = staff.filter(s =>
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [staff, searchTerm]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(Array.isArray(data) ? data : []);
      } else {
        toast.error('Failed to fetch staff');
        setStaff([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error fetching staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSaved = (staffData: any) => {
    if (selectedStaff) {
      // Update existing staff
      setStaff(staff.map(s => s.id === selectedStaff.id ? { ...s, ...staffData } : s));
      toast.success('Staff updated successfully');
    } else {
      // Add new staff
      const newStaff = { ...staffData, id: Date.now() };
      setStaff([...staff, newStaff]);
      toast.success('Staff added successfully');
    }
    setIsDialogOpen(false);
    setSelectedStaff(null);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsDialogOpen(true);
  };

  const handleDeleteStaff = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/staff/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setStaff(staff.filter(s => s.id !== id));
          toast.success('Staff deleted successfully');
        } else {
          toast.error('Failed to delete staff');
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.error('Error deleting staff');
      }
    }
  };

  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'active').length;
  const inactiveStaff = staff.filter(s => s.status === 'inactive').length;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Staff Management</h1>
            <p className="text-gray-300">Manage staff members and their information</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => setSelectedStaff(null)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                  <DialogTitle>
                    {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </DialogTitle>
                </DialogHeader>
                <StaffForm
                  staff={selectedStaff}
                  onSave={handleStaffSaved}
                  onCancel={() => {
                    setIsDialogOpen(false);
                    setSelectedStaff(null);
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button className="bg-purple-600 text-white hover:bg-purple-700" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{totalStaff}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <UserCheck className="h-5 w-5" />
                Active Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{activeStaff}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <UserX className="h-5 w-5" />
                Inactive Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{inactiveStaff}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700 mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search staff by name, email, department, or position..."
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
          <CardHeader>
            <CardTitle className="text-white">Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-300">Loading staff...</div>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-300">No staff members found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Phone</TableHead>
                      <TableHead className="text-gray-300">Department</TableHead>
                      <TableHead className="text-gray-300">Position</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staffMember) => (
                      <TableRow key={staffMember.id} className="border-gray-700">
                        <TableCell className="text-white">
                          {staffMember.firstName} {staffMember.lastName}
                        </TableCell>
                        <TableCell className="text-gray-300">{staffMember.email}</TableCell>
                        <TableCell className="text-gray-300">{staffMember.phone}</TableCell>
                        <TableCell className="text-gray-300">{staffMember.department}</TableCell>
                        <TableCell className="text-gray-300">{staffMember.position}</TableCell>
                        <TableCell>
                          <Badge variant={staffMember.status === 'active' ? 'default' : 'secondary'}>
                            {staffMember.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditStaff(staffMember)}
                              className="border-blue-600 text-blue-400 hover:bg-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteStaff(staffMember.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-gradient-to-r from-purple-900 via-blue-900 to-black border-t border-purple-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-300">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
