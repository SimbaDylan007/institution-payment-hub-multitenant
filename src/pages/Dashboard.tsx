// src/pages/Dashboard.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { PaymentAlert, SearchFiltersType } from "@/types";
import { apiFetch } from "@/utils/apiClient";

// UI Components & Services
import Header from "@/components/Header";
import SchoolNavigation from "@/components/SchoolNavigation";
import SearchFilters from "@/components/SearchFilters";
import PaymentTable from "@/components/PaymentTable";
// Import the new DashboardHub component
import DashboardHub from "@/components/school/DashboardHub";
import { fetchPayments as fetchPaymentsFromApi, resetAllPayments as resetAllPaymentsFromApi } from "@/services/paymentService";

// Shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Icons
import { UserPlus, FileText, Key, Plus, Trash2, Banknote, RotateCcw, Search } from "lucide-react";

// framer-motion
import { motion, AnimatePresence } from "framer-motion";

// --- Type Definitions ---
interface InstitutionAccount {
  id?: number;
  institutionId: string;
  accountName: string;
}

// --- API Endpoints ---
const ACCOUNTS_API_BASE_URL = 'http://localhost:8082/api/accounts';
const PAYMENTS_API_BASE_URL = 'http://localhost:8082/api/payments';


// --- Helper Components ---
const PaymentTableSkeleton = () => ( <div className="space-y-4 p-6">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-10 w-full rounded-md bg-gray-200/70 dark:bg-gray-700/50" />))}</div> );
const NoPaymentsFound = ({ hasFetched }: { hasFetched: boolean }) => ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400"><FileText size={48} className="mb-4 text-gray-600 dark:text-gray-300" /><h3 className="text-xl font-semibold mb-2">No Payments Found</h3><p className="text-sm">{hasFetched ? "No new payments were found from the bank." : "There are currently no payments stored in the database."}</p></motion.div> );
const CredentialsManager = ({ accounts, setAccounts, fetchAccounts }: { accounts: InstitutionAccount[], setAccounts: React.Dispatch<React.SetStateAction<InstitutionAccount[]>>, fetchAccounts: () => Promise<InstitutionAccount[]> }) => {
  const [institutionId, setInstitutionId] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleAddAccount = async () => {
    if (!institutionId || !accountName) {
      return toast.error("Account Name and Institution ID are required.");
    }
    try {
      const newAccount: InstitutionAccount = {
        institutionId,
        accountName,
      };

      const response = await apiFetch(ACCOUNTS_API_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(newAccount),
      });

      if (!response.ok) {
        throw new Error("Failed to add account.");
      }

      toast.success(`Account "${accountName}" added or updated.`);
      await fetchAccounts();
      setInstitutionId('');
      setAccountName('');
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  const handleDeleteAccount = async (id: number | undefined) => {
    if (id === undefined) {
      toast.error("Account ID is missing for deletion.");
      return;
    }
    try {
      const response = await apiFetch(`${ACCOUNTS_API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Failed to delete account.");
      }

      toast.info("Account removed.");
      await fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (<DialogContent className="dark:bg-gray-900/80 dark:border-gray-700 dark:text-white backdrop-blur-sm"><DialogHeader><DialogTitle className="flex items-center gap-2"><Key /> Manage Institution Accounts</DialogTitle></DialogHeader><div className="space-y-4 py-2"><div className="space-y-2 p-3 border dark:border-gray-700 rounded-lg"><h4 className="font-semibold">Add New Account</h4><Input placeholder="Account Name (e.g., Main ZWL)" value={accountName} onChange={e => setAccountName(e.target.value)} className="dark:bg-gray-800" /><Input placeholder="Institution ID (e.g., PACHEDU-ZWG)" value={institutionId} onChange={e => setInstitutionId(e.target.value)} className="dark:bg-gray-800" /><p className="text-xs text-amber-400">Note: The password for this ID must be set in the backend's configuration file.</p><Button onClick={handleAddAccount} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Account</Button></div><div className="space-y-2"><h4 className="font-semibold">Saved Accounts</h4><div className="space-y-2 max-h-48 overflow-y-auto p-2 border dark:border-gray-700 rounded-lg">{accounts.length === 0 ? <p className="text-sm text-center text-gray-400">No accounts saved.</p> : accounts.map(acc => (<div key={acc.id} className="flex justify-between items-center p-2 bg-gray-800 rounded"><div><p className="font-bold">{acc.accountName}</p><p className="text-xs text-gray-400">{acc.institutionId}</p></div><Button size="sm" variant="destructive" onClick={() => handleDeleteAccount(acc.id)}><Trash2 className="h-4 w-4"/></Button></div>))}</div></div></div></DialogContent>);
};
const PaymentPicker = ({ accounts, onFetchPayments }: { accounts: InstitutionAccount[], onFetchPayments: (selectedIds: string[], action: 'pending' | 'all') => void }) => {
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set()); const [actionType, setActionType] = useState<'pending' | 'all'>('pending');
  const handleSelectAccount = (id: string, isChecked: boolean) => { const newSet = new Set(selectedAccountIds); if (isChecked) newSet.add(id); else newSet.delete(id); setSelectedAccountIds(newSet); };
  const handleFetch = () => { if (selectedAccountIds.size === 0) return toast.warning("Please select at least one account."); onFetchPayments(Array.from(selectedAccountIds), actionType); };
  return (<Card className="dark:bg-[#1A1F2C] dark:border-gray-800"><CardHeader className="pb-4"><CardTitle className="text-md flex items-center gap-2"><Banknote/>Institution Connection</CardTitle></CardHeader><CardContent><div className="space-y-3"><div><Label>Action Type</Label><Select value={actionType} onValueChange={(value: 'pending' | 'all') => setActionType(value)}><SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700"><SelectValue /></SelectTrigger><SelectContent className="dark:bg-gray-800 dark:border-gray-700"><SelectItem value="pending">Pick Pending Payments</SelectItem><SelectItem value="all">Get All Payments (History)</SelectItem></SelectContent></Select></div><Label>Select accounts to fetch from:</Label><div className="space-y-2 p-2 border dark:border-gray-700 rounded-md max-h-32 overflow-y-auto">{accounts.length === 0 ? <p className="text-xs text-gray-400 text-center">No accounts configured.</p> : accounts.map(acc => (<div key={acc.id} className="flex items-center space-x-2"><Checkbox id={acc.institutionId} onCheckedChange={(checked) => handleSelectAccount(acc.institutionId, !!checked)} /><Label htmlFor={acc.institutionId} className="text-sm font-medium leading-none">{acc.accountName}</Label></div>))}</div><Button onClick={handleFetch} className="w-full bg-purple-600 hover:bg-purple-700 dark:text-white">Fetch New Payments</Button></div></CardContent></Card>);
};

export default function Dashboard() {
  const { user } = useAuth();
  const [allFetchedPayments, setAllFetchedPayments] = useState<PaymentAlert[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [hasFetchedRemotely, setHasFetchedRemotely] = useState(false);
  const [backendFilters, setBackendFilters] = useState<SearchFiltersType>({});
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [institutionAccounts, setInstitutionAccounts] = useState<InstitutionAccount[]>([]);

  const isSuperAdmin = user?.role?.includes('ROLE_SUPER_ADMIN') ?? false;

    const canManagePayments =
        isSuperAdmin ||
        user?.role?.includes('ROLE_ADMIN') ||
        user?.role?.includes('ROLE_FINANCE_ADMIN');

    const canManageStudents =
        isSuperAdmin ||
        user?.role?.includes('ROLE_ADMIN') ||
        user?.role?.includes('ROLE_IT_ADMIN');

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await apiFetch(ACCOUNTS_API_BASE_URL);
      if (response.ok) {
        const data: InstitutionAccount[] = await response.json();
        setInstitutionAccounts(data);
        return data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching institution accounts:", error);
      return [];
    }
  }, []);

  const fetchLocalPayments = useCallback(async () => {
    try {
      const response = await apiFetch(`${PAYMENTS_API_BASE_URL}/local`);
      if (response.ok) {
        const data: PaymentAlert[] = await response.json();
        return data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching local payments:", error);
      toast.error("Failed to load local payments.");
      return [];
    }
  }, []);

  const loadPayments = useCallback(async (action: 'pending' | 'all', accountIdsToFetch?: string[]) => {
    const isRemoteFetch = !!accountIdsToFetch && accountIdsToFetch.length > 0;
    const toastMessage = isRemoteFetch
        ? `Fetching payments from selected accounts...`
        : `Loading existing payments...`;

    setIsLoadingPayments(true);
    if (isRemoteFetch) {
      setAllFetchedPayments([]);
    }
    setLocalSearchTerm("");
    setHasFetchedRemotely(isRemoteFetch);
    const toastId = toast.loading(toastMessage);

    try {
      const result = await fetchPaymentsFromApi(backendFilters, action, accountIdsToFetch);

      // --- FALLBACK LOGIC ---
      if (result.length === 0 && isRemoteFetch) {
        toast.info("No new payments found. Loading existing payments from database.", { id: toastId });
        const localPayments = await fetchLocalPayments();
        setAllFetchedPayments(localPayments);
        // We don't need another success toast here as the info toast is sufficient.
      } else {
        setAllFetchedPayments(result);
        toast.success(isRemoteFetch ? `${result.length} payments found!` : `${result.length} existing payments loaded.`, { id: toastId, duration: 5000 });
      }
      // --- END FALLBACK LOGIC ---

    } catch (error) {
      toast.error((error as Error).message || "An unexpected error occurred.", { id: toastId, duration: 5000 });
    } finally {
      setIsLoadingPayments(false);
    }
  }, [backendFilters, fetchLocalPayments]);


    useEffect(() => {
        const handleInitialLoad = async () => {
            if (canManagePayments) {
                const accounts = await fetchAccounts();
                if (accounts.length > 0) {
                    const allInstitutionIds = accounts.map(acc => acc.institutionId);
                    loadPayments('pending', allInstitutionIds);
                } else {
                    loadPayments('all');
                }
            } else {
                setIsLoadingPayments(false);
            }
        };

        handleInitialLoad();
    }, [canManagePayments, loadPayments, fetchAccounts]);



  const handleBackendSearch = (newFilters: SearchFiltersType) => { setBackendFilters(newFilters); toast.info("Filters updated. Click 'Fetch New Payments' to apply."); };
  const handlePaymentReset = (paymentId: string) => { setAllFetchedPayments(prev => prev.filter(p => p.id !== paymentId)); toast.info("Payment reset."); };
  const handleResetAllPayments = async () => { if (window.confirm("DANGER: This will reset ALL payments in your local database. Are you sure?")) { const toastId = toast.loading("Resetting..."); try { await resetAllPaymentsFromApi(); toast.success("All payments reset.", { id: toastId }); setAllFetchedPayments([]); } catch (error) { toast.error((error as Error).message, { id: toastId }); } } };
  const displayedPayments = useMemo(() => { if (!localSearchTerm) return allFetchedPayments; const term = localSearchTerm.toLowerCase(); return allFetchedPayments.filter(p => p.studentName?.toLowerCase().includes(term) || p.regNumber?.toLowerCase().includes(term) || p.reference?.toLowerCase().includes(term) || p.narrative?.toLowerCase().includes(term)); }, [allFetchedPayments, localSearchTerm]);

  if (!user) return <Navigate to="/" replace />;

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-[#1A2E44] dark:to-[#0E1B29] dark:text-white">
        <Header />
        <main className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 py-8 px-8">
          <motion.aside initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-1 rounded-xl p-6 bg-white shadow-lg dark:bg-[#1A1F2C] dark:border-gray-800 dark:shadow-xl">
            <SchoolNavigation />
            {canManageStudents && (<div className="mt-8 pt-6 border-t dark:border-gray-700/50"><h3 className="text-md font-semibold mb-4 dark:text-gray-300">Actions</h3><Link to="/students"><Button className="w-full justify-start gap-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:from-blue-600 hover:to-blue-500 shadow-md"><UserPlus size={18} /> Manage Students</Button></Link></div>)}
          </motion.aside>

          <div className="lg:col-span-1 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <DashboardHub />
            </motion.div>

            {canManagePayments && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-xl p-6 bg-white shadow-lg dark:bg-[#1A1F2C] dark:border-gray-800 dark:shadow-xl">
                  <Card className="bg-transparent border-none shadow-none">
                    <CardHeader className="p-0 mb-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"><CardTitle className="text-2xl font-bold dark:text-gray-100">Payment Alerts</CardTitle><div className="flex gap-3"><Button onClick={handleResetAllPayments} variant="destructive" size="sm" className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600"><RotateCcw size={16} /> Reset All Payments</Button><Dialog><DialogTrigger asChild><Button variant="outline" size="sm" className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-400 text-white hover:from-teal-600 hover:to-teal-500 border-none shadow-md"><Key size={16} /> Manage Accounts</Button></DialogTrigger><CredentialsManager accounts={institutionAccounts} setAccounts={setInstitutionAccounts} fetchAccounts={fetchAccounts} /></Dialog></div></div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                        <div className="lg:col-span-3"><SearchFilters onSearch={handleBackendSearch} /></div>
                        <div className="lg:col-span-1"><PaymentPicker accounts={institutionAccounts} onFetchPayments={(ids, action) => loadPayments(action, ids)} /></div>
                      </div>

                      {allFetchedPayments.length > 0 && (<div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder={`Search within the ${allFetchedPayments.length} loaded payments...`} value={localSearchTerm} onChange={e => setLocalSearchTerm(e.target.value)} className="pl-10 dark:bg-gray-800" /></div>)}

                      <AnimatePresence mode="wait">
                        {isLoadingPayments ? (<motion.div key="loading"><PaymentTableSkeleton /></motion.div>) :
                            displayedPayments.length > 0 ? (<motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><PaymentTable payments={displayedPayments} onPaymentReset={handlePaymentReset} /></motion.div>) :
                                (<motion.div key="no-payments"><NoPaymentsFound hasFetched={hasFetchedRemotely} /></motion.div>)}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
            )}
          </div>
        </main>
        <footer className="bg-white border-t py-4 mt-8 px-8 dark:bg-[#1A1F2C] dark:border-gray-800">
          <div className="text-center text-sm text-gray-600 dark:text-gray-500">© {new Date().getFullYear()} School Management System. All rights reserved.</div>
        </footer>
      </div>
  );
}