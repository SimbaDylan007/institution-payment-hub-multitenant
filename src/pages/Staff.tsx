import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Home, Plus, Search, Edit, Trash2, Users, UserCheck, UserX, UploadCloud, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import StaffForm from "@/components/forms/StaffForm";
import { apiFetch } from "../utils/apiClient";

// --- Interfaces ---
interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employmentStatus: string; // CORRECTED: This matches the backend model
  hireDate: string;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  number: number; // Current page index
  totalElements: number;
}

export default function Staff() {
    const { user, isSuperAdmin, selectedInstitution } = useAuth();
    const [staffPage, setStaffPage] = useState<Page<Staff> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

    const fetchStaff = useCallback((page = 0, search = "") => {
        setLoading(true);
        const params = new URLSearchParams({
            page: page.toString(),
            size: '10',
            sort: 'firstName,asc',
            searchTerm: search
        });

        // --- TENANCY LOGIC ---
        if (isSuperAdmin && selectedInstitution && selectedInstitution !== 'all') {
            params.append('institutionId', selectedInstitution.id.toString());
        }

        const url = `http://localhost:8082/api/staff?${params.toString()}`;

        apiFetch(url)
            .then(res => res.json())
            .then(data => setStaffPage(data))
            .catch(() => toast.error('Failed to fetch staff data.'))
            .finally(() => setLoading(false));
    }, [isSuperAdmin, selectedInstitution]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff(currentPage, searchTerm);
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, fetchStaff]);

  const handleStaffSaved = () => {
    setIsFormDialogOpen(false);
    setSelectedStaff(null);
    toast.success("Staff member saved successfully!");
    fetchStaff(currentPage, searchTerm);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsFormDialogOpen(true);
  };

  const handleDeleteStaff = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const response = await apiFetch(`http://localhost:8082/api/staff/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Staff member deleted successfully');
          fetchStaff(currentPage, searchTerm);
        } else {
          toast.error('Failed to delete staff member');
        }
      } catch (error) {
        // The error toast is already handled in apiFetch, but you could add specific logic here if needed.
        console.error('Error deleting staff member:', error);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) setImportFile(event.target.files[0]);
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.warning("Please select a file.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const response = await apiFetch('http://localhost:8082/api/staff/bulk-upload', {
        method: 'POST',
        body: formData,
        // No 'Content-Type' header needed, the browser will set it correctly for FormData
      });

      if (response.ok) {
        const newStaff = await response.json();
        toast.success(`${newStaff.length} staff members imported successfully!`);
        setIsImportDialogOpen(false);
        setImportFile(null);
        fetchStaff(); // Refresh list to page 0
      } else {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Failed to import staff.");
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "employeeId,firstName,lastName,email,phone,department,position,hireDate(yyyy-MM-dd)\n";
    const example = "EMP001,Jane,Smith,jane.smith@school.com,0987654321,Academics,Senior Teacher,2020-08-01\n";
    const blob = new Blob([headers, example], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "staff_import_template.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div><h1 className="text-2xl font-bold">Staff Management</h1><p className="text-gray-300">Manage staff members and their information</p></div>
            <div className="flex gap-2">
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}><DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><UploadCloud className="h-4 w-4 mr-2"/>Import Staff</Button></DialogTrigger><DialogContent className="bg-gray-900 text-white border-gray-700"><DialogHeader><DialogTitle>Bulk Import Staff</DialogTitle></DialogHeader><div className="space-y-4 py-4"><p className="text-sm text-gray-400">Upload a CSV or Excel file with staff data.</p><Button variant="outline" onClick={handleDownloadTemplate} className="w-full gap-2"><Download size={16}/>Download CSV Template</Button><div><Label htmlFor="staffFile">Upload File</Label><Input id="staffFile" type="file" onChange={handleFileChange} accept=".csv, .xlsx" /></div><div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button><Button onClick={handleImportSubmit} disabled={loading || !importFile}>{loading ? "Importing..." : "Start Import"}</Button></div></div></DialogContent></Dialog>
              <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setSelectedStaff(null); setIsFormDialogOpen(isOpen); }}><DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700" onClick={() => setSelectedStaff(null)}><Plus className="h-4 w-4 mr-2"/>Add Staff</Button></DialogTrigger><DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700"><DialogHeader><DialogTitle>{selectedStaff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle></DialogHeader><StaffForm staff={selectedStaff} onSuccess={handleStaffSaved} onCancel={() => setIsFormDialogOpen(false)} /></DialogContent></Dialog>
              <Button asChild className="bg-purple-600 hover:bg-purple-700"><Link to="/dashboard" className="flex items-center gap-2"><Home className="h-4 w-4"/>Dashboard</Link></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-white"><Users className="h-5 w-5" />Total Staff</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-400">{staffPage?.totalElements || 0}</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-white"><UserCheck className="h-5 w-5" />Active Staff</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-400">{/* Requires separate API endpoint for accuracy */}</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-white"><UserX className="h-5 w-5" />Inactive Staff</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-400">{/* Requires separate API endpoint for accuracy */}</div></CardContent></Card>
          </div>

          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700 mb-6"><CardContent className="p-6"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search staff by name, email, department, or position..." className="pl-10 bg-gray-800 border-gray-600 text-white" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(0);}} /></div></CardContent></Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
            <CardHeader><CardTitle className="text-white">Staff Members</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto"><Table><TableHeader><TableRow className="border-gray-700"><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Department</TableHead><TableHead>Position</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
                {loading ? (<tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>)
                    : staffPage?.content.map((staffMember) => (
                        <TableRow key={staffMember.id} className="border-gray-700">
                          <TableCell>{staffMember.firstName} {staffMember.lastName}</TableCell><TableCell>{staffMember.email}</TableCell>
                          <TableCell>{staffMember.phone}</TableCell><TableCell>{staffMember.department}</TableCell>
                          <TableCell>{staffMember.position}</TableCell><TableCell><Badge variant={staffMember.employmentStatus?.toLowerCase() === 'active' ? 'default' : 'secondary'}>{staffMember.employmentStatus}</Badge></TableCell>
                          <TableCell><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => handleEditStaff(staffMember)}><Edit className="h-4 w-4"/></Button><Button size="sm" variant="outline" onClick={() => handleDeleteStaff(staffMember.id)}><Trash2 className="h-4 w-4"/></Button></div></TableCell>
                        </TableRow>
                    ))}
              </TableBody></Table></div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <span className="text-sm text-gray-400">Page {staffPage ? staffPage.number + 1 : 0} of {staffPage?.totalPages || 0}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={!staffPage || currentPage >= staffPage.totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(staffPage!.totalPages - 1)} disabled={!staffPage || currentPage >= staffPage.totalPages - 1}><ChevronsRight className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  );
}