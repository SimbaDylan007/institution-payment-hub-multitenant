import { PaymentAlert, PickPaymentRequest, SearchFilters } from "../types";
import { getAllPayments, pickAllPendingPayments, resetPayment as resetPaymentApi, getLocalPayments } from "./apiService";

// Mock data for development and fallback
const mockPayments: PaymentAlert[] = [
  {
    id: "ALERT_54321",
    amount: 250.0,
    date: {
      date: 15,
      day: 5,
      hours: 12,
      minutes: 0,
      month: 2,
      nanos: 0,
      seconds: 0,
      time: 1615798800000,
      timezoneOffset: 0,
      year: 124
    },
    narrative: "Student Fees Term 1",
    picked: 0,
    reference: "STUDENT12345",
    source: "BANK_TRANSFER",
    status: "pending",
    transactionDate: "2024-03-10",
    studentName: "John",
    studentSurname: "Doe",
    regNumber: "R12345"
  },
  {
    id: "ALERT_54322",
    amount: 300.0,
    date: {
      date: 16,
      day: 6,
      hours: 14,
      minutes: 30,
      month: 2,
      nanos: 0,
      seconds: 0,
      time: 1615892400000,
      timezoneOffset: 0,
      year: 124
    },
    narrative: "Student Fees Term 1",
    picked: 0,
    reference: "STUDENT12346",
    source: "BANK_TRANSFER",
    status: "pending",
    transactionDate: "2024-03-11",
    studentName: "Jane",
    studentSurname: "Smith",
    regNumber: "R12346"
  },
  {
    id: "ALERT_54323",
    amount: 350.0,
    date: {
      date: 17,
      day: 0,
      hours: 9,
      minutes: 15,
      month: 2,
      nanos: 0,
      seconds: 0,
      time: 1615964400000,
      timezoneOffset: 0,
      year: 124
    },
    narrative: "Student Fees Term 2",
    picked: 1,
    reference: "STUDENT12347",
    source: "BANK_TRANSFER",
    status: "completed",
    transactionDate: "2024-03-12",
    studentName: "Michael",
    studentSurname: "Johnson",
    regNumber: "R12347"
  }
];

// Add more mock data for development (30 records)
for (let i = 0; i < 27; i++) {
  const id = `ALERT_${54324 + i}`;
  const regNumber = `R${12348 + i}`;
  const amount = 200 + Math.floor(Math.random() * 300);
  const names = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah"];
  const surnames = ["Wilson", "Brown", "Davis", "Miller", "Moore", "Taylor", "Anderson", "Thomas"];
  const name = names[Math.floor(Math.random() * names.length)];
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const dayOffset = i % 14;
  const picked = i % 3 === 0 ? 1 : 0;
  const status = picked ? "completed" : "pending";
  
  const dateObj = new Date(2024, 2, 13 + dayOffset);
  const transactionDate = `2024-03-${13 + dayOffset < 10 ? '0' : ''}${13 + dayOffset}`;
  
  mockPayments.push({
    id,
    amount,
    date: {
      date: dateObj.getDate(),
      day: dateObj.getDay(),
      hours: 10,
      minutes: 0,
      month: dateObj.getMonth(),
      nanos: 0,
      seconds: 0,
      time: dateObj.getTime(),
      timezoneOffset: 0,
      year: 124
    },
    narrative: `Student Fees ${i % 2 === 0 ? 'Term 1' : 'Term 2'}`,
    picked,
    reference: `STUDENT${12348 + i}`,
    source: "BANK_TRANSFER",
    status,
    transactionDate,
    studentName: name,
    studentSurname: surname,
    regNumber
  });
}

// Function to fetch payments based on search filters
export const fetchPayments = async (filters?: SearchFilters, credentials?: PickPaymentRequest): Promise<PaymentAlert[]> => {
  try {
    // If credentials are provided, try to get real payments from API
    if (credentials?.institutionId && credentials?.password) {
      const payments = await getAllPayments(credentials);
      return filterPayments(payments, filters);
    } else {
      try {
        // Try to get payments from local database first
        const localPayments = await getLocalPayments();
        return filterPayments(localPayments, filters);
      } catch (error) {
        console.error("Error fetching from local DB, using mock data:", error);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use mock data if local DB fails
        return filterPayments(mockPayments, filters);
      }
    }
  } catch (error) {
    console.error("Error fetching payments:", error);
    // Return filtered mock data as fallback
    return filterPayments(mockPayments, filters);
  }
};

