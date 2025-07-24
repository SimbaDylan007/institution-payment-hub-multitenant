// src/pages/Dashboard.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { PaymentAlert, SearchFilters as SearchFiltersType, PickPaymentRequest } from "@/types";

// UI Components
import Header from "@/components/Header";
import SchoolStats from "@/components/school/SchoolStats";
import SchoolNavigation from "@/components/SchoolNavigation";
import SearchFilters from "@/components/SearchFilters";
import PaymentTable from "@/components/PaymentTable";
import PickInstitutionPayments from "@/components/PickInstitutionPayments";

// Shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

// Icons
import { RefreshCw, UserPlus, FileText, DollarSign, BookOpen, Users, Key } from "lucide-react";

// framer-motion
import { motion, AnimatePresence } from "framer-motion";
import {fetchPayments} from "@/services/paymentService";

// Import ThemeToggle component
import { ThemeToggle } from "@/components/ThemeToggle"; // Make sure this path is correct

// --- New/Improved Components & Utils ---

const PaymentTableSkeleton = () => (
    <div className="space-y-4 p-6">
      {[...Array(5)].map((_, i) => (
          // Default: light gray, Dark: darker gray
          <Skeleton key={i} className="h-10 w-full rounded-md bg-gray-200/70 dark:bg-gray-700/50" />
      ))}
    </div>
);

const NoPaymentsFound = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        // Default: gray text, Dark: lighter gray text
        className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400"
    >
      {/* Default: dark gray icon, Dark: lighter gray icon */}
      <FileText size={48} className="mb-4 text-gray-600 dark:text-gray-300" />
      <h3 className="text-xl font-semibold mb-2">No Payments Found</h3>
      <p className="text-sm">
        It seems there are no payment records matching your criteria. Try adjusting your filters or
        refreshing the data.
      </p>
    </motion.div>
);

// --- Dashboard Component ---

