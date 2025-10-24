// src/pages/PaymentAllocation.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Banknote, UserCheck, LayoutDashboard, Download, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CSVLink } from "react-csv";
import { apiFetch } from "@/utils/apiClient";
import { academicYears, semesters, currentAcademicYear, currentSemester } from '@/config/academicConfig';
import { PaymentAlert, StudentBalance, Page } from '@/types';


// --- Helper Components ---
const PaymentTable = ({ payments, loading, onAllocateClick }: { payments: PaymentAlert[], loading: boolean, onAllocateClick?: (p: PaymentAlert) => void }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left mt-4">
            <thead><tr className="border-b border-red-600"><th className="p-2">Date</th><th className="p-2">Amount</th><th className="p-2">Narrative / Student</th><th className="p-2 text-center">Action</th></tr></thead>
            <tbody>
            {loading ? (<tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>)
                : !payments || payments.length === 0 ? (<tr><td colSpan={4} className="text-center p-4 text-gray-400">No payments found.</td></tr>)
                    : payments.map(p => (
                        <tr key={p.id} className="border-b border-red-800 hover:bg-red-900/50">
                            <td className="p-2 whitespace-nowrap">{p.transactionDate ? p.transactionDate.split(' ')[0] : 'N/A'}</td>
                            <td className="p-2 font-bold text-green-400 whitespace-nowrap">{p.currency} ${(p.amount || 0).toFixed(2)}</td>
                            <td className="p-2 text-sm max-w-md truncate" title={p.narrative}>{p.narrative || `${p.studentName} (${p.regNumber})`}</td>
                            <td className="p-2 text-center">{onAllocateClick && <Button size="sm" onClick={() => onAllocateClick(p)}>Allocate</Button>}</td>
                        </tr>
                    ))}
            </tbody>
        </table>
    </div>
);

const PaginationControls = ({ page, onPageChange }: { page: Page<any> | null, onPageChange: (page: number) => void }) => {
    if (!page || page.totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <span className="text-sm text-gray-400">Page {page.number + 1} of {page.totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => onPageChange(0)} disabled={page.number === 0}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page.number - 1)} disabled={page.number === 0}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page.number + 1)} disabled={page.number >= page.totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page.totalPages - 1)} disabled={page.number >= page.totalPages - 1}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
    );
};

