
import { ApiResponse, ErrorDetails, PaymentAlert, PickPaymentRequest } from "@/types";
import { toast } from "sonner";

const API_BASE_URL = "https://zbnet.zb.co.zw";

// Helper function to extract student information from narrative
const extractStudentInfo = (payment: PaymentAlert): PaymentAlert => {
  const updatedPayment = { ...payment };
  
  // Extract student info from narrative or nr1 field
  if (payment.narrative) {
    const parts = payment.narrative.split('|');
    if (parts.length >= 3) {
      const studentFullName = payment.nr1 || parts[2] || '';
      const nameParts = studentFullName.trim().split(' ');
      
      if (nameParts.length > 0) {
        // Last part as surname, rest as first name
        updatedPayment.studentSurname = nameParts.pop() || '';
        updatedPayment.studentName = nameParts.join(' ');
      }
    }
  }
  
  // Use reference as registration number
  if (payment.reference) {
    updatedPayment.regNumber = payment.reference;
  }
  
  return updatedPayment;
};

// Generic fetch function with error handling
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    const status = response.status;
    
    if (status === 200) {
      const data = await response.json();
      return { data, status };
    } else {
      let error: ErrorDetails;
      try {
        error = await response.json();
      } catch (e) {
        error = {
          message: `Request failed with status ${status}`,
          timestamp: new Date().toISOString()
        };
      }
      
      // Show toast for error
      toast.error(error.message || "An error occurred");
      return { error, status };
    }
  } catch (error) {
    const errorDetails: ErrorDetails = {
      message: error instanceof Error ? error.message : "Network error",
      timestamp: new Date().toISOString()
    };
    
    // Show toast for network errors
    toast.error("Network error. Please check your connection.");
    return { error: errorDetails, status: 0 };
  }
}

// Function to pick all pending payments
export async function pickAllPendingPayments(
  request: PickPaymentRequest
): Promise<PaymentAlert[]> {
  const response = await fetchWithErrorHandling<PaymentAlert[]>(
    `${API_BASE_URL}/alerts/payments/pick-all-pending`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  
  if (response.data) {
    // Enhance payments with derived student information
    return response.data.map(payment => extractStudentInfo(payment));
  } else {
    throw new Error(response.error?.message || "Failed to fetch payments");
  }
}

// Function to get all payments for an institution (regardless of status)
export async function getAllPayments(
  request: PickPaymentRequest
): Promise<PaymentAlert[]> {
  const response = await fetchWithErrorHandling<PaymentAlert[]>(
    `${API_BASE_URL}/alerts/payments/all-payments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  
  if (response.data) {
    // Enhance payments with derived student information
    return response.data.map(payment => extractStudentInfo(payment));
  } else {
    throw new Error(response.error?.message || "Failed to fetch payments");
  }
}
