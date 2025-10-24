// src/pages/MainReports.tsx

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, LayoutDashboard, ChevronsUpDown, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient";
import { academicYears, currentAcademicYear, semesters, currentSemester } from "@/config/academicConfig";
import { Link, Navigate } from "react-router-dom";
import { StudentBalance, FeeType } from "@/types";

// --- Constants ---
const reportOptions = [
    { label: "Financial Reports", options: [
            { value: 'FINANCIAL_STATEMENT', label: 'Student Financial Statement', formats: ['PDF', 'XLSX', 'CSV'] },
            { value: 'FINANCIAL_SUMMARY_PAYMENTS', label: 'Financial Summary (Payments)', formats: ['XLSX', 'CSV'] },
            { value: 'FINANCIAL_SUMMARY_CHARGES', label: 'Financial Summary (Charges)', formats: ['XLSX', 'CSV'] },
            { value: 'FULL_FINANCIAL_LEDGER', label: 'Full Financial Ledger (All Transactions)', formats: ['XLSX', 'CSV'] },
            { value: 'FULL_FINANCIAL_LEDGER_SUMMARIZED', label: 'Full Financial Ledger (All Transactions) Summarized', formats: ['XLSX', 'CSV'] },
            { value: 'PAYMENT_ALERTS', label: 'Payment Alerts (from Bank)', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_FEE_TYPES', label: 'All Fee Types', formats: ['XLSX', 'CSV'] },
        ]},
    { label: "Academic Reports", options: [
            { value: 'ALL_STUDENTS', label: 'All Students', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_GRADES', label: 'All Academic Grades', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_ENROLLMENTS', label: 'All Enrollments', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_SUBJECTS', label: 'All Subjects', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_TIMETABLES', label: 'All Timetables', formats: ['XLSX', 'CSV'] },
        ]},
    { label: "Staff & HR Reports", options: [
            { value: 'ALL_STAFF', label: 'All Staff', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_STAFF_ATTENDANCE', label: 'Staff Attendance', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_LEAVE_REQUESTS', label: 'Leave Requests', formats: ['XLSX', 'CSV'] },
        ]},
    { label: "Library Reports", options: [
            { value: 'ALL_BOOKS', label: 'All Library Books', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_BOOK_TRANSACTIONS', label: 'All Book Transactions', formats: ['XLSX', 'CSV'] },
        ]},
    { label: "Administrative Reports", options: [
            { value: 'ALL_USERS', label: 'All System Users', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_AUDIT_LOGS', label: 'All Audit Logs', formats: ['XLSX', 'CSV'] },
            { value: 'ALL_FACILITIES', label: 'All Facilities', formats: ['XLSX', 'CSV'] },
        ]}
];

const allOptions = reportOptions.flatMap(group => group.options);
const formatOptions = [ { value: 'PDF', label: 'PDF' }, { value: 'XLSX', label: 'Excel' }, { value: 'CSV', label: 'CSV' }];
const grades = ["GRADE 1", "GRADE 2", "GRADE 3", "GRADE 4", "GRADE 5", "GRADE 6", "GRADE 7", "ECD"];
const departments = ["Academics", "Administration", "Finance", "Support Staff", "IT"];
const staffStatuses = ["ACTIVE", "ON_LEAVE", "TERMINATED", "INACTIVE"];
const API_BASE_URL = 'http://194.163.141.113:8082';


export default function MainReports() {
    const { user, isSuperAdmin, selectedInstitution } = useAuth();
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('ALL_STUDENTS');
    const [format, setFormat] = useState('XLSX');

    // All Filter States
    const [allStudents, setAllStudents] = useState<StudentBalance[]>([]);
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [academicYear, setAcademicYear] = useState(currentAcademicYear);
    const [semester, setSemester] = useState(currentSemester);
    const [currency, setCurrency] = useState('USD');
    const [filterGrade, setFilterGrade] = useState('All');
    const [filterSection, setFilterSection] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [filterStaffStatus, setFilterStaffStatus] = useState('All');
    const [filterFeeTypeId, setFilterFeeTypeId] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [openStudentSearch, setOpenStudentSearch] = useState(false);

    // --- NEW STATE FOR PREVIEW ---
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<{ headers: string[], rows: string[][] }>({ headers: [], rows: [] });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const availableFormats = allOptions.find(opt => opt.value === reportType)?.formats || [];

    interface ReportFilters {
        studentId: string;
        academicYear: string;
        semester: string;
        currency: string;
        grade: string;
        section: string;
        department: string;
        status: string;
        feeTypeId: string;
        startDate: string;
        endDate: string;
        institutionId?: number;
    }

    useEffect(() => {
        if (!availableFormats.includes(format)) {
            setFormat(availableFormats[0]);
        }
    }, [reportType, format, availableFormats]);

    useEffect(() => {
        if (!user) return;

        const fetchDropdownData = async () => {
            const params = new URLSearchParams();
            if (isSuperAdmin && selectedInstitution && selectedInstitution !== 'all') {
                params.append('institutionId', selectedInstitution.id.toString());
            }
            const queryString = params.toString() ? `?${params.toString()}` : '';

            try {
                // Use relative URLs and the dynamic query string
                const [studentsRes, feesRes] = await Promise.all([
                    apiFetch(`/api/students?size=2000${queryString ? '&' + queryString : ''}`),
                    apiFetch(`/api/financials/fee-types${queryString}`)
                ]);
                if (studentsRes.ok) {
                    const studentData = await studentsRes.json();
                    setAllStudents(studentData.content || []);
                    // Automatically populate grades filter from the fetched students
                    const uniqueGrades = [...new Set((studentData.content || []).map((s: any) => s.currentGrade).filter(Boolean))].sort();
                    // setGrades(uniqueGrades); // If you decide to make grades dynamic
                } else {
                    toast.error("Failed to load students for filters.");
                }

                if (feesRes.ok) {
                    setFeeTypes(await feesRes.json());
                } else {
                    toast.error("Failed to load fee types for filters.");
                }

            } catch (error) { toast.error("Network error while loading filter data."); }
        };
        fetchDropdownData();
    }, [user, isSuperAdmin, selectedInstitution]);


    const handleGenerateReport = async () => {
        if (reportType === 'FINANCIAL_STATEMENT' && !selectedStudentId) {
            toast.error("Please select a student for the financial statement."); return;
        }
        setLoading(true);
        try {
            const filters: any = {
                studentId: selectedStudentId || null, academicYear, semester, currency,
                gradeLevel: filterGrade === 'All' ? null : filterGrade,
                section: filterSection, department: filterDepartment === 'All' ? null : filterDepartment,
                status: filterStaffStatus === 'All' ? null : filterStaffStatus,
                feeTypeId: filterFeeTypeId === 'all' ? null : filterFeeTypeId,
                startDate: startDate || null, endDate: endDate || null,
            };

            // Add institutionId to the filters for the backend
            if (isSuperAdmin && selectedInstitution && selectedInstitution !== 'all') {
                filters.institutionId = selectedInstitution.id;
            }
            const requestBody = { reportType, format, filters };
            const token = localStorage.getItem("jwt_token");

            // Use fetch for blob response, but with a relative URL
            const response = await fetch('/api/main-reports/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                toast.success("Report generated! Download will begin.");
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none'; a.href = url;
                const disposition = response.headers.get('content-disposition');
                let filename = `${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
                if (disposition?.includes('filename=')) filename = disposition.split('filename=')[1].replace(/"/g, '');
                a.download = filename;
                document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); a.remove();
            } else {
                const errorData = await response.json().catch(() => ({ message: "Failed to generate report" }));
                toast.error(`Error: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) { toast.error("A network error occurred while generating the report."); } finally { setLoading(false); }
    };

    const handlePreviewReport = async () => {
        if (reportType === 'FINANCIAL_STATEMENT' && !selectedStudentId) {
            toast.error("Please select a student to preview the statement.");
            return;
        }
        setIsPreviewLoading(true);
        setIsPreviewOpen(true);
        setPreviewData({ headers: [], rows: [] });
        try {
            const filters: any = {
                studentId: selectedStudentId || null, academicYear, semester, currency,
                gradeLevel: filterGrade === 'All' ? null : filterGrade,
                section: filterSection, department: filterDepartment === 'All' ? null : filterDepartment,
                status: filterStaffStatus === 'All' ? null : filterStaffStatus,
                feeTypeId: filterFeeTypeId === 'all' ? null : filterFeeTypeId,
                startDate: startDate || null, endDate: endDate || null,
            };

            if (isSuperAdmin && selectedInstitution && selectedInstitution !== 'all') {
                filters.institutionId = selectedInstitution.id;
            }
            const requestBody = { reportType, filters };

            // Use relative URL
            const response = await apiFetch('/api/main-reports/preview', {
                method: 'POST',
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                setPreviewData(await response.json());
            } else {
                toast.error("Failed to fetch preview data.");
                setIsPreviewOpen(false);
            }
        } catch (error) {
            toast.error("A network error occurred during preview.");
            setIsPreviewOpen(false);
        } finally {
            setIsPreviewLoading(false);
        }
    };
    // --- THIS IS THE MISSING FUNCTION BODY ---
    const renderFilters = () => {
        switch (reportType) {
            case 'FINANCIAL_STATEMENT':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Student *</Label>
                            <Popover open={openStudentSearch} onOpenChange={setOpenStudentSearch}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={openStudentSearch} className="w-full justify-between bg-red-800 hover:bg-red-700">
                                        {selectedStudentId ? allStudents.find(s => s.studentId === selectedStudentId)?.firstName + ' ' + allStudents.find(s => s.studentId === selectedStudentId)?.lastName : "Select a student..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-red-900 border-red-700 text-white">
                                    <Command>
                                        <CommandInput placeholder="Search student by name or ID..." />
                                        <CommandList>
                                            <CommandEmpty>No student found.</CommandEmpty>
                                            <CommandGroup>
                                                {allStudents.map((student) => (
                                                    <CommandItem
                                                        key={student.studentId}
                                                        value={`${student.firstName} ${student.lastName} ${student.studentId}`}
                                                        onSelect={() => { setSelectedStudentId(student.studentId); setOpenStudentSearch(false); }}
                                                    >
                                                        <Check className={`mr-2 h-4 w-4 ${selectedStudentId === student.studentId ? "opacity-100" : "opacity-0"}`} />
                                                        {student.firstName} {student.lastName} ({student.studentId})
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><Label>Academic Year</Label><Select value={academicYear} onValueChange={setAcademicYear}><SelectTrigger className="bg-red-800"><SelectValue/></SelectTrigger><SelectContent className="bg-red-800">{academicYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Semester</Label><Select value={semester} onValueChange={setSemester}><SelectTrigger className="bg-red-800"><SelectValue/></SelectTrigger><SelectContent className="bg-red-800">{semesters.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger className="bg-red-800"><SelectValue/></SelectTrigger><SelectContent className="bg-red-800"><SelectItem value="USD">USD</SelectItem><SelectItem value="ZWG">ZWG</SelectItem></SelectContent></Select></div>
                        </div>
                    </div>
                );
            case 'FULL_FINANCIAL_LEDGER':
            case 'FULL_FINANCIAL_LEDGER_SUMMARIZED':
            case 'FINANCIAL_SUMMARY_PAYMENTS':
            case 'FINANCIAL_SUMMARY_CHARGES':
                return (
                    <div className="space-y-4 animate-in fade-in-0 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-red-800" /></div>
                            <div><Label>End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-red-800" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Filter by Grade</Label><Select value={filterGrade} onValueChange={setFilterGrade}><SelectTrigger className="bg-red-800"><SelectValue/></SelectTrigger><SelectContent className="bg-red-800"><SelectItem value="All">All Grades</SelectItem>{grades.map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
                            <div>
                                <Label>Filter by Fee Type</Label>
                                <Select value={filterFeeTypeId} onValueChange={setFilterFeeTypeId}>
                                    <SelectTrigger className="bg-red-800"><SelectValue placeholder="All Fee Types"/></SelectTrigger>
                                    <SelectContent className="bg-red-800">
                                        <SelectItem value="all">All Fee Types</SelectItem>
                                        {feeTypes.map(ft=><SelectItem key={ft.id} value={String(ft.id)}>{ft.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );
            case 'ALL_STUDENTS':
                return ( <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-0 duration-300"> <div><Label>Filter by Grade</Label><Select value={filterGrade} onValueChange={setFilterGrade}><SelectTrigger className="bg-red-800"><SelectValue/></SelectTrigger><SelectContent className="bg-red-800"><SelectItem value="All">All Grades</SelectItem>{grades.map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div> <div><Label>Filter by Section</Label><Input placeholder="e.g., A, B, or leave empty for all" value={filterSection} onChange={e=>setFilterSection(e.target.value)} className="bg-red-800" /></div> </div> );
            case 'ALL_STAFF':
                return ( <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-0 duration-300"> <div><Label>Filter by Department</Label><Select value={filterDepartment} onValueChange={setFilterDepartment}><SelectTrigger className="bg-red-800"><SelectValue/></SelectTrigger><SelectContent className="bg-red-800"><SelectItem value="All">All Departments</SelectItem>{departments.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div> <div><Label>Filter by Status</Label><Select value={filterStaffStatus} onValueChange={setFilterStaffStatus}><SelectTrigger className="bg-red-800"><SelectValue/></SelectTrigger><SelectContent className="bg-red-800"><SelectItem value="All">All Statuses</SelectItem>{staffStatuses.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div> </div> );
            default:
                return <p className="text-gray-400 text-center">Ready to generate a full system data extract.</p>;
        }
    };

    const canViewPage = user?.role?.includes('ROLE_ADMIN') || user?.role?.includes('ROLE_SUPER_ADMIN');

    if (!user) { return <Navigate to="/dashboard" replace />; }

    if (!canViewPage) { return <Navigate to="/dashboard" replace />; }


    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-white-900 text-white flex flex-col">
            <Header />
            <main className="flex-1 px-4 py-8">
                <Card className="bg-gradient-to-br from-red-900/50 to-white-900/50 border-red-700">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl">System Data Extraction & Reports</CardTitle>
                            <Button asChild>
                                <Link to="/dashboard" className="flex items-center gap-2">
                                    <LayoutDashboard className="h-4 w-4" />Dashboard
                                </Link>
                            </Button>
                        </div>
                        <p className="text-gray-300 pt-2">Generate and download detailed system data in various formats.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div> <Label>1. Select Report Type</Label> <Select value={reportType} onValueChange={setReportType}> <SelectTrigger className="bg-red-800"><SelectValue /></SelectTrigger> <SelectContent className="bg-red-800"> {reportOptions.map(group => ( <SelectGroup key={group.label}> <SelectLabel className="text-red-300">{group.label}</SelectLabel> {group.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)} </SelectGroup> ))} </SelectContent> </Select> </div>
                            <div> <Label>2. Select Export Format</Label> <Select value={format} onValueChange={setFormat}> <SelectTrigger className="bg-red-800"><SelectValue /></SelectTrigger> <SelectContent className="bg-red-800">{formatOptions.filter(f => availableFormats.includes(f.value)).map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent> </Select> </div>
                        </div>
                        <div className="border-t border-red-600 pt-6">
                            <h3 className="text-lg font-semibold mb-4">3. Apply Filters (if applicable)</h3>
                            <div className="space-y-4">{renderFilters()}</div>
                        </div>
                        <div className="flex justify-end pt-4 gap-4">
                            <Button onClick={handlePreviewReport} disabled={loading || isPreviewLoading} variant="outline" className="text-white border-red-400 hover:bg-red-800 hover:text-white">
                                <Eye className="h-5 w-5 mr-2" />
                                {isPreviewLoading ? 'Loading Preview...' : 'Preview Report'}
                            </Button>
                            <Button onClick={handleGenerateReport} disabled={loading || isPreviewLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 text-base">
                                <Download className="h-5 w-5 mr-2" />
                                {loading ? 'Generating...' : 'Generate & Download'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogContent className="max-w-4xl bg-red-950 border-red-700 text-white">
                        <DialogHeader>
                            <DialogTitle>Report Preview (First 10 Rows)</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 max-h-[60vh] overflow-y-auto">
                            {isPreviewLoading ? (
                                <p className="text-center py-8">Loading preview data...</p>
                            ) : previewData.rows && previewData.rows.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-red-900">
                                            {previewData.headers.map((header, index) => (
                                                <TableHead key={index} className="text-red-300">{header}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.rows.map((row, rowIndex) => (
                                            <TableRow key={rowIndex} className="border-red-800 hover:bg-red-900">
                                                {row.map((cell, cellIndex) => (
                                                    <TableCell key={cellIndex}>{cell}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center py-8 text-gray-400">No data found for the selected filters.</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}