export default function PaymentAllocation() {
    const { user } = useAuth();
    const [paymentPage, setPaymentPage] = useState<Page<PaymentAlert> | null>(null);
    const [allStudents, setAllStudents] = useState<StudentBalance[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentAlert | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentBalance | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('PENDING');
    const [currentPage, setCurrentPage] = useState(0);
    const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
    const [allocationYear, setAllocationYear] = useState(currentAcademicYear);
    const [allocationSemester, setAllocationSemester] = useState(currentSemester);
    const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);


    const fetchPayments = useCallback((status: string, page: number, searchTerm: string) => {
        setLoading(true);
        const url = `http://194.163.141.113:8082/api/financials/payments/status?status=${status}&page=${page}&size=10&searchTerm=${encodeURIComponent(searchTerm)}`;
        apiFetch(url).then(res => res.json()).then(data => setPaymentPage(data))
            .catch(() => toast.error(`Failed to fetch ${status.toLowerCase()} payments.`))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user) {
            fetchPayments(activeTab, currentPage, paymentSearchTerm);
            fetchAllStudents();
        }
    }, [user, activeTab, currentPage, paymentSearchTerm, fetchPayments]);

    // useEffect(() => {
    //     if(user) { fetchAllStudents(); }
    // }, [user]);

    const fetchAllStudents = async () => {
        try {
            const res = await apiFetch('http://194.163.141.113:8082/api/financials/students/balances');
            if (res.ok) setAllStudents(await res.json());
        } catch (e) { console.error("Could not fetch students for search"); }
    };

    const handleAllocateClick = (payment: PaymentAlert) => {
        setSelectedPayment(payment);
        setStudentSearchTerm(payment.regNumber || '');
        setSelectedStudent(null);
        setIsDialogOpen(true);
    };


    const handleConfirmAllocation = async () => {
        if (!selectedPayment || !selectedStudent) return toast.warning("You must select a payment and a student.");
        setLoading(true);
        try {
            const response = await apiFetch('http://194.163.141.113:8082/api/financials/payments/allocate', {
                method: 'POST',
                body: JSON.stringify({
                    paymentAlertId: selectedPayment.id,
                    studentId: selectedStudent.studentId,
                    academicYear: allocationYear,
                    semester: allocationSemester
                })
            });
            if (response.ok) {
                toast.success(`Payment allocated to ${selectedStudent.firstName}`);
                setIsDialogOpen(false);
                setSelectedPayment(null);
                setSelectedStudent(null);
                fetchPayments(activeTab, currentPage, paymentSearchTerm);
            } else { throw new Error("Allocation failed on the server."); }
        } catch (error) { toast.error((error as Error).message); }
        finally { setLoading(false); }
    };


    const handleTabChange = (status: string) => {
        setActiveTab(status);
        setCurrentPage(0);
        setPaymentSearchTerm('');
    };

    const handleExportExcel = () => {
        const dataToExport = paymentPage?.content || [];
        if (dataToExport.length === 0) {
            toast.warning("No data to export.");
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(data, `payments_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };



    const filteredStudents = useMemo(() => {
        if (!studentSearchTerm) return [];
        return allStudents.filter(s =>
            s.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearchTerm.toLowerCase())
        ).slice(0, 5);
    }, [allStudents, studentSearchTerm]);

    const handleStudentSelect = (student: StudentBalance) => {
        setSelectedStudent(student);
        setStudentSearchTerm(`${student.firstName} ${student.lastName} (${student.studentId})`);
        setIsSearchPopoverOpen(false); // Close the popover on selection
    };

    if (!user) return <Navigate to="/" replace />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-white-900 text-white flex flex-col">
            <Header />
            <main className="flex-1 px-4 py-8">
                <Card className="bg-gradient-to-br from-red-900/50 to-white-900/50 border-red-700">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2 text-white"><Banknote />Payments Reconciliation</CardTitle>
                            <Button asChild className="bg-red-600 hover:bg-red-700"><Link to="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</Link></Button>
                        </div>
                        <p className="text-gray-400 pt-2">Review and allocate incoming bank payments.</p>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="PENDING" onValueChange={handleTabChange} value={activeTab}>
                            <TabsList className="grid w-full grid-cols-3 bg-red-900/50 border-red-700">
                                <TabsTrigger value="PENDING">Needs Manual Allocation</TabsTrigger>
                                <TabsTrigger value="AUTO_ALLOCATED">Auto-Allocated</TabsTrigger>
                                <TabsTrigger value="ALLOCATED">Manually Allocated</TabsTrigger>
                            </TabsList>
                            <div className="flex justify-between items-center mt-4">
                                <Input placeholder="Filter by name, narrative, reference..." className="bg-red-800/80 max-w-sm" value={paymentSearchTerm} onChange={(e) => { setPaymentSearchTerm(e.target.value); setCurrentPage(0); }}/>
                                <div className="flex gap-2">
                                    <CSVLink data={paymentPage?.content || []} filename={`payments_${activeTab}.csv`} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-4 py-2 bg-white-600 hover:bg-white-700"><Download size={16} /> Export CSV</CSVLink>
                                    <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 flex items-center gap-2"><Download size={16} /> Export Excel</Button>
                                </div>
                            </div>
                            <PaymentTable payments={paymentPage?.content || []} loading={loading} onAllocateClick={activeTab === 'PENDING' ? handleAllocateClick : undefined} />
                            <PaginationControls page={paymentPage} onPageChange={setCurrentPage} />
                        </Tabs>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-red-900 border-red-700 text-white">
                    <DialogHeader><DialogTitle>Allocate Payment</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <p>Payment of <strong className="text-green-400">{selectedPayment?.currency} ${(selectedPayment?.amount || 0).toFixed(2)}</strong> from <strong className="text-white-400">{selectedPayment?.narrative}</strong></p>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>For Academic Year</Label><Select value={allocationYear} onValueChange={setAllocationYear}><SelectTrigger className="bg-red-800"><SelectValue /></SelectTrigger><DialogPortal><SelectContent className="bg-red-800">{academicYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}</SelectContent></DialogPortal></Select></div>
                            <div><Label>For Term / Semester</Label><Select value={allocationSemester} onValueChange={setAllocationSemester}><SelectTrigger className="bg-red-800"><SelectValue /></SelectTrigger><DialogPortal><SelectContent className="bg-red-800">{semesters.map(term => <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>)}</SelectContent></DialogPortal></Select></div>
                        </div>
                        <div>
                            <Label htmlFor="studentSearch">Search for Student to Allocate To</Label>
                            {/* --- THIS IS THE CORRECTED STRUCTURE --- */}
                            <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <div className="relative">
                                        <Input
                                            id="studentSearch"
                                            value={studentSearchTerm}
                                            onChange={e => setStudentSearchTerm(e.target.value)}
                                            onFocus={() => setIsSearchPopoverOpen(true)} // Open on focus
                                            placeholder="Search by name or ID..."
                                            className="bg-red-800"
                                            autoComplete="off"
                                        />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-[var(--radix-popover-trigger-width)] p-1 border-red-700 bg-red-900 text-white"
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                    align="start"
                                >
                                    {filteredStudents.length > 0 ? (
                                        <div className="space-y-1">
                                            {filteredStudents.map(s => (
                                                <div key={s.id} onMouseDown={() => handleStudentSelect(s)} className="p-2 rounded-md cursor-pointer hover:bg-red-700/50">
                                                    <p className="font-semibold">{s.firstName} {s.lastName} ({s.studentId})</p>
                                                    <div className="text-sm text-gray-400">
                                                        {s.balances && Object.entries(s.balances).map(([currency, value]) => (
                                                            <span key={currency} className={`mr-3 ${value >= 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                                {currency}: {value.toFixed(2)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-2 text-center text-sm text-gray-400">No students found.</div>
                                    )}
                                </PopoverContent>
                            </Popover>

                        </div>

                        {selectedStudent && (<div className="p-3 bg-green-900/50 border-green-700 rounded-md text-center"><p className="font-bold">Allocating to: {selectedStudent.firstName} {selectedStudent.lastName}</p></div>)}
                        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleConfirmAllocation} disabled={!selectedStudent || loading}><UserCheck className="mr-2 h-4 w-4" /> Confirm Allocation</Button></div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}