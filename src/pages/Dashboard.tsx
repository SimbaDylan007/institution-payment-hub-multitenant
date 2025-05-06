
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { PaymentAlert, SearchFilters as SearchFiltersType, PickPaymentRequest } from "@/types";
import Header from "@/components/Header";
import Stats from "@/components/Stats";
import SearchFilters from "@/components/SearchFilters";
import PaymentTable from "@/components/PaymentTable";
import PickInstitutionPayments from "@/components/PickInstitutionPayments";
import { fetchPayments } from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [credentials, setCredentials] = useState<PickPaymentRequest | undefined>();
  
  const loadPayments = async (searchFilters?: SearchFiltersType) => {
    setIsLoading(true);
    try {
      const data = await fetchPayments(searchFilters, credentials);
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    loadPayments(newFilters);
  };
  
  const handlePaymentReset = (id: string) => {
    // Refresh the payments list
    loadPayments(filters);
  };
  
  const handlePaymentsPicked = () => {
    // Refresh the payments list
    loadPayments(filters);
  };
  
  const handleRefresh = () => {
    loadPayments(filters);
  };
  
  // Store last successful credentials in localStorage
  const storeCredentials = (institutionId: string, password: string) => {
    const creds = { institutionId, password };
    setCredentials(creds);
    localStorage.setItem('paymentCredentials', JSON.stringify(creds));
  };
  
  // Effect to load stored credentials on mount
  useEffect(() => {
    const storedCreds = localStorage.getItem('paymentCredentials');
    if (storedCreds) {
      try {
        const parsed = JSON.parse(storedCreds);
        if (parsed.institutionId && parsed.password) {
          setCredentials(parsed);
        }
      } catch (e) {
        console.error('Error parsing stored credentials', e);
        localStorage.removeItem('paymentCredentials');
      }
    }
  }, []);
  
  // Load payments when component mounts or credentials change
  useEffect(() => {
    if (user) {
      loadPayments(filters);
    }
  }, [user, credentials]);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-[#121828] text-white dark:bg-gray-100 dark:text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Dashboard</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
        
        <Stats payments={payments} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <SearchFilters onSearch={handleSearch} />
          </div>
          <div className="lg:col-span-1">
            <PickInstitutionPayments onPaymentsPicked={handlePaymentsPicked} />
          </div>
        </div>
        
        <div className="bg-[#1A1F2C] dark:bg-white p-6 border border-gray-800 dark:border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Payment Records</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <PaymentTable 
              payments={payments} 
              onPaymentReset={handlePaymentReset} 
            />
          )}
        </div>
      </main>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} Institution Payment Hub
        </div>
      </footer>
    </div>
  );
}
