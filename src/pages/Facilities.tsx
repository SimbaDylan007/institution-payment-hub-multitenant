// src/pages/Facilities.tsx

import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Home, Building, Trash2, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import AddFacilityModal from "@/components/forms/AddFacilityModal";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";

// --- Interfaces ---
interface Facility { id: number; name: string; description?: string; type: string; capacity?: number; location?: string; status: string; equipment?: string; }
interface Page<T> { content: T[]; totalPages: number; number: number; }

export default function Facilities() {
    const { user, isSuperAdmin, selectedInstitution } = useAuth();
  const [facilityPage, setFacilityPage] = useState<Page<Facility> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'ALL', type: 'ALL', searchTerm: '' });
  const [currentPage, setCurrentPage] = useState(0);

    const fetchFacilities = useCallback((page = 0, currentFilters = filters) => {
        setLoading(true);
        const params = new URLSearchParams({
            page: page.toString(),
            size: '10',
            sort: 'name,asc',
            ...currentFilters
        });

        // --- TENANCY LOGIC ---
        if (isSuperAdmin && selectedInstitution && selectedInstitution !== 'all') {
            params.append('institutionId', selectedInstitution.id.toString());
        }

        apiFetch(`/api/facilities?${params.toString()}`)
            .then(res => res.json())
            .then(data => setFacilityPage(data))
            .catch(() => toast.error("Failed to fetch facilities."))
            .finally(() => setLoading(false));
    }, [filters, isSuperAdmin, selectedInstitution]);

    useEffect(() => {
        const timer = setTimeout(() => fetchFacilities(currentPage, filters), 300);
        return () => clearTimeout(timer);
    }, [currentPage, filters, fetchFacilities]);

    useEffect(() => {
        const timer = setTimeout(() => fetchFacilities(currentPage, filters), 300);
        return () => clearTimeout(timer);
    }, [currentPage, filters, fetchFacilities, selectedInstitution]);

    const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this facility?")) return;
    try {
      const response = await apiFetch(`http://194.163.141.113:8082/api/facilities/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success("Facility deleted successfully.");
        fetchFacilities(currentPage); // Refresh
      } else {
        throw new Error("Failed to delete facility.");
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

    const canViewPage = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';


    if (!user) return <Navigate to="/" replace />;
    // if (!canViewPage) {
    //     return <Navigate to="/access-denied" replace />;
    // }

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-white-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div><h1 className="text-2xl font-bold">Facilities Management</h1><p className="text-gray-300">Manage school infrastructure and resources</p></div>
            <div className="flex gap-2"><AddFacilityModal onSuccess={() => fetchFacilities(currentPage)} /><Button asChild><Link to="/dashboard" className="flex items-center gap-2"><Home size={16}/>Dashboard</Link></Button></div>
          </div>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building/>Facility Directory</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <Input placeholder="Search by name or location..." value={filters.searchTerm} onChange={e => setFilters(f => ({...f, searchTerm: e.target.value}))} className="dark:bg-gray-800"/>
                <Select value={filters.type} onValueChange={v => setFilters(f => ({...f, type: v}))}><SelectTrigger className="dark:bg-gray-800"><SelectValue/></SelectTrigger><SelectContent className="dark:bg-gray-800"><SelectItem value="ALL">All Types</SelectItem><SelectItem value="CLASSROOM">Classroom</SelectItem><SelectItem value="LABORATORY">Laboratory</SelectItem><SelectItem value="LIBRARY">Library</SelectItem><SelectItem value="AUDITORIUM">Auditorium</SelectItem><SelectItem value="SPORTS">Sports</SelectItem><SelectItem value="OFFICE">Office</SelectItem></SelectContent></Select>
                <Select value={filters.status} onValueChange={v => setFilters(f => ({...f, status: v}))}><SelectTrigger className="dark:bg-gray-800"><SelectValue/></SelectTrigger><SelectContent className="dark:bg-gray-800"><SelectItem value="ALL">All Statuses</SelectItem><SelectItem value="AVAILABLE">Available</SelectItem><SelectItem value="OCCUPIED">Occupied</SelectItem><SelectItem value="MAINTENANCE">Maintenance</SelectItem></SelectContent></Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {loading && (<tr><td colSpan={6} className="text-center p-8">Loading facilities...</td></tr>)}
                    {!loading && facilityPage?.content.map(facility => (
                        <TableRow key={facility.id} className="border-gray-800">
                          <TableCell className="font-medium">{facility.name}</TableCell>
                          <TableCell>{facility.type}</TableCell>
                          <TableCell>{facility.location}</TableCell>
                          <TableCell>{facility.capacity}</TableCell>
                          <TableCell><Badge variant={facility.status === 'AVAILABLE' ? 'default' : (facility.status === 'MAINTENANCE' ? 'destructive' : 'secondary')}>{facility.status}</Badge></TableCell>
                          <TableCell className="flex justify-center gap-2">
                            <AddFacilityModal facilityToEdit={facility} onSuccess={() => fetchFacilities(currentPage)} />
                            <Button variant="outline" size="sm" onClick={() => handleDelete(facility.id)}><Trash2 size={16}/></Button>
                          </TableCell>
                        </TableRow>
                    ))}
                    {!loading && facilityPage?.content.length === 0 && (<tr><td colSpan={6} className="text-center p-8 text-gray-400">No facilities found matching your criteria.</td></tr>)}
                  </TableBody>
                </Table>
              </div>
              {facilityPage && facilityPage.totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <span className="text-sm text-gray-400">Page {facilityPage.number + 1} of {facilityPage.totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}><ChevronsLeft size={16}/></Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}><ChevronLeft size={16}/></Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= facilityPage.totalPages - 1}><ChevronRight size={16}/></Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(facilityPage.totalPages - 1)} disabled={currentPage >= facilityPage.totalPages - 1}><ChevronsRight size={16}/></Button>
                  </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
  );
}