// Helper function to filter payments
const filterPayments = (payments: PaymentAlert[], filters?: SearchFilters): PaymentAlert[] => {
  // If no filters, return all payments
  if (!filters) {
    return payments;
  }
  
  // Filter payments based on search criteria
  return payments.filter(payment => {
    const paymentDate = new Date(payment.transactionDate);
    
    // Filter by date range
    if (filters.startDate && paymentDate < filters.startDate) {
      return false;
    }
    if (filters.endDate) {
      const endDateCopy = new Date(filters.endDate);
      endDateCopy.setDate(endDateCopy.getDate() + 1); // Include the end date
      if (paymentDate > endDateCopy) {
        return false;
      }
    }
    
    // Filter by registration number
    if (filters.regNumber && !payment.regNumber?.toLowerCase().includes(filters.regNumber.toLowerCase())) {
      return false;
    }
    
    // Filter by amount range
    if (filters.minAmount !== undefined && payment.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount !== undefined && payment.amount > filters.maxAmount) {
      return false;
    }
    
    // Filter by student name
    if (filters.name && !payment.studentName?.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    
    // Filter by student surname
    if (filters.surname && !payment.studentSurname?.toLowerCase().includes(filters.surname.toLowerCase())) {
      return false;
    }
    
    return true;
  });
};

// Function to reset a payment (now uses the API)
export const resetPayment = async (paymentId: string): Promise<boolean> => {
  try {
    return await resetPaymentApi(paymentId);
  } catch (error) {
    console.error("Error resetting payment, falling back to mock:", error);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the payment in mock data and update it as fallback
    const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
    if (paymentIndex !== -1) {
      mockPayments[paymentIndex].picked = 0;
      mockPayments[paymentIndex].status = "pending";
      return true;
    }
    
    return false;
  }
};

// Function to pick all pending payments using real API
export const pickAllPendingPaymentsAPI = async (request: PickPaymentRequest): Promise<PaymentAlert[]> => {
  try {
    return await pickAllPendingPayments(request);
  } catch (error) {
    console.error("Error picking payments:", error);
    throw error;
  }
};

// Function to pick all  payments using real API
export const pickAllPaymentsAPI = async (request: PickPaymentRequest): Promise<PaymentAlert[]> => {
  try {
    return await getAllPayments(request);
  } catch (error) {
    console.error("Error picking payments:", error);
    throw error;
  }
};

// Function to export payments to specified format
export const exportPayments = (payments: PaymentAlert[], format: string): void => {
  if (format === 'csv') {
    exportToCSV(payments);
  } else if (format === 'excel') {
    exportToExcel(payments);
  } else if (format === 'pdf') {
    exportToPDF(payments);
  }
};

// Helper function to export to CSV
const exportToCSV = (payments: PaymentAlert[]): void => {
  const headers = [
    'ID', 'Amount', 'Date', 'Narrative', 'Picked', 'Reference', 
    'Source', 'Status', 'Transaction Date', 'Student Name', 'Student Surname', 'Reg Number'
  ];
  
  const csvRows = [
    headers.join(','),
    ...payments.map(payment => [
      payment.id,
      payment.amount,
      payment.transactionDate,
      `"${payment.narrative}"`,
      payment.picked,
      payment.reference,
      payment.source,
      payment.status,
      payment.transactionDate,
      `"${payment.studentName || ''}"`,
      `"${payment.studentSurname || ''}"`,
      payment.regNumber
    ].join(','))
  ];
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `student_payments_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to export to Excel (simplified)
const exportToExcel = (payments: PaymentAlert[]): void => {
  // In a real implementation, you would use a library like xlsx
  // For this demo, we'll just use CSV as a fallback
  exportToCSV(payments);
};

// Helper function to export to PDF (simplified)
const exportToPDF = (payments: PaymentAlert[]): void => {
  // In a real implementation, you would use a library like jsPDF
  // For this demo, we'll just show an alert
  alert('PDF export would be implemented here with a library like jsPDF');
};
