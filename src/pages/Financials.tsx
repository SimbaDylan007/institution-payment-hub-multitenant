// src/pages/Financials.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Home, Plus, DollarSign, BookUser, UserSearch, Download, Edit, Trash2, LayoutDashboard, Users } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { CSVLink } from "react-csv";
import { apiFetch } from "@/utils/apiClient";
import { academicYears, currentAcademicYear, currentSemester, semesters } from "@/config/academicConfig";
import { FeeType, LedgerEntry, StudentBalance, CurrencyBalance } from "@/types";



// --- Helper Component for displaying multi-currency balances ---
const BalanceDisplay = ({ title, balanceData, positiveColor, negativeColor }: { title: string, balanceData?: { [key: string]: number }, positiveColor: string, negativeColor: string }) => (
    <Card className="bg-purple-800/30 border-purple-600 text-center">
        <CardHeader className="p-4"><CardTitle className="text-lg text-gray-300">{title}</CardTitle></CardHeader>
        <CardContent className="text-xl font-bold space-y-2 p-4 pt-0">
            {balanceData && Object.keys(balanceData).length > 0 ? (
                Object.entries(balanceData).map(([currency, value]) => (
                    <div key={currency} className={value >= 0 ? positiveColor : negativeColor}>
                        {currency} {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                ))
            ) : (
                <div className="text-gray-400">0.00</div>
            )}
        </CardContent>
    </Card>
);

export default function Financials() {
    const { user } = useAuth();
    const [view, setView] = useState<'overview' | 'ledger'>('overview');
    const [allStudents, setAllStudents] = useState<StudentBalance[]>([]);
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [currentStudent, setCurrentStudent] = useState<StudentBalance | null>(null);
    const [currentLedger, setCurrentLedger] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFeeTypeDialogOpen, setIsFeeTypeDialogOpen] = useState(false);
    const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
    const [isBulkChargeDialogOpen, setIsBulkChargeDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [currentBalance, setCurrentBalance] = useState<CurrencyBalance | null>(null);

    const [bulkFeeTypeId, setBulkFeeTypeId] = useState<string>('');
    const [bulkAcademicYear, setBulkAcademicYear] = useState(currentAcademicYear);
    const [bulkSemester, setBulkSemester] = useState(currentSemester);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [bulkManualIds, setBulkManualIds] = useState('');

    useEffect(() => {
        if(user) {
            fetchFeeTypes();
            fetchAllStudentBalances();
        }
    }, [user]);

    const fetchAllStudentBalances = async () => {
        setLoading(true);
        try {
            const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/students/balances');
            if (response.ok) {
                setAllStudents(await response.json());
            } else {
                toast.error('Failed to fetch student financial overview.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeeTypes = async () => {
        try {
            const response = await apiFetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/fee-types');
            if (response.ok) {
                setFeeTypes(await response.json());
            } else {
                toast.error('Failed to fetch fee types.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleViewLedger = async (student: StudentBalance) => {
        setLoading(true);
        setCurrentStudent(student);
        try {
            const [ledgerRes, balanceRes] = await Promise.all([
                apiFetch(`http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/students/${student.studentId}/ledger`),
                apiFetch(`http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/students/${student.studentId}/balance`)
            ]);
            if (ledgerRes.ok) setCurrentLedger(await ledgerRes.json());
            if (balanceRes.ok) setCurrentBalance(await balanceRes.json());
            setView('ledger');
        } catch (error) {
            toast.error('Failed to load student ledger.');
        } finally {
            setLoading(false);
        }
    };

    const handleFeeTypeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const feeTypeData = { name: formData.get('name'), defaultAmount: parseFloat(formData.get('defaultAmount') as string), description: formData.get('description'), currency: formData.get('currency') };
        const url = selectedFeeType ? `http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/fee-types/${selectedFeeType.id}` : 'http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/fee-types';
        const method = selectedFeeType ? 'PUT' : 'POST';
        try {
            const response = await apiFetch(url, { method, body: JSON.stringify(feeTypeData) });
            if (response.ok) {
                toast.success(`Fee type ${selectedFeeType ? 'updated' : 'created'} successfully!`);
                setIsFeeTypeDialogOpen(false);
                setSelectedFeeType(null);
                fetchFeeTypes();
            } else {
                const err = await response.json();
                throw new Error(err.message);
            }
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFeeType = async (feeTypeId: number) => {
        if (!window.confirm('Are you sure you want to delete this fee type?')) return;
        setLoading(true);
        try {
            const response = await apiFetch(`http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/fee-types/${feeTypeId}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Fee type deleted successfully!');
                fetchFeeTypes();
            } else {
                const err = await response.json();
                throw new Error(err.message);
            }
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleTransactionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentStudent) return;
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const requestData = {
            studentId: currentStudent.studentId,
            amount: parseFloat(formData.get('amount') as string),
            description: formData.get('description') as string,
            transactionDate: formData.get('transactionDate') as string,
            feeTypeId: formData.get('feeTypeId') ? parseInt(formData.get('feeTypeId') as string) : null,
            academicYear: formData.get('academicYear') as string,
            semester: formData.get('semester') as string,
            currency: formData.get('currency') as string
        };
        const url = transactionType === 'DEBIT' ? 'http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/students/charges' : 'http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/students/payments';
        try {
            const response = await apiFetch(url, { method: 'POST', body: JSON.stringify(requestData) });
            if (response.ok) {
                toast.success('Transaction added successfully!');
                setIsTransactionDialogOpen(false);
                await handleViewLedger(currentStudent);
                await fetchAllStudentBalances();
            } else {
                throw new Error('Failed to add transaction');
            }
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkChargeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('feeTypeId', bulkFeeTypeId);
        formData.append('academicYear', bulkAcademicYear);
        formData.append('semester', bulkSemester);
        if (bulkFile) formData.append('file', bulkFile);
        const manualIdList = bulkManualIds.split(/[\n,]/).map(id => id.trim()).filter(Boolean);
        manualIdList.forEach(id => formData.append('studentIds', id));
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) throw new Error("Authentication token not found.");
            const response = await fetch('http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/financials/charges/bulk', { method: 'POST', body: formData, headers: { "Authorization": "Bearer " + token } });
            if (response.ok) {
                toast.success('Bulk charge applied successfully!');
                setIsBulkChargeDialogOpen(false);
                fetchAllStudentBalances();
            } else {
                const err = await response.json();
                throw new Error(err.message);
            }
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = useMemo(() => {
        return allStudents.filter(student =>
            (searchTerm === '' || `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || student.studentId.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (gradeFilter === 'All' || student.currentGrade === gradeFilter)
        );
    }, [allStudents, searchTerm, gradeFilter]);

    const ledgerTotals = useMemo(() => {
        const charges: { [key: string]: number } = {};
        const payments: { [key: string]: number } = {};
        currentLedger.forEach(entry => {
            if (entry.transactionType === 'DEBIT') {
                charges[entry.currency] = (charges[entry.currency] || 0) + entry.amount;
            } else {
                payments[entry.currency] = (payments[entry.currency] || 0) + entry.amount;
            }
        });
        return { charges, payments };
    }, [currentLedger]);

    const ledgerWithRunningBalance = useMemo(() => {
        // This calculation is now incorrect for multi-currency and is removed from the table
        // For a true running balance, a more complex per-currency calculation would be needed
        return currentLedger;
    }, [currentLedger]);

    if (!user) { return <Navigate to="/" replace />; }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Tabs defaultValue="student_financials" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-purple-900/50 border-purple-700">
                        <TabsTrigger value="student_financials">Student Financials</TabsTrigger>
                        <TabsTrigger value="fee_config">Fee Configuration</TabsTrigger>
                    </TabsList>
                    <TabsContent value="student_financials">
                        {view === 'overview' && (
                            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                                <CardHeader>
                                    <div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><UserSearch />Student Financial Overview</CardTitle>
                                        <div className="flex items-center gap-4">
                                            <Button asChild><Link to="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</Link></Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4"><Input placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><Select value={gradeFilter} onValueChange={setGradeFilter}>{/* ... */}</Select></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead><tr className="border-b border-purple-600"><th className="p-2">Student ID</th><th className="p-2">Name</th><th className="p-2">Grade</th><th className="p-2 text-right">Balances</th><th className="p-2 text-center">Actions</th></tr></thead>
                                            <tbody>
                                            {loading ? (<tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>) :
                                                filteredStudents.map(student => (
                                                    <tr key={student.id} className="border-b border-purple-800">
                                                        <td className="p-2">{student.studentId}</td>
                                                        <td className="p-2">{student.firstName} {student.lastName}</td>
                                                        <td className="p-2">{student.currentGrade}</td>
                                                        <td className="p-2 text-right font-semibold">
                                                            {student.balances && Object.keys(student.balances).length > 0 ? (
                                                                Object.entries(student.balances).map(([currency, value]) => (
                                                                    <div key={currency} className={value >= 0 ? 'text-yellow-400' : 'text-green-400'}>
                                                                        {currency}: {value.toFixed(2)}
                                                                    </div>
                                                                ))
                                                            ) : (<span className="text-gray-400">0.00</span>)}
                                                        </td>
                                                        <td className="p-2 text-center"><Button size="sm" onClick={() => handleViewLedger(student)}>View Ledger</Button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {view === 'ledger' && currentStudent && (
                            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                                <CardHeader><Button variant="outline" onClick={() => setView('overview')} className="mb-4 w-fit">&larr; Back to Overview</Button><CardTitle className="flex items-center gap-2"><BookUser />Ledger for {currentStudent.firstName} {currentStudent.lastName}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <BalanceDisplay title="Total Charges" balanceData={ledgerTotals.charges} positiveColor="text-red-400" negativeColor="text-red-400" />
                                        <BalanceDisplay title="Total Payments" balanceData={ledgerTotals.payments} positiveColor="text-green-400" negativeColor="text-green-400" />
                                        <BalanceDisplay title="Current Balances" balanceData={currentBalance?.balances} positiveColor="text-yellow-400" negativeColor="text-blue-400" />
                                    </div>
                                    <div className="flex gap-4 mb-4"><Button className="bg-red-600" onClick={() => { setTransactionType('DEBIT'); setIsTransactionDialogOpen(true); }}>Add Charge</Button><Button className="bg-green-600" onClick={() => { setTransactionType('CREDIT'); setIsTransactionDialogOpen(true); }}>Record Payment</Button></div>
                                    <table className="w-full text-left">
                                        <thead><tr className="border-b border-purple-600"><th className="p-2">Date</th><th className="p-2">Description</th><th className="p-2 text-right">Charge</th><th className="p-2 text-right">Payment</th></tr></thead>
                                        <tbody>{ledgerWithRunningBalance.map(entry => (<tr key={entry.id} className="border-b border-purple-800"><td className="p-2">{entry.transactionDate}</td><td className="p-2">{entry.description}</td><td className="p-2 text-right text-red-400">{entry.transactionType === 'DEBIT' ? `${entry.currency} ${entry.amount.toFixed(2)}` : ''}</td><td className="p-2 text-right text-green-400">{entry.transactionType === 'CREDIT' ? `${entry.currency} ${entry.amount.toFixed(2)}` : ''}</td></tr>))}</tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="fee_config">
                        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle className="flex items-center gap-2 text-white"><DollarSign />Fee Types Configuration</CardTitle>
                                <div className="flex gap-4"><Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsBulkChargeDialogOpen(true)}><Users className="h-4 w-4 mr-2" />Apply Fee to Students</Button><Button className="bg-green-600 hover:bg-green-700" onClick={() => { setSelectedFeeType(null); setIsFeeTypeDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Fee Type</Button></div>
                            </CardHeader>
                            <CardContent><div className="space-y-4">{feeTypes?.map((fee) => (<div key={fee.id} className="flex justify-between items-center p-4 bg-purple-800/30 rounded-lg border border-purple-600"><div><h3 className="font-semibold text-white">{fee.name} ({fee.currency})</h3><p className="text-sm text-gray-300">{fee.description}</p></div><div className="flex items-center gap-4"><div className="font-bold text-lg text-blue-400">${fee.defaultAmount.toFixed(2)}</div><Button size="sm" variant="outline" className="border-purple-600 text-white hover:bg-purple-700" onClick={() => { setSelectedFeeType(fee); setIsFeeTypeDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white" onClick={() => handleDeleteFeeType(fee.id)}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div></CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Dialog open={isBulkChargeDialogOpen} onOpenChange={setIsBulkChargeDialogOpen}>
                <DialogContent className="bg-purple-900 border-purple-700 text-white max-w-lg">
                    <DialogHeader><DialogTitle>Apply Fee to Multiple Students</DialogTitle></DialogHeader>
                    <form onSubmit={handleBulkChargeSubmit} className="space-y-4">
                        <div>
                            <Label>Select Fee Type to Apply</Label>
                            <Select name="feeTypeId" required value={bulkFeeTypeId} onValueChange={setBulkFeeTypeId}>
                                <SelectTrigger className="bg-purple-800"><SelectValue placeholder="Choose a fee..." /></SelectTrigger>
                                <DialogPortal><SelectContent className="bg-purple-800">{feeTypes?.map(ft => <SelectItem key={ft.id} value={ft.id.toString()}>{ft.name}</SelectItem>)}</SelectContent></DialogPortal>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>For Academic Year</Label>
                                <Select name="academicYear" required value={bulkAcademicYear} onValueChange={setBulkAcademicYear}>
                                    <SelectTrigger className="bg-purple-800"><SelectValue /></SelectTrigger>
                                    <DialogPortal><SelectContent className="bg-purple-800">{academicYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}</SelectContent></DialogPortal>
                                </Select>
                            </div>
                            <div>
                                <Label>For Term / Semester</Label>
                                <Select name="semester" required value={bulkSemester} onValueChange={setBulkSemester}>
                                    <SelectTrigger className="bg-purple-800"><SelectValue /></SelectTrigger>
                                    <DialogPortal><SelectContent className="bg-purple-800">{semesters.map(term => <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>)}</SelectContent></DialogPortal>
                                </Select>
                            </div>
                        </div>
                        <p className="text-sm text-center text-gray-400 font-bold">--- CHOOSE ONE STUDENT INPUT METHOD ---</p>
                        <div>
                            <Label htmlFor="file">Method 1: Upload CSV or Excel File</Label>
                            <Input id="file" name="file" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="bg-purple-800 file:text-white" onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)} />
                        </div>
                        <div>
                            <Label htmlFor="studentIds_manual">Method 2: Manually Enter Student IDs</Label>
                            <Textarea id="studentIds_manual" name="studentIds_manual" rows={5} placeholder="P2522029, S1234567" className="bg-purple-800" value={bulkManualIds} onChange={(e) => setBulkManualIds(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsBulkChargeDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>{loading ? 'Applying...' : 'Apply Charge'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isFeeTypeDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setSelectedFeeType(null); setIsFeeTypeDialogOpen(isOpen); }}><DialogContent className="bg-purple-900 border-purple-700 text-white"><DialogHeader><DialogTitle>{selectedFeeType ? 'Edit Fee Type' : 'Add New Fee Type'}</DialogTitle></DialogHeader><form onSubmit={handleFeeTypeSubmit} className="space-y-4"><div><Label htmlFor="name">Fee Name</Label><Input id="name" name="name" className="bg-purple-800 border-purple-600" defaultValue={selectedFeeType?.name} required /></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="defaultAmount">Default Amount</Label><Input id="defaultAmount" name="defaultAmount" type="number" step="0.01" className="bg-purple-800 border-purple-600" defaultValue={selectedFeeType?.defaultAmount} required /></div><div><Label htmlFor="currency">Currency</Label><Select name="currency" defaultValue={selectedFeeType?.currency || 'USD'}><SelectTrigger className="bg-purple-800 border-purple-600"><SelectValue /></SelectTrigger><SelectContent className="bg-purple-800 border-purple-600"><SelectItem value="USD">USD</SelectItem><SelectItem value="ZWG">ZWG</SelectItem></SelectContent></Select></div></div><div><Label htmlFor="description">Description</Label><Input id="description" name="description" className="bg-purple-800 border-purple-600" defaultValue={selectedFeeType?.description} /></div><div className="flex justify-end gap-2"><Button type="submit" disabled={loading}>{loading ? 'Saving...' : (selectedFeeType ? 'Update Fee' : 'Add Fee')}</Button></div></form></DialogContent></Dialog>
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogContent className="bg-purple-900 border-purple-700 text-white">
                    <DialogHeader><DialogTitle>{transactionType === 'DEBIT' ? 'Add a Charge' : 'Record a Payment'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleTransactionSubmit} className="space-y-4 py-4">
                        {transactionType === 'DEBIT' && (
                            <div>
                                <Label htmlFor="feeTypeId">Fee Type (Optional)</Label>
                                <Select name="feeTypeId"><SelectTrigger className="bg-purple-800"><SelectValue/></SelectTrigger><DialogPortal><SelectContent className="bg-purple-800">{feeTypes?.map(ft =><SelectItem key={ft.id} value={ft.id.toString()}>{ft.name}</SelectItem>)}</SelectContent></DialogPortal></Select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label htmlFor="amount">Amount *</Label><Input id="amount" name="amount" type="number" step="0.01" className="bg-purple-800" required /></div>
                            <div>
                                <Label htmlFor="currency">Currency *</Label>
                                <Select name="currency" defaultValue="USD" required>
                                    <SelectTrigger className="bg-purple-800"><SelectValue /></SelectTrigger>
                                    <DialogPortal><SelectContent className="bg-purple-800"><SelectItem value="USD">USD</SelectItem><SelectItem value="ZWG">ZWG</SelectItem></SelectContent></DialogPortal>
                                </Select>
                            </div>
                        </div>
                        <div><Label htmlFor="description">Description *</Label><Input id="description" name="description" className="bg-purple-800" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="academicYear">Academic Year</Label>
                                <Select name="academicYear" defaultValue={currentAcademicYear} required><SelectTrigger className="bg-purple-800"><SelectValue /></SelectTrigger><DialogPortal><SelectContent className="bg-purple-800">{academicYears.map(year => (<SelectItem key={year} value={year}>{year}</SelectItem>))}</SelectContent></DialogPortal></Select>
                            </div>
                            <div>
                                <Label htmlFor="semester">Term / Semester</Label>
                                <Select name="semester" defaultValue={currentSemester} required><SelectTrigger className="bg-purple-800"><SelectValue /></SelectTrigger><DialogPortal><SelectContent className="bg-purple-800">{semesters.map(term => (<SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>))}</SelectContent></DialogPortal></Select>
                            </div>
                        </div>
                        <div><Label htmlFor="transactionDate">Transaction Date *</Label><Input id="transactionDate" name="transactionDate" type="date" className="bg-purple-800" defaultValue={new Date().toISOString().split('T')[0]} required /></div>
                        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Submit Transaction'}</Button></div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}