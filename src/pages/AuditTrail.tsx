// src/pages/AuditTrail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Home, ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import { apiFetch } from '@/utils/apiClient';

// --- Interfaces ---
interface AuditLog { id: number; timestamp: string; username: string; action: string; details: string; status: 'SUCCESS' | 'FAILURE'; ipAddress: string; }
interface Page<T> { content: T[]; totalPages: number; number: number; totalElements: number; }

export default function AuditTrail() {
    const { user } = useAuth();
    const [logPage, setLogPage] = useState<Page<AuditLog> | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ username: '', action: '', startDate: undefined as Date | undefined, endDate: undefined as Date | undefined });
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const fetchLogs = useCallback((page = 0, currentFilters = filters) => {
        setLoading(true);
        const params = new URLSearchParams({ page: page.toString(), size: '15', sort: 'timestamp,desc' });
        if (currentFilters.username) params.append('username', currentFilters.username);
        if (currentFilters.action) params.append('action', currentFilters.action);
        if (currentFilters.startDate) params.append('startDate', format(currentFilters.startDate, 'yyyy-MM-dd'));
        if (currentFilters.endDate) params.append('endDate', format(currentFilters.endDate, 'yyyy-MM-dd'));

        apiFetch(`/api/audit-logs?${params.toString()}`)
            .then(res => res.json())
            .then(data => setLogPage(data))
            .catch(() => console.error("Failed to fetch audit logs"))
            .finally(() => setLoading(false));
    }, [filters]);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            const timer = setTimeout(() => fetchLogs(currentPage, filters), 300);
            return () => clearTimeout(timer);
        } else {
            setLoading(false);
        }
    }, [user, currentPage, filters, fetchLogs]);

    const getLogDetails = (log: AuditLog | null) => {
        if (!log || !log.details) return { jsonDetails: {}, exception: null };
        const parts = log.details.split('\nException:');
        let jsonDetails = {};
        try {
            jsonDetails = JSON.parse(parts[0] || '{}');
        } catch (e) {
            jsonDetails = { rawDetails: parts[0] };
        }
        return { jsonDetails, exception: parts[1]?.trim() || null };
    };

    // Data for CSV Export
    const csvData = logPage?.content.map(log => ({
        timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        username: log.username,
        action: log.action,
        status: log.status,
        ipAddress: log.ipAddress,
        details: log.details
    })) || [];

    if (!user) return <Navigate to="/" replace />;
    if (user.role !== 'ADMIN') return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-red-500">Access Denied</h1><p className="mt-4">You do not have permission to view this page.</p><Button asChild className="mt-6"><Link to="/dashboard">Go to Dashboard</Link></Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">System Audit Trail</h1>
                    <div className="flex gap-2">
                        {logPage && logPage.content.length > 0 && (
                            <Button variant="outline" asChild>
                                <CSVLink data={csvData} filename={`audit-trail-${format(new Date(), 'yyyy-MM-dd')}.csv`} className="flex items-center gap-2">
                                    <Download size={16}/> Export to CSV
                                </CSVLink>
                            </Button>
                        )}
                        <Button asChild><Link to="/dashboard" className="flex items-center gap-2"><Home size={16}/>Dashboard</Link></Button>
                    </div>
                </div>

                <Card className="bg-gray-900/50 border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldCheck/>Activity Logs</CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            <Input placeholder="Filter by Username..." value={filters.username} onChange={e => { setFilters(f => ({...f, username: e.target.value})); setCurrentPage(0); }} className="bg-gray-800"/>
                            <Input placeholder="Filter by Action..." value={filters.action} onChange={e => { setFilters(f => ({...f, action: e.target.value})); setCurrentPage(0); }} className="bg-gray-800"/>
                            <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal dark:bg-gray-800", !filters.startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{filters.startDate ? format(filters.startDate, "PPP") : <span>Start date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.startDate} onSelect={(date) => setFilters(f => ({...f, startDate: date}))} initialFocus /></PopoverContent></Popover>
                            <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal dark:bg-gray-800", !filters.endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{filters.endDate ? format(filters.endDate, "PPP") : <span>End date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.endDate} onSelect={(date) => setFilters(f => ({...f, endDate: date}))} initialFocus /></PopoverContent></Popover>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Status</TableHead><TableHead>IP Address</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {loading ? (<tr><td colSpan={6} className="text-center p-8">Loading logs...</td></tr>) :
                                        logPage?.content.map(log => (
                                            <TableRow key={log.id} className="border-gray-800">
                                                <TableCell>{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                                                <TableCell>{log.username}</TableCell>
                                                <TableCell><Badge variant="outline" className="font-mono">{log.action}</Badge></TableCell>
                                                <TableCell><Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}>{log.status}</Badge></TableCell>
                                                <TableCell>{log.ipAddress}</TableCell>
                                                <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>View</Button></TableCell>
                                            </TableRow>
                                        ))}
                                    {!loading && logPage?.content.length === 0 && (<tr><td colSpan={6} className="text-center p-8 text-gray-400">No audit logs found matching your criteria.</td></tr>)}
                                </TableBody>
                            </Table>
                        </div>
                        {logPage && logPage.totalPages > 1 && (
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <span className="text-sm text-gray-400">Page {logPage.number + 1} of {logPage.totalPages}</span>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}><ChevronsLeft size={16}/></Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}><ChevronLeft size={16}/></Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= logPage.totalPages - 1}><ChevronRight size={16}/></Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(logPage.totalPages - 1)} disabled={currentPage >= logPage.totalPages - 1}><ChevronsRight size={16}/></Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Dialog open={!!selectedLog} onOpenChange={(isOpen) => !isOpen && setSelectedLog(null)}>
                <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-2xl">
                    <DialogHeader><DialogTitle>Log Details</DialogTitle></DialogHeader>
                    <div className="space-y-2 py-4 max-h-[60vh] overflow-y-auto">
                        <p><strong>User:</strong> {selectedLog?.username}</p>
                        <p><strong>Action:</strong> {selectedLog?.action}</p>
                        <p><strong>Timestamp:</strong> {selectedLog && format(new Date(selectedLog.timestamp), 'PPP p')}</p>
                        <h4 className="font-semibold pt-2">Request Details / Arguments:</h4>
                        <pre className="bg-black p-2 rounded-md text-sm whitespace-pre-wrap"><code>{JSON.stringify(getLogDetails(selectedLog).jsonDetails, null, 2)}</code></pre>
                        {getLogDetails(selectedLog).exception && (
                            <><h4 className="font-semibold pt-2 text-red-500">Exception Detail:</h4><pre className="bg-black p-2 rounded-md text-sm text-red-400 whitespace-pre-wrap"><code>{getLogDetails(selectedLog).exception}</code></pre></>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}