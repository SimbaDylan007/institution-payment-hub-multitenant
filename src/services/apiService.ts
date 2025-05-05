
import { ApiResponse, ErrorDetails, PaymentAlert, PickPaymentRequest } from "@/types";
import { toast } from "sonner";

// Now we're connecting to our Spring Boot backend instead of directly to ZB API
const API_BASE_URL = "http://localhost:8080/api/payments";

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

// Function to pick all pending payments - now connects to our Spring Boot backend
export async function pickAllPendingPayments(
  request: PickPaymentRequest
): Promise<PaymentAlert[]> {
  const response = await fetchWithErrorHandling<PaymentAlert[]>(
    `${API_BASE_URL}/pick-all-pending`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  
  if (response.data) {
    return response.data;
  } else {
    throw new Error(response.error?.message || "Failed to fetch payments");
  }
}

// Function to get all payments for an institution - now connects to our Spring Boot backend
export async function getAllPayments(
  request: PickPaymentRequest
): Promise<PaymentAlert[]> {
  const response = await fetchWithErrorHandling<PaymentAlert[]>(
    `${API_BASE_URL}/all-payments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  
  if (response.data) {
    return response.data;
  } else {
    throw new Error(response.error?.message || "Failed to fetch payments");
  }
}

// New function to reset a payment - connects to our Spring Boot backend
export async function resetPayment(paymentId: string): Promise<boolean> {
  const response = await fetchWithErrorHandling<boolean>(
    `${API_BASE_URL}/reset/${paymentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  
  if (response.data !== undefined) {
    return response.data;
  } else {
    throw new Error(response.error?.message || "Failed to reset payment");
  }
}

// Function to get payments from local database as fallback
export async function getLocalPayments(): Promise<PaymentAlert[]> {
  const response = await fetchWithErrorHandling<PaymentAlert[]>(
    `${API_BASE_URL}/local`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  
  if (response.data) {
    return response.data;
  } else {
    throw new Error(response.error?.message || "Failed to fetch local payments");
  }
}
