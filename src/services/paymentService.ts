// src/services/paymentService.ts

// FIX 1: Import the renamed 'SearchFiltersType' and other necessary types
import { PaymentAlert, SearchFiltersType } from "../types";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";

// The base URL for your backend API, defined once for easy maintenance.
const API_BASE_URL = "http://localhost:8082/api";

/**
 * A helper function for client-side filtering.
 * This is used for the data returned from the local database endpoint.
 */
const filterLocalPayments = (payments: PaymentAlert[], filters?: SearchFiltersType): PaymentAlert[] => {
  if (!filters) return payments;

  return payments.filter(payment => {
    let matches = true;

    // Filter by various fields if they exist in the filters object
    if (filters.regNumber && !payment.regNumber?.toLowerCase().includes(filters.regNumber.toLowerCase())) matches = false;
    if (filters.name && !payment.studentName?.toLowerCase().includes(filters.name.toLowerCase())) matches = false;
    if (filters.surname && !payment.studentSurname?.toLowerCase().includes(filters.surname.toLowerCase())) matches = false;
    if (filters.minAmount !== undefined && payment.amount < filters.minAmount) matches = false;
    if (filters.maxAmount !== undefined && payment.amount > filters.maxAmount) matches = false;

    // Filter by date range
    if (filters.startDate) {
      const paymentDate = new Date(payment.transactionDate);
      if (paymentDate < filters.startDate) matches = false;
    }
    if (filters.endDate) {
      const paymentDate = new Date(payment.transactionDate);
      const endDateCopy = new Date(filters.endDate);
      endDateCopy.setDate(endDateCopy.getDate() + 1);
      if (paymentDate >= endDateCopy) matches = false;
    }

    return matches;
  });
};

/**
 * Main function to fetch payments from the backend.
 * NO MOCK DATA is used.
 */
    // FIX 2: Use the renamed 'SearchFiltersType' in the function signature
export const fetchPayments = async (
        filters: SearchFiltersType,
        action: 'pending' | 'all',
        institutionIds?: string[]
    ): Promise<PaymentAlert[]> => {

      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error("Authentication token not found. Please log in again.");

      // --- SCENARIO 1: Remote Fetch from Bank Accounts ---
      if (institutionIds && institutionIds.length > 0) {
        const endpoint = action === 'all'
            ? `${API_BASE_URL}/payments/get-multiple-all`
            : `${API_BASE_URL}/payments/pick-multiple-pending`;

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ institutionIds })
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "An API error occurred." }));
            throw new Error(errorData.message);
          }
          // The backend's multi-account endpoints return pre-filtered data.
          // However, we apply client-side filters as well for consistency if needed.
          const remotePayments: PaymentAlert[] = await response.json();
          return filterLocalPayments(remotePayments, filters);

        } catch (error) {
          console.error(`Error fetching remote payments:`, error);
          throw error;
        }
      }

      // --- SCENARIO 2: Fallback to Local Database ---
      else {
        const localEndpoint = `${API_BASE_URL}/payments/local`;
        try {
          const response = await fetch(localEndpoint, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Could not fetch from local database." }));
            throw new Error(errorData.message);
          }

          const localPayments: PaymentAlert[] = await response.json();
          return filterLocalPayments(localPayments, filters);

        } catch (error) {
          console.error(`Error fetching local payments:`, error);
          throw error;
        }
      }
    };

/**
 * Resets a single payment on the backend.
 */
export const resetPayment = async (paymentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/reset/${paymentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
    });
    if (!response.ok) throw new Error("Failed to reset payment on the server.");
    return await response.json();
  } catch (error) {
    console.error("Error resetting payment:", error);
    throw error;
  }
};

/**
 * Calls the backend to reset ALL payments in the database to 'pending'.
 * @returns A promise that resolves to true if the operation was successful.
 */
export const resetAllPayments = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/reset-all`, {
      method: 'POST', // Match the @PostMapping on the backend
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to reset all payments on the server.");
    }
    return true;
  } catch (error) {
    console.error("Error resetting all payments:", error);
    throw error; // Re-throw to be handled by the UI component
  }
};


/**
 * A generic function to export payments to a specified format.
 */
export const exportPayments = (payments: PaymentAlert[], format: 'csv' | 'excel' | 'pdf'): void => {
  if (!payments || payments.length === 0) {
    console.warn("Export cancelled: No payment data to export.");
    return;
  }
  if (format === 'csv' || format === 'excel') {
    exportToCSV(payments);
  } else if (format === 'pdf') {
    exportToPDF(payments);
  }
};

// Helper function to export to CSV
const exportToCSV = (payments: PaymentAlert[]): void => {
  const headers = ['ID', 'Amount', 'Status', 'Transaction Date', 'Student Name', 'Reg Number', 'Reference', 'Narrative'];
  const csvRows = [
    headers.join(','),
    ...payments.map(p => [
      p.id, p.amount, p.status, p.transactionDate, `"${p.studentName || 'N/A'}"`,
      `"${p.regNumber || 'N/A'}"`, `"${p.reference || 'N/A'}"`, `"${p.narrative.replace(/"/g, '""')}"`
    ].join(','))
  ];
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `student_payments_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to export to PDF
const exportToPDF = (payments: PaymentAlert[]): void => {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.text('Payment Alerts Report', 14, 15);
  const head = [['Date', 'Student Name', 'Reg Number', 'Amount', 'Status', 'Narrative']];
  const body = payments.map(p => [
    p.transactionDate, p.studentName || 'N/A', p.regNumber || 'N/A',
    p.amount.toFixed(2), p.status, p.narrative,
  ]);
  autoTable(doc, {
    head: head, body: body, startY: 20,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: { 5: { cellWidth: 'auto' } }
  });
  doc.save('payment-alerts.pdf');
};