export default function Dashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [credentials, setCredentials] = useState<PickPaymentRequest | undefined>();
  const [showCredentialsInput, setShowCredentialsInput] = useState(false);
  const [tempInstitutionId, setTempInstitutionId] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const loadPayments = useCallback(
      async (searchFilters: SearchFiltersType = filters, currentCredentials = credentials) => {
        setIsLoading(true);
        try {
          const data = await fetchPayments(searchFilters, currentCredentials);
          setPayments(data);
        } catch (error) {
          console.error("Error fetching payments:", error);
          // Implement a more user-friendly error notification (e.g., toast)
        } finally {
          setIsLoading(false);
        }
      },
      [filters, credentials]
  );

  const handleSearch = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    loadPayments(newFilters);
  }, [loadPayments]);

  const handlePaymentReset = useCallback((id: string) => {
    loadPayments(filters);
  }, [loadPayments, filters]);

  const handlePaymentsPicked = useCallback(() => {
    loadPayments(filters);
  }, [loadPayments, filters]);

  const handleRefresh = useCallback(() => {
    loadPayments(filters);
  }, [loadPayments, filters]);

  const storeCredentials = useCallback(() => {
    if (tempInstitutionId && tempPassword) {
      const creds = { institutionId: tempInstitutionId, password: tempPassword };
      setCredentials(creds);
      localStorage.setItem('paymentCredentials', JSON.stringify(creds));
      setShowCredentialsInput(false);
      loadPayments(filters, creds);
    }
  }, [tempInstitutionId, tempPassword, loadPayments, filters]);

  useEffect(() => {
    const storedCreds = localStorage.getItem('paymentCredentials');
    if (storedCreds) {
      try {
        const parsed = JSON.parse(storedCreds);
        if (parsed.institutionId && parsed.password) {
          setCredentials(parsed);
          setTempInstitutionId(parsed.institutionId);
          setTempPassword(parsed.password);
        }
      } catch (e) {
        console.error('Error parsing stored credentials', e);
        localStorage.removeItem('paymentCredentials');
      }
    } else {
      setShowCredentialsInput(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (credentials || showCredentialsInput) {
        loadPayments(filters);
      }
    }
  }, [user, credentials, loadPayments, filters, showCredentialsInput]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
      // Default: light mode background and text. Dark: override with dark gradient and white text.
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 font-sans antialiased
                      dark:bg-gradient-to-br dark:from-[#1A2E44] dark:to-[#0E1B29] dark:text-white">
        <Header />

        <main className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 py-8 px-8">
          {/* Left Sidebar for Navigation */}
          <motion.aside
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              // Default: white background, light border, light shadow. Dark: dark background, dark border, dark shadow.
              className="lg:col-span-1 rounded-xl p-6 bg-white border border-gray-200 shadow-lg
                         dark:bg-[#1A1F2C] dark:border-gray-800 dark:shadow-xl"
          >
            <div className="flex justify-between items-center mb-8"> {/* Adjusted to contain toggle */}
              <div>
                {/* Default: dark text. Dark: light text. */}
                <h2 className="text-xl font-bold text-gray-800 mb-2 dark:text-gray-200">Dashboard Navigation</h2>
                {/* Default: gray text. Dark: lighter gray text. */}
                <p className="text-sm text-gray-600 dark:text-gray-400">Quick access to key areas.</p>
              </div>
              <ThemeToggle /> {/* Place the theme toggle here */}
            </div>
            <SchoolNavigation />

            {/* Default: light border. Dark: dark border. */}
            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700/50">
              {/* Default: dark text. Dark: light text. */}
              <h3 className="text-md font-semibold text-gray-700 mb-4 dark:text-gray-300">Actions</h3>
              <Link to="/student-management">
                <Button
                    // Default: blue gradient. Dark: darker blue gradient.
                    className="w-full justify-start gap-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:from-blue-600 hover:to-blue-500 shadow-md transition-all duration-300 transform hover:-translate-y-0.5
                               dark:from-blue-600 dark:to-blue-500 dark:hover:from-blue-700 dark:hover:to-blue-600"
                >
                  <UserPlus size={18} />
                  Manage Students
                </Button>
              </Link>
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <div className="lg:col-span-1 space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                // Default: white background, light border, light shadow. Dark: dark background, dark border, dark shadow.
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-gray-200 rounded-xl shadow-lg
                           dark:bg-[#1A1F2C] dark:border-gray-800 dark:shadow-xl"
            >
              <div>
                {/* Default: dark text. Dark: white text. */}
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">School Management Dashboard</h1>
                {/* Default: gray text. Dark: lighter gray text. */}
                <p className="text-gray-700 mt-1 text-lg dark:text-gray-400">
                  Welcome, <span className="text-purple-600 dark:text-purple-400">{user?.name || 'Admin'}</span>. Your comprehensive system awaits.
                </p>
              </div>
            </motion.div>

            {/* School Statistics Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Default: dark text. Dark: light text. */}
              <h2 className="text-xl font-semibold mb-4 text-gray-800 px-6 dark:text-gray-200">Key School Metrics</h2>
              <SchoolStats /> {/* SchoolStats will need its own dark: styles */}
            </motion.div>

            {/* Payment Management Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                // Default: white background, light border, light shadow. Dark: dark background, dark border, dark shadow.
                className="rounded-xl p-6 bg-white border border-gray-200 shadow-lg
                           dark:bg-[#1A1F2C] dark:border-gray-800 dark:shadow-xl"
            >
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="p-0 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    {/* Default: dark text. Dark: light text. */}
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Payment Alerts
                    </CardTitle>
                    <div className="flex gap-3">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCredentialsInput(!showCredentialsInput)}
                          // Default: teal gradient. Dark: darker teal gradient.
                          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-400 text-white hover:from-teal-600 hover:to-teal-500 border-none shadow-md transition-all duration-300 transform hover:-translate-y-0.5
                                     dark:from-teal-600 dark:to-teal-500 dark:hover:from-teal-700 dark:hover:to-teal-600"
                      >
                        <Key size={16} />
                        {showCredentialsInput ? "Hide Credentials" : "Update Credentials"}
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          // Default: purple gradient. Dark: darker purple gradient.
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-400 text-white hover:from-purple-600 hover:to-purple-500 border-none shadow-md transition-all duration-300 transform hover:-translate-y-0.5
                                     dark:from-purple-600 dark:to-purple-500 dark:hover:from-purple-700 dark:hover:to-purple-600"
                          disabled={isLoading}
                      >
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                        Refresh Data
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Credentials Input Section */}
                  <AnimatePresence>
                    {showCredentialsInput && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            // Default: light background, light border. Dark: dark background, dark border.
                            className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-100 space-y-4
                                       dark:bg-gray-900/50 dark:border-gray-700"
                        >
                          {/* Default: dark text. Dark: light text. */}
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 dark:text-gray-200">
                            <Key size={20} /> Payment Gateway Credentials
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Institution ID"
                                value={tempInstitutionId}
                                onChange={(e) => setTempInstitutionId(e.target.value)}
                                // Default: light input. Dark: dark input.
                                className="bg-gray-200 text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500
                                           dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:border-purple-500 dark:focus:ring-purple-500"
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={tempPassword}
                                onChange={(e) => setTempPassword(e.target.value)}
                                // Default: light input. Dark: dark input.
                                className="bg-gray-200 text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500
                                           dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:border-purple-500 dark:focus:ring-purple-500"
                            />
                          </div>
                          <Button onClick={storeCredentials}
                              // Default: blue button. Dark: darker blue button.
                                  className="w-full bg-blue-500 hover:bg-blue-600 text-white
                                     dark:bg-blue-600 dark:hover:bg-blue-700">
                            Save Credentials & Fetch
                          </Button>
                        </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div className="lg:col-span-3">
                      <SearchFilters onSearch={handleSearch} /> {/* SearchFilters needs dark: styles */}
                    </div>
                    <div className="lg:col-span-1">
                      <PickInstitutionPayments onPaymentsPicked={handlePaymentsPicked} /> {/* PickInstitutionPayments needs dark: styles */}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                          <PaymentTableSkeleton />
                        </motion.div>
                    ) : payments.length > 0 ? (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                          <PaymentTable payments={payments} onPaymentReset={handlePaymentReset} /> {/* PaymentTable needs dark: styles */}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="no-payments"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                          <NoPaymentsFound />
                        </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 mt-8 px-8
                           dark:bg-[#1A1F2C] dark:border-gray-800">
          <div className="text-center text-sm text-gray-600 dark:text-gray-500">
            © {new Date().getFullYear()} School Management System. All rights reserved.
          </div>
        </footer>
      </div>
  );
}