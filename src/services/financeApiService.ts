
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8080/api/finance";

// Generic fetch function with error handling
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    toast.error(error instanceof Error ? error.message : "Network error");
    throw error;
  }
}

// Fee management API functions
export async function getAllFees() {
  return fetchWithErrorHandling(`${API_BASE_URL}/fees`);
}

export async function getFeeById(id: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/fees/${id}`);
}

export async function getFeesByStudent(studentId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/fees/student/${studentId}`);
}

export async function getFeesByType(type: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/fees/type/${type}`);
}

export async function getFeesByStatus(status: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/fees/status/${status}`);
}

export async function getOverdueFees() {
  return fetchWithErrorHandling(`${API_BASE_URL}/fees/overdue`);
}

export async function createFee(fee: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/fees`, {
    method: "POST",
    body: JSON.stringify(fee),
  });
}

export async function updateFee(id: number, fee: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/fees/${id}`, {
    method: "PUT",
    body: JSON.stringify(fee),
  });
}

export async function processPayment(feeId: number, paymentMethod: string, transactionId: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/fees/${feeId}/payment?paymentMethod=${paymentMethod}&transactionId=${transactionId}`, {
    method: "POST",
  });
}

// Financial reporting API functions
export async function getFinancialSummary() {
  return fetchWithErrorHandling(`${API_BASE_URL}/reports/summary`);
}

export async function updateOverdueFees() {
  return fetchWithErrorHandling(`${API_BASE_URL}/maintenance/update-overdue`, {
    method: "POST",
  });
}
