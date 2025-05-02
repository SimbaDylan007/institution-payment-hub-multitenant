
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { PaymentAlert, SearchFilters as SearchFiltersType } from "@/types";
import Header from "@/components/Header";
import Stats from "@/components/Stats";
import SearchFilters from "@/components/SearchFilters";
import PaymentTable from "@/components/PaymentTable";
import PickInstitutionPayments from "@/components/PickInstitutionPayments";
import { fetchPayments } from "@/services/paymentService";

export default function Dashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  
  const loadPayments = async (searchFilters?: SearchFiltersType) => {
    setIsLoading(true);
    try {
      const data = await fetchPayments(searchFilters);
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
  
  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-[#121828] text-white flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Payment Dashboard</h1>
        
        <Stats payments={payments} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <SearchFilters onSearch={handleSearch} />
          </div>
          <div>
            <PickInstitutionPayments onPaymentsPicked={handlePaymentsPicked} />
          </div>
        </div>
        
        <div className="bg-[#1A1F2C] p-6 border border-gray-800 rounded-lg shadow-sm">
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
      
      <footer className="bg-[#1A1F2C] border-t border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Institution Payment Hub
        </div>
      </footer>
    </div>
  );
}
