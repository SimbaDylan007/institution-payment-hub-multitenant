import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { PaymentAlert, SearchFilters as SearchFiltersType, PickPaymentRequest } from "@/types";
import Header from "@/components/Header";
import SchoolStats from "@/components/school/SchoolStats";
import SchoolNavigation from "@/components/SchoolNavigation";
import SearchFilters from "@/components/SearchFilters";
import PaymentTable from "@/components/PaymentTable";
import PickInstitutionPayments from "@/components/PickInstitutionPayments";
import { fetchPayments } from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    loadPayments(filters);
  };
  
  const handlePaymentsPicked = () => {
    loadPayments(filters);
  };
  
  const handleRefresh = () => {
    loadPayments(filters);
  };
  
  const storeCredentials = (institutionId: string, password: string) => {
    const creds = { institutionId, password };
    setCredentials(creds);
    localStorage.setItem('paymentCredentials', JSON.stringify(creds));
  };
  
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
          <div>
            <h1 className="text-2xl font-bold">School Management Dashboard</h1>
            <p className="text-gray-400 dark:text-gray-600">
              Welcome to your comprehensive school management system
            </p>
          </div>
          <Link to="/student-management">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 border-white/20 dark:border-gray-300"
            >
              <UserPlus size={16} className="text-white" />
              <span className="text-white">Manage Students</span>
            </Button>
          </Link>
        </div>
        
        <SchoolStats />
        
        <div className="mb-6">
          <SchoolNavigation />
        </div>
        
        <Card className="bg-[#1A1F2C] dark:bg-white border-gray-800 dark:border-gray-200 mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Payment Management</CardTitle>
              <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="flex items-center gap-2 bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-500 dark:hover:bg-purple-600 border-white/20 dark:border-gray-300"
                    disabled={isLoading}
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin text-white" : "text-white"} />
                  <span className="text-white">Refresh</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <div className="lg:col-span-3">
                <SearchFilters onSearch={handleSearch} />
              </div>
              <div className="lg:col-span-1">
                <PickInstitutionPayments onPaymentsPicked={handlePaymentsPicked} />
              </div>
            </div>
            
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
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-[#1A1F2C] dark:bg-white border-t border-gray-800 dark:border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-600">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
