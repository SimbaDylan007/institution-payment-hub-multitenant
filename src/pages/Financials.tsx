import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Home, Plus, DollarSign, BookUser, FileText, UserSearch, Download, Edit, Trash2, LayoutDashboard, Users } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { CSVLink } from "react-csv";
import { apiFetch } from "@/utils/apiClient";

// --- Interfaces ---
interface FeeType { id: number; name: string; defaultAmount: number; description: string; currency: 'USD' | 'ZWG'; }
interface LedgerEntry { id: number; transactionType: 'DEBIT' | 'CREDIT'; amount: number; description: string; transactionDate: string; currency: 'USD' | 'ZWG'; }
interface StudentBalance { id: number; studentId: string; firstName: string; lastName: string; currentGrade: string; balance: number; }

export default function Financials() {
    const { user } = useAuth();

    // --- State Management ---
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

    // --- Data Fetching ---
    useEffect(() => {
        if(user) { // Only fetch if logged in
            fetchFeeTypes();
            fetchAllStudentBalances();
        }
    }, [user]);

    const fetchAllStudentBalances = async () => {
        setLoading(true);
        try {
            const response = await apiFetch('http://localhost:8080/api/financials/students/balances');
            if (response.ok) setAllStudents(await response.json());
            else toast.error('Failed to fetch student financial overview.');
        } catch (error) { /* apiFetch handles toast */ }
        finally { setLoading(false); }
    };

    const fetchFeeTypes = async () => {
        try {
            const response = await apiFetch('http://localhost:8080/api/financials/fee-types');
            if (response.ok) setFeeTypes(await response.json());
            else toast.error('Failed to fetch fee types.');
        } catch (error) { /* apiFetch handles toast */ }
    };

    const handleViewLedger = async (student: StudentBalance) => {
        setLoading(true);
        setCurrentStudent(student);
        try {
            const response = await apiFetch(`http://localhost:8080/api/financials/students/${student.studentId}/ledger`);
            if (response.ok) {
                setCurrentLedger(await response.json());
                setView('ledger');
            } else { toast.error('Failed to load student ledger.'); }
        } catch (error) { /* apiFetch handles toast */ }
        finally { setLoading(false); }
    };

    // --- Form Submissions ---
    const handleFeeTypeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setLoading(true);
        const formData = new FormData(e.currentTarget);
        const feeTypeData = { name: formData.get('name'), defaultAmount: parseFloat(formData.get('defaultAmount') as string), description: formData.get('description'), currency: formData.get('currency') };
        const url = selectedFeeType ? `http://localhost:8080/api/financials/fee-types/${selectedFeeType.id}` : 'http://localhost:8080/api/financials/fee-types';
        const method = selectedFeeType ? 'PUT' : 'POST';
        try {
            const response = await apiFetch(url, { method, body: JSON.stringify(feeTypeData) });
            if (response.ok) {
                toast.success(`Fee type ${selectedFeeType ? 'updated' : 'created'} successfully!`);
                setIsFeeTypeDialogOpen(false); setSelectedFeeType(null); fetchFeeTypes();
            } else { const err = await response.json(); throw new Error(err.message); }
        } catch (error) { toast.error((error as Error).message); }
        finally { setLoading(false); }
    };

    const handleDeleteFeeType = async (feeTypeId: number) => {
        if (!window.confirm('Are you sure you want to delete this fee type?')) return;
        setLoading(true);
        try {
            const response = await apiFetch(`http://localhost:8080/api/financials/fee-types/${feeTypeId}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Fee type deleted successfully!');
                fetchFeeTypes();
            } else { const err = await response.json(); throw new Error(err.message); }
        } catch (error) { toast.error((error as Error).message); }
        finally { setLoading(false); }
    };

    const handleTransactionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); if (!currentStudent) return;
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const requestData = { studentId: currentStudent.studentId, amount: parseFloat(formData.get('amount') as string), description: formData.get('description'), transactionDate: formData.get('transactionDate'), feeTypeId: formData.get('feeTypeId') ? parseInt(formData.get('feeTypeId') as string) : null };
        const url = transactionType === 'DEBIT' ? 'http://localhost:8080/api/financials/students/charges' : 'http://localhost:8080/api/financials/students/payments';
        try {
            const response = await apiFetch(url, { method: 'POST', body: JSON.stringify(requestData) });
            if (response.ok) {
                toast.success(`Transaction added successfully!`);
                setIsTransactionDialogOpen(false);
                await handleViewLedger(currentStudent);
                await fetchAllStudentBalances();
            } else { throw new Error('Failed to add transaction'); }
        } catch (error) { toast.error((error as Error).message); }
        finally { setLoading(false); }
    };


    const handleBulkChargeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setLoading(true);
        const formData = new FormData(e.currentTarget);
        const manualIds = (formData.get('studentIds_manual') as string).split(/[\n,]/).map(id => id.trim()).filter(Boolean);
        formData.delete('studentIds_manual');
        manualIds.forEach(id => formData.append('studentIds', id));

        try {
            // apiFetch needs a small adjustment for multipart/form-data
            const token = localStorage.getItem("jwt_token");
            const headers = new Headers();
            if (token) { headers.append("Authorization", "Bearer " + token); }
            const response = await fetch('http://localhost:8080/api/financials/charges/bulk', { method: 'POST', body: formData, headers });

            if (response.ok) {
                toast.success('Bulk charge applied successfully!');
                setIsBulkChargeDialogOpen(false); fetchAllStudentBalances();
            } else { const err = await response.json(); throw new Error(err.message); }
        } catch (error) { toast.error((error as Error).message); }
        finally { setLoading(false); }
    };



    // --- Memoized Calculations ---
    const filteredStudents = useMemo(() => {
        if (!allStudents) return [];
        return allStudents.filter(student =>
            (searchTerm === '' || `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || student.studentId.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (gradeFilter === 'All' || student.currentGrade === gradeFilter)
        );
    }, [allStudents, searchTerm, gradeFilter]);

    const ledgerWithRunningBalance = useMemo(() => {
        if (!currentLedger) return [];
        let runningBalance = 0;
        return currentLedger.map(entry => {
            runningBalance += (entry.transactionType === 'DEBIT' ? entry.amount : -entry.amount);
            return { ...entry, runningBalance };
        });
    }, [currentLedger]);

    if (!user) { return <Navigate to="/" replace />; }

    // --- RENDER LOGIC ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Tabs defaultValue="student_financials" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-purple-900/50 border-purple-700">
                        <TabsTrigger value="student_financials" className="data-[state=active]:bg-purple-600">Student Financials</TabsTrigger>
                        <TabsTrigger value="fee_config" className="data-[state=active]:bg-purple-600">Fee Configuration</TabsTrigger>
                    </TabsList>

                    <TabsContent value="student_financials">
                        {view === 'overview' && (
                            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2 text-white"><UserSearch />Student Financial Overview</CardTitle>
                                        <div className="flex items-center gap-4">
                                            <CSVLink data={filteredStudents} headers={[{ label: "Student ID", key: "studentId" }, { label: "First Name", key: "firstName" }, { label: "Last Name", key: "lastName" }, { label: "Grade", key: "currentGrade" }, { label: "Balance", key: "balance" }]} filename="student_balances_export.csv" className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"><Download size={16} /> Export List</CSVLink>
                                            <Button asChild className="bg-purple-600 text-white hover:bg-purple-700"><Link to="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</Link></Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4"><Input placeholder="Search by name or ID..." className="bg-purple-800 border-purple-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><Select value={gradeFilter} onValueChange={setGradeFilter}><SelectTrigger className="bg-purple-800 border-purple-600 w-[180px]"><SelectValue /></SelectTrigger><SelectContent className="bg-purple-800 border-purple-600"><SelectItem value="All">All Grades</SelectItem>{[...new Set(allStudents?.map(s => s.currentGrade))].sort().map(grade => (grade && <SelectItem key={grade} value={grade}>{grade}</SelectItem>))}</SelectContent></Select></div>
                                </CardHeader>
                                <CardContent><table className="w-full text-left"><thead><tr className="border-b border-purple-600"><th className="p-2">Student ID</th><th className="p-2">Name</th><th className="p-2">Grade</th><th className="p-2 text-right">Balance</th><th className="p-2 text-center">Actions</th></tr></thead><tbody>{loading && !allStudents?.length ? (<tr><td colSpan={5} className="text-center p-4">Loading student data...</td></tr>) : filteredStudents.map(student => (<tr key={student.id} className="border-b border-purple-800 hover:bg-purple-900/50"><td className="p-2">{student.studentId}</td><td className="p-2">{student.firstName} {student.lastName}</td><td className="p-2">{student.currentGrade}</td><td className={`p-2 text-right font-semibold ${student.balance > 0 ? 'text-yellow-400' : 'text-green-400'}`}>${student.balance.toFixed(2)}</td><td className="p-2 text-center"><Button size="sm" onClick={() => handleViewLedger(student)}>View Ledger</Button></td></tr>))}</tbody></table></CardContent>
                            </Card>
                        )}
                        {view === 'ledger' && currentStudent && (
                            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                                <CardHeader><Button variant="outline" onClick={() => setView('overview')} className="mb-4 w-fit bg-transparent hover:bg-purple-700">&larr; Back to Overview</Button><CardTitle className="flex items-center gap-2 text-white"><BookUser />Ledger for {currentStudent.firstName} {currentStudent.lastName} ({currentStudent.studentId})</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><Card className="bg-purple-800/30 border-purple-600 text-center"><CardHeader><CardTitle className="text-lg text-red-400">Total Charges</CardTitle></CardHeader><CardContent className="text-2xl font-bold">${currentLedger.filter(e => e.transactionType === 'DEBIT').reduce((s, e) => s + e.amount, 0).toFixed(2)}</CardContent></Card><Card className="bg-purple-800/30 border-purple-600 text-center"><CardHeader><CardTitle className="text-lg text-green-400">Total Payments</CardTitle></CardHeader><CardContent className="text-2xl font-bold">${currentLedger.filter(e => e.transactionType === 'CREDIT').reduce((s, e) => s + e.amount, 0).toFixed(2)}</CardContent></Card><Card className="bg-purple-800/30 border-purple-600 text-center"><CardHeader><CardTitle className={`text-lg ${currentStudent.balance > 0 ? 'text-yellow-400' : 'text-blue-400'}`}>Current Balance</CardTitle></CardHeader><CardContent className="text-2xl font-bold">${currentStudent.balance.toFixed(2)}</CardContent></Card></div>
                                    <div className="flex gap-4 mb-4"><Button className="bg-red-600 hover:bg-red-700" onClick={() => { setTransactionType('DEBIT'); setIsTransactionDialogOpen(true); }}>Add Charge</Button><Button className="bg-green-600 hover:bg-green-700" onClick={() => { setTransactionType('CREDIT'); setIsTransactionDialogOpen(true); }}>Record Payment</Button><CSVLink data={ledgerWithRunningBalance} headers={[{label: "Date", key: "transactionDate"}, {label: "Description", key: "description"}, {label: "Type", key: "transactionType"}, {label: "Amount", key: "amount"}, {label: "Balance", key: "runningBalance"}]} filename={`ledger-${currentStudent.studentId}.csv`} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"><Download size={16} /> Export Ledger</CSVLink></div>
                                    <table className="w-full text-left"><thead><tr className="border-b border-purple-600"><th className="p-2">Date</th><th className="p-2">Description</th><th className="p-2 text-right">Charge</th><th className="p-2 text-right">Payment</th><th className="p-2 text-right">Balance</th></tr></thead><tbody>{ledgerWithRunningBalance.map(entry => (<tr key={entry.id} className="border-b border-purple-800 hover:bg-purple-900/50"><td className="p-2">{entry.transactionDate}</td><td className="p-2">{entry.description}</td><td className="p-2 text-right text-red-400">{entry.transactionType === 'DEBIT' ? `${entry.currency} ${entry.amount.toFixed(2)}` : ''}</td><td className="p-2 text-right text-green-400">{entry.transactionType === 'CREDIT' ? `${entry.currency} ${entry.amount.toFixed(2)}` : ''}</td><td className="p-2 text-right font-semibold">${entry.runningBalance.toFixed(2)}</td></tr>))}</tbody></table>
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

            <Dialog open={isBulkChargeDialogOpen} onOpenChange={setIsBulkChargeDialogOpen}><DialogContent className="bg-purple-900 border-purple-700 text-white max-w-lg"><DialogHeader><DialogTitle>Apply Fee to Multiple Students</DialogTitle></DialogHeader><form onSubmit={handleBulkChargeSubmit} className="space-y-4"><div><Label htmlFor="feeTypeId">Select Fee Type to Apply</Label><Select name="feeTypeId" required><SelectTrigger className="bg-purple-800 border-purple-600"><SelectValue placeholder="Choose a fee..." /></SelectTrigger><SelectContent className="bg-purple-800 border-purple-600">{feeTypes?.map(ft => <SelectItem key={ft.id} value={ft.id.toString()}>{ft.name} ({ft.currency} ${ft.defaultAmount.toFixed(2)})</SelectItem>)}</SelectContent></Select></div><p className="text-sm text-center text-gray-400 font-bold">--- CHOOSE ONE METHOD ---</p><div><Label htmlFor="file">Method 1: Upload CSV File</Label><p className="text-xs text-gray-400 mb-1">Upload a .csv file with one student ID per row in the first column.</p><Input id="file" name="file" type="file" accept=".csv" className="bg-purple-800 border-purple-600 file:text-white" /></div><div><Label htmlFor="studentIds_manual">Method 2: Manually Enter Student IDs</Label><p className="text-xs text-gray-400 mb-1">Enter a list of student IDs, separated by commas or new lines.</p><Textarea id="studentIds_manual" name="studentIds_manual" rows={5} placeholder="P2522029, S1234567, T9876543" className="bg-purple-800 border-purple-600" /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsBulkChargeDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Applying...' : 'Apply Charge to Students'}</Button></div></form></DialogContent></Dialog>
            <Dialog open={isFeeTypeDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setSelectedFeeType(null); setIsFeeTypeDialogOpen(isOpen); }}><DialogContent className="bg-purple-900 border-purple-700 text-white"><DialogHeader><DialogTitle>{selectedFeeType ? 'Edit Fee Type' : 'Add New Fee Type'}</DialogTitle></DialogHeader><form onSubmit={handleFeeTypeSubmit} className="space-y-4"><div><Label htmlFor="name">Fee Name</Label><Input id="name" name="name" className="bg-purple-800 border-purple-600" defaultValue={selectedFeeType?.name} required /></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="defaultAmount">Default Amount</Label><Input id="defaultAmount" name="defaultAmount" type="number" step="0.01" className="bg-purple-800 border-purple-600" defaultValue={selectedFeeType?.defaultAmount} required /></div><div><Label htmlFor="currency">Currency</Label><Select name="currency" defaultValue={selectedFeeType?.currency || 'USD'}><SelectTrigger className="bg-purple-800 border-purple-600"><SelectValue /></SelectTrigger><SelectContent className="bg-purple-800 border-purple-600"><SelectItem value="USD">USD</SelectItem><SelectItem value="ZWG">ZWG</SelectItem></SelectContent></Select></div></div><div><Label htmlFor="description">Description</Label><Input id="description" name="description" className="bg-purple-800 border-purple-600" defaultValue={selectedFeeType?.description} /></div><div className="flex justify-end gap-2"><Button type="submit" disabled={loading}>{loading ? 'Saving...' : (selectedFeeType ? 'Update Fee' : 'Add Fee')}</Button></div></form></DialogContent></Dialog>
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}><DialogContent className="bg-purple-900 border-purple-700 text-white"><DialogHeader><DialogTitle>{transactionType === 'DEBIT' ? 'Add a Charge' : 'Record a Payment'}</DialogTitle></DialogHeader><form onSubmit={handleTransactionSubmit} className="space-y-4">{transactionType === 'DEBIT' && (<div><Label htmlFor="feeTypeId">Fee Type (Optional)</Label><Select name="feeTypeId"><SelectTrigger className="bg-purple-800 border-purple-600"><SelectValue placeholder="Select a pre-defined fee" /></SelectTrigger><SelectContent className="bg-purple-800 border-purple-600">{feeTypes?.map(ft => <SelectItem key={ft.id} value={ft.id.toString()}>{ft.name} ({ft.currency}) - ${ft.defaultAmount.toFixed(2)}</SelectItem>)}</SelectContent></Select></div>)}<div><Label htmlFor="amount">Amount</Label><Input id="amount" name="amount" type="number" step="0.01" className="bg-purple-800 border-purple-600" required /></div><div><Label htmlFor="description">Description</Label><Input id="description" name="description" className="bg-purple-800 border-purple-600" required /></div><div><Label htmlFor="transactionDate">Transaction Date</Label><Input id="transactionDate" name="transactionDate" type="date" className="bg-purple-800 border-purple-600" defaultValue={new Date().toISOString().split('T')[0]} required /></div><div className="flex justify-end gap-2"><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Submit Transaction'}</Button></div></form></DialogContent></Dialog>
        </div>
    